"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  adresIp,
  kontoPoLinku,
  lokalDoPrzejecia,
  lokaleKonta,
  pobierzKonto,
  poprawnyEmail,
  wylogujKonto,
  zalogujKonto,
} from "@/lib/panel/konta";
import { powiadomAdmina } from "@/lib/panel/poczta";
import { ADRES_SERWISU } from "@/lib/konfiguracja";

export async function wyloguj() {
  await wylogujKonto();
  redirect("/panel");
}

/** Wejście prywatnym linkiem: sesja dopiero po kliknięciu „Wejdź do panelu” (POST), nie przy samym otwarciu linku. */
export async function wejdzLinkiem(token: string) {
  const konto = kontoPoLinku(token);
  if (!konto) redirect("/panel?link=nieaktywny");
  await zalogujKonto(konto);
  const lokale = lokaleKonta(konto);
  redirect(lokale.length === 1 ? `/panel/${lokale[0].slug}` : "/panel");
}

export type StanZgloszenia = { blad?: string };

const ROLE = ["właściciel", "menedżer", "pracownik"];
// zgłoszenie wysyła się bez logowania — limit na adres IP, żeby nikt nie zasypał listy admina
const ZGLOSZEN_NA_GODZINE_Z_IP = 5;
const zgloszeniaZIp = new Map<string, number[]>();

/** „To mój lokal” — prośba o dostęp do lokalu; admin potwierdza ją telefonicznie na numer lokalu i wysyła link. */
export async function zglosLokal(slug: string, _: StanZgloszenia, formData: FormData): Promise<StanZgloszenia> {
  const konto = await pobierzKonto();
  const lokal = lokalDoPrzejecia(slug);
  if (!lokal) return { blad: "Nie znaleźliśmy tego lokalu." };
  // pole ukryte przed ludźmi — wypełniają je tylko boty
  if (formData.get("strona")) redirect("/panel?zgloszono=1");

  const imie = String(formData.get("imie") ?? "").trim().slice(0, 80);
  const telefon = String(formData.get("telefon") ?? "").trim().slice(0, 40);
  const email = konto?.email ?? (String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200) || null);
  const rola = String(formData.get("rola") ?? "");
  const wiadomosc = String(formData.get("wiadomosc") ?? "").trim().slice(0, 600) || null;
  if (!imie) return { blad: "Podaj imię i nazwisko." };
  if (telefon.replace(/\D/g, "").length < 9) return { blad: "Podaj numer telefonu (9 cyfr) — na niego wyślemy link do panelu." };
  if (email && !poprawnyEmail(email)) return { blad: "To nie wygląda na adres e-mail. Możesz też zostawić to pole puste." };
  if (!ROLE.includes(rola)) return { blad: "Wybierz, kim jesteś w lokalu." };
  if (formData.get("oswiadczenie") !== "tak") return { blad: "Potwierdź, że możesz zarządzać tym lokalem." };

  const ip = await adresIp();
  const teraz = Date.now();
  const ostatnie = (zgloszeniaZIp.get(ip) ?? []).filter((t) => teraz - t < 60 * 60 * 1000);
  if (ostatnie.length >= ZGLOSZEN_NA_GODZINE_Z_IP) return { blad: "Za dużo zgłoszeń. Spróbuj ponownie za godzinę." };

  const cyfry = telefon.replace(/\D/g, "").slice(-9);
  const juz = (
    db.prepare("SELECT konto_id, telefon FROM zgloszenia WHERE lokal_id = ? AND status = 'nowe'").all(lokal.id) as {
      konto_id: number | null;
      telefon: string;
    }[]
  ).some((z) => (konto && z.konto_id === konto.id) || z.telefon.replace(/\D/g, "").slice(-9) === cyfry);
  if (!juz) {
    zgloszeniaZIp.set(ip, [...ostatnie, teraz]);
    db.prepare(
      "INSERT INTO zgloszenia (lokal_id, konto_id, imie, telefon, email, rola, wiadomosc) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(lokal.id, konto?.id ?? null, imie, telefon, email, rola, wiadomosc);
    if (konto && !konto.imie) db.prepare("UPDATE konta SET imie = ? WHERE id = ?").run(imie, konto.id);
    await powiadomAdmina(
      `Nowe zgłoszenie lokalu: ${lokal.nazwa}`,
      [
        `${imie} (${rola}), tel. ${telefon}${email ? `, ${email}` : ""}`,
        `Lokal: ${lokal.nazwa}${lokal.adres ? `, ${lokal.adres}` : ""}`,
        wiadomosc ? `Wiadomość: ${wiadomosc}` : "",
        "",
        `Zgłoszenia: ${ADRES_SERWISU}/panel/admin`,
      ].join("\n"),
    ).catch((blad) => console.error("[panel] powiadomienie admina:", blad));
  }
  redirect("/panel?zgloszono=1");
}
