"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ADRES_SERWISU } from "@/lib/konfiguracja";
import { wymagajAdmina } from "@/lib/panel/konta";
import { wyslijDoWlasciciela } from "@/lib/panel/poczta";

/** Przyjęcie albo odrzucenie zgłoszenia „to mój lokal” (po telefonie na numer lokalu). */
export async function rozpatrzZgloszenie(formData: FormData) {
  await wymagajAdmina();
  const id = Number(formData.get("id"));
  const decyzja = formData.get("decyzja") === "przyjete" ? "przyjete" : "odrzucone";
  const notatka = String(formData.get("notatka") ?? "").trim().slice(0, 300) || null;
  const z = db
    .prepare(
      `SELECT z.lokal_id, z.konto_id, k.email, l.nazwa, l.slug FROM zgloszenia z
       JOIN konta k ON k.id = z.konto_id JOIN lokale l ON l.id = z.lokal_id
       WHERE z.id = ? AND z.status = 'nowe'`,
    )
    .get(id) as { lokal_id: number; konto_id: number; email: string; nazwa: string; slug: string } | undefined;
  if (!z) return;

  db.prepare("UPDATE zgloszenia SET status = ?, notatka = ?, rozpatrzono = datetime('now') WHERE id = ?").run(
    decyzja,
    notatka,
    id,
  );
  if (decyzja === "przyjete") {
    db.prepare("INSERT OR IGNORE INTO lokale_konta (lokal_id, konto_id) VALUES (?, ?)").run(z.lokal_id, z.konto_id);
    await wyslijDoWlasciciela(
      z.email,
      `${z.nazwa} — masz dostęp do panelu szamanie.pl`,
      [
        `Potwierdziliśmy, że zarządzasz lokalem ${z.nazwa}.`,
        "",
        "W panelu zmienisz menu i ceny, godziny otwarcia, dane kontaktowe i dodasz promocje:",
        `${ADRES_SERWISU}/panel/${z.slug}`,
      ].join("\n"),
    ).catch((blad) => console.error("[panel] mail do właściciela:", blad));
  }
  revalidatePath("/panel/admin");
}

export async function odbierzDostep(formData: FormData) {
  await wymagajAdmina();
  db.prepare("DELETE FROM lokale_konta WHERE lokal_id = ? AND konto_id = ?").run(
    Number(formData.get("lokal")),
    Number(formData.get("konto")),
  );
  revalidatePath("/panel/admin");
}
