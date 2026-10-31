"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  ipAddress,
  accountByLink,
  venueToClaim,
  accountVenues,
  getAccount,
  validEmail,
  logoutAccount,
  loginAccount,
} from "@/lib/panel/konta";
import { notifyAdmin } from "@/lib/panel/poczta";
import { SITE_URL } from "@/lib/konfiguracja";

export async function logout() {
  await logoutAccount();
  redirect("/panel");
}

/** Wejście prywatnym linkiem: sesja dopiero po kliknięciu „Wejdź do panelu” (POST), nie przy samym otwarciu linku. */
export async function enterWithLink(token: string) {
  const account = accountByLink(token);
  if (!account) redirect("/panel?link=nieaktywny");
  await loginAccount(account);
  const venues = accountVenues(account);
  redirect(venues.length === 1 ? `/panel/${venues[0].slug}` : "/panel");
}

export type ClaimState = { blad?: string };

const ROLES = ["właściciel", "menedżer", "pracownik"];
// zgłoszenie wysyła się bez logowania — limit na adres IP, żeby nikt nie zasypał listy admina
const CLAIMS_PER_HOUR_PER_IP = 5;
const claimsFromIp = new Map<string, number[]>();

/** „To mój lokal” — prośba o dostęp do lokalu; admin potwierdza ją telefonicznie na numer lokalu i wysyła link. */
export async function claimVenue(slug: string, _: ClaimState, formData: FormData): Promise<ClaimState> {
  const account = await getAccount();
  const venue = venueToClaim(slug);
  if (!venue) return { blad: "Nie znaleźliśmy tego lokalu." };
  // pole ukryte przed ludźmi — wypełniają je tylko boty
  if (formData.get("strona")) redirect("/panel?zgloszono=1");

  const name = String(formData.get("imie") ?? "").trim().slice(0, 80);
  const phone = String(formData.get("telefon") ?? "").trim().slice(0, 40);
  const email = account?.email ?? (String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200) || null);
  const role = String(formData.get("rola") ?? "");
  const message = String(formData.get("wiadomosc") ?? "").trim().slice(0, 600) || null;
  if (!name) return { blad: "Podaj imię i nazwisko." };
  if (phone.replace(/\D/g, "").length < 9) return { blad: "Podaj numer telefonu (9 cyfr) — na niego wyślemy link do panelu." };
  if (email && !validEmail(email)) return { blad: "To nie wygląda na adres e-mail. Możesz też zostawić to pole puste." };
  if (!ROLES.includes(role)) return { blad: "Wybierz, kim jesteś w lokalu." };
  if (formData.get("oswiadczenie") !== "tak") return { blad: "Potwierdź, że możesz zarządzać tym lokalem." };

  const ip = await ipAddress();
  const now = Date.now();
  const latest = (claimsFromIp.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (latest.length >= CLAIMS_PER_HOUR_PER_IP) return { blad: "Za dużo zgłoszeń. Spróbuj ponownie za godzinę." };

  const digits = phone.replace(/\D/g, "").slice(-9);
  const already = (
    db.prepare("SELECT konto_id, telefon FROM zgloszenia WHERE lokal_id = ? AND status = 'nowe'").all(venue.id) as {
      konto_id: number | null;
      telefon: string;
    }[]
  ).some((z) => (account && z.konto_id === account.id) || z.telefon.replace(/\D/g, "").slice(-9) === digits);
  if (!already) {
    claimsFromIp.set(ip, [...latest, now]);
    db.prepare(
      "INSERT INTO zgloszenia (lokal_id, konto_id, imie, telefon, email, rola, wiadomosc) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(venue.id, account?.id ?? null, name, phone, email, role, message);
    if (account && !account.imie) db.prepare("UPDATE konta SET imie = ? WHERE id = ?").run(name, account.id);
    await notifyAdmin(
      `Nowe zgłoszenie lokalu: ${venue.nazwa}`,
      [
        `${name} (${role}), tel. ${phone}${email ? `, ${email}` : ""}`,
        `Lokal: ${venue.nazwa}${venue.adres ? `, ${venue.adres}` : ""}`,
        message ? `Wiadomość: ${message}` : "",
        "",
        `Zgłoszenia: ${SITE_URL}/panel/admin`,
      ].join("\n"),
    ).catch((error) => console.error("[panel] powiadomienie admina:", error));
  }
  redirect("/panel?zgloszono=1");
}
