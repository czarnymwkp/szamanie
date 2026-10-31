"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/config";
import { personAccount, loginEnabled, venueToClaim, newLink, validEmail, requireAdmin } from "@/lib/panel/accounts";
import { sendToOwner } from "@/lib/panel/mail";

/** Accepting or rejecting a „to mój lokal” claim (after calling the venue's number). */
export async function reviewClaim(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const decision = formData.get("decyzja") === "przyjete" ? "przyjete" : "odrzucone";
  const note = String(formData.get("notatka") ?? "").trim().slice(0, 300) || null;
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
    decision,
    note,
    id,
  );
  if (decision === "przyjete") {
    // a claim sent without signing in has no account — it is created now; the admin sends the panel link from the „Kto
    // zarządza” list
    const account = z.konto_id ?? personAccount(z.imie, z.telefon, z.email);
    db.prepare("UPDATE zgloszenia SET konto_id = ? WHERE id = ?").run(account, id);
    db.prepare("INSERT OR IGNORE INTO lokale_konta (lokal_id, konto_id) VALUES (?, ?)").run(z.lokal_id, account);
    if (loginEnabled() && z.email) {
      await sendToOwner(
        z.email,
        `${z.nazwa} — masz dostęp do panelu szamanie.pl`,
        [
          `Potwierdziliśmy, że zarządzasz lokalem ${z.nazwa}.`,
          "",
          "W panelu zmienisz menu i ceny, godziny otwarcia, dane kontaktowe i dodasz promocje:",
          `${SITE_URL}/panel/${z.slug}`,
        ].join("\n"),
      ).catch((error) => console.error("[panel] mail do właściciela:", error));
    }
  }
  revalidatePath("/panel/admin");
}

/** Revokes access to a venue; an account left without any venue also loses its link and sessions. */
export async function revokeAccess(formData: FormData) {
  await requireAdmin();
  const venue = Number(formData.get("lokal"));
  const account = Number(formData.get("konto"));
  db.prepare("DELETE FROM lokale_konta WHERE lokal_id = ? AND konto_id = ?").run(venue, account);
  const keeps = db
    .prepare("SELECT 1 FROM konta WHERE id = ? AND (rola = 'admin' OR id IN (SELECT konto_id FROM lokale_konta))")
    .get(account);
  if (!keeps) {
    db.prepare("UPDATE konta SET link = NULL WHERE id = ?").run(account);
    db.prepare("DELETE FROM sesje WHERE konto_id = ?").run(account);
  }
  revalidatePath("/panel", "layout");
}

/** New panel link for an account — returns the path, the browser builds the URL with the domain. */
export async function newPanelLink(account: number) {
  await requireAdmin();
  const path = newLink(account);
  revalidatePath("/panel", "layout");
  return path;
}

export type PersonState = { blad?: string; sciezka?: string; telefon?: string };

/** Venue access without a claim (e.g. after talking to the owner) — with a panel link right away. */
export async function addPerson(slug: string, _: PersonState, formData: FormData): Promise<PersonState> {
  await requireAdmin();
  const venue = venueToClaim(slug);
  if (!venue) return { blad: "Nie ma takiego lokalu." };
  const name = String(formData.get("imie") ?? "").trim().slice(0, 80);
  const phone = String(formData.get("telefon") ?? "").trim().slice(0, 40);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200) || null;
  if (!name) return { blad: "Podaj imię." };
  if (phone.replace(/\D/g, "").length < 9) return { blad: "Podaj numer telefonu (9 cyfr) — na niego wyślesz link." };
  if (email && !validEmail(email)) return { blad: "To nie wygląda na adres e-mail." };

  const account = personAccount(name, phone, email);
  db.prepare("INSERT OR IGNORE INTO lokale_konta (lokal_id, konto_id) VALUES (?, ?)").run(venue.id, account);
  const path = newLink(account);
  revalidatePath("/panel", "layout");
  return { sciezka: path, telefon: phone };
}
