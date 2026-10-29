"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/konfiguracja";
import { kontoOsoby, logowanieWlaczone, lokalDoPrzejecia, nowyLink, poprawnyEmail, wymagajAdmina } from "@/lib/panel/konta";
import { wyslijDoWlasciciela } from "@/lib/panel/poczta";

/** Przyjęcie albo odrzucenie zgłoszenia „to mój lokal” (po telefonie na numer lokalu). */
export async function rozpatrzZgloszenie(formData: FormData) {
  await wymagajAdmina();
  const id = Number(formData.get("id"));
  const decyzja = formData.get("decyzja") === "przyjete" ? "przyjete" : "odrzucone";
  const notatka = String(formData.get("notatka") ?? "").trim().slice(0, 300) || null;
  const z = db
    .prepare(
      `SELECT z.lokal_id, z.konto_id, z.imie, z.telefon, coalesce(z.email, k.email) AS email, l.nazwa, l.slug
       FROM zgloszenia z LEFT JOIN konta k ON k.id = z.konto_id JOIN lokale l ON l.id = z.lokal_id
       WHERE z.id = ? AND z.status = 'nowe'`,
    )
    .get(id) as
    | { lokal_id: number; konto_id: number | null; imie: string; telefon: string; email: string | null; nazwa: string; slug: string }
    | undefined;
  if (!z) return;

  db.prepare("UPDATE zgloszenia SET status = ?, notatka = ?, rozpatrzono = datetime('now') WHERE id = ?").run(
    decyzja,
    notatka,
    id,
  );
  if (decyzja === "przyjete") {
    // zgłoszenie bez logowania nie ma konta — powstaje teraz; link do panelu admin wysyła z listy „Kto zarządza”
    const konto = z.konto_id ?? kontoOsoby(z.imie, z.telefon, z.email);
    db.prepare("UPDATE zgloszenia SET konto_id = ? WHERE id = ?").run(konto, id);
    db.prepare("INSERT OR IGNORE INTO lokale_konta (lokal_id, konto_id) VALUES (?, ?)").run(z.lokal_id, konto);
    if (logowanieWlaczone() && z.email) {
      await wyslijDoWlasciciela(
        z.email,
        `${z.nazwa} — masz dostęp do panelu szamanie.pl`,
        [
          `Potwierdziliśmy, że zarządzasz lokalem ${z.nazwa}.`,
          "",
          "W panelu zmienisz menu i ceny, godziny otwarcia, dane kontaktowe i dodasz promocje:",
          `${SITE_URL}/panel/${z.slug}`,
        ].join("\n"),
      ).catch((blad) => console.error("[panel] mail do właściciela:", blad));
    }
  }
  revalidatePath("/panel/admin");
}

/** Odbiera dostęp do lokalu; konto bez żadnego lokalu traci też link i sesje. */
export async function odbierzDostep(formData: FormData) {
  await wymagajAdmina();
  const lokal = Number(formData.get("lokal"));
  const konto = Number(formData.get("konto"));
  db.prepare("DELETE FROM lokale_konta WHERE lokal_id = ? AND konto_id = ?").run(lokal, konto);
  const zostaje = db
    .prepare("SELECT 1 FROM konta WHERE id = ? AND (rola = 'admin' OR id IN (SELECT konto_id FROM lokale_konta))")
    .get(konto);
  if (!zostaje) {
    db.prepare("UPDATE konta SET link = NULL WHERE id = ?").run(konto);
    db.prepare("DELETE FROM sesje WHERE konto_id = ?").run(konto);
  }
  revalidatePath("/panel", "layout");
}

/** Nowy link do panelu dla konta — zwraca ścieżkę, adres z domeną składa przeglądarka. */
export async function nowyLinkDoPanelu(konto: number) {
  await wymagajAdmina();
  const sciezka = nowyLink(konto);
  revalidatePath("/panel", "layout");
  return sciezka;
}

export type StanOsoby = { blad?: string; sciezka?: string; telefon?: string };

/** Dostęp do lokalu bez zgłoszenia (np. po rozmowie z właścicielem) — od razu z linkiem do panelu. */
export async function dodajOsobe(slug: string, _: StanOsoby, formData: FormData): Promise<StanOsoby> {
  await wymagajAdmina();
  const lokal = lokalDoPrzejecia(slug);
  if (!lokal) return { blad: "Nie ma takiego lokalu." };
  const imie = String(formData.get("imie") ?? "").trim().slice(0, 80);
  const telefon = String(formData.get("telefon") ?? "").trim().slice(0, 40);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200) || null;
  if (!imie) return { blad: "Podaj imię." };
  if (telefon.replace(/\D/g, "").length < 9) return { blad: "Podaj numer telefonu (9 cyfr) — na niego wyślesz link." };
  if (email && !poprawnyEmail(email)) return { blad: "To nie wygląda na adres e-mail." };

  const konto = kontoOsoby(imie, telefon, email);
  db.prepare("INSERT OR IGNORE INTO lokale_konta (lokal_id, konto_id) VALUES (?, ?)").run(lokal.id, konto);
  const sciezka = nowyLink(konto);
  revalidatePath("/panel", "layout");
  return { sciezka, telefon };
}
