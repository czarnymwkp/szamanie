"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { lokalDoPrzejecia, wylogujKonto, wymagajKonta } from "@/lib/panel/konta";
import { powiadomAdmina } from "@/lib/panel/poczta";
import { ADRES_SERWISU } from "@/lib/konfiguracja";

export async function wyloguj() {
  await wylogujKonto();
  redirect("/panel/logowanie");
}

export type StanZgloszenia = { blad?: string };

const ROLE = ["właściciel", "menedżer", "pracownik"];

/** „To mój lokal” — prośba o dostęp do lokalu; admin potwierdza ją telefonicznie na numer lokalu. */
export async function zglosLokal(slug: string, _: StanZgloszenia, formData: FormData): Promise<StanZgloszenia> {
  const konto = await wymagajKonta(`/panel/przejmij/${slug}`);
  const lokal = lokalDoPrzejecia(slug);
  if (!lokal) return { blad: "Nie znaleźliśmy tego lokalu." };

  const imie = String(formData.get("imie") ?? "").trim().slice(0, 80);
  const telefon = String(formData.get("telefon") ?? "").trim().slice(0, 40);
  const rola = String(formData.get("rola") ?? "");
  const wiadomosc = String(formData.get("wiadomosc") ?? "").trim().slice(0, 600) || null;
  if (!imie) return { blad: "Podaj imię i nazwisko." };
  if (telefon.replace(/\D/g, "").length < 9) return { blad: "Podaj numer telefonu (9 cyfr), żebyśmy mogli potwierdzić." };
  if (!ROLE.includes(rola)) return { blad: "Wybierz, kim jesteś w lokalu." };
  if (formData.get("oswiadczenie") !== "tak") return { blad: "Potwierdź, że możesz zarządzać tym lokalem." };

  const juz = db
    .prepare("SELECT 1 FROM zgloszenia WHERE lokal_id = ? AND konto_id = ? AND status = 'nowe'")
    .get(lokal.id, konto.id);
  if (!juz) {
    db.prepare(
      "INSERT INTO zgloszenia (lokal_id, konto_id, imie, telefon, rola, wiadomosc) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(lokal.id, konto.id, imie, telefon, rola, wiadomosc);
    if (!konto.imie) db.prepare("UPDATE konta SET imie = ? WHERE id = ?").run(imie, konto.id);
    await powiadomAdmina(
      `Nowe zgłoszenie lokalu: ${lokal.nazwa}`,
      [
        `${imie} (${rola}), tel. ${telefon}, ${konto.email}`,
        `Lokal: ${lokal.nazwa}${lokal.adres ? `, ${lokal.adres}` : ""}`,
        wiadomosc ? `Wiadomość: ${wiadomosc}` : "",
        "",
        `Zgłoszenia: ${ADRES_SERWISU}/panel/admin`,
      ].join("\n"),
    ).catch((blad) => console.error("[panel] powiadomienie admina:", blad));
  }
  redirect("/panel?zgloszono=1");
}
