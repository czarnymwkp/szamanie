"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { nowyKod, sprawdzKod } from "@/lib/panel/kody";
import { bezpiecznyCel, kontoPoEmailu, normalizujEmail, poprawnyEmail, zalogujKonto } from "@/lib/panel/konta";
import { wyslijKodLogowania } from "@/lib/panel/poczta";

export type StanLogowania = { krok: "email" | "kod"; email: string; blad?: string; info?: string };

async function adresIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "lokalnie";
}

/** Jeden formularz w dwóch krokach: „wyslij” — kod na e-mail, „zaloguj” — sprawdzenie kodu. */
export async function logowanie(_: StanLogowania, formData: FormData): Promise<StanLogowania> {
  const email = normalizujEmail(String(formData.get("email") ?? ""));
  const akcja = formData.get("akcja");

  if (akcja === "zaloguj") {
    const wynik = sprawdzKod(email, String(formData.get("kod") ?? ""));
    if (wynik === "zly") return { krok: "kod", email, blad: "Nieprawidłowy kod. Sprawdź i wpisz jeszcze raz." };
    if (wynik === "za-duzo") return { krok: "email", email, blad: "Za dużo błędnych prób. Poproś o nowy kod." };
    if (wynik === "wygasl") return { krok: "email", email, blad: "Kod wygasł. Poproś o nowy." };
    await zalogujKonto(kontoPoEmailu(email));
    redirect(bezpiecznyCel(formData.get("dalej")));
  }

  const ponownie = akcja === "ponownie";
  if (!poprawnyEmail(email)) return { krok: "email", email, blad: "Wpisz poprawny adres e-mail." };
  const wynik = nowyKod(email, await adresIp());
  if ("blad" in wynik) {
    return wynik.juzWyslany
      ? { krok: "kod", email, info: wynik.blad }
      : { krok: ponownie ? "kod" : "email", email, blad: wynik.blad };
  }
  try {
    await wyslijKodLogowania(email, wynik.kod);
  } catch (blad) {
    console.error("[panel] wysyłka kodu:", blad);
    return { krok: "email", email, blad: "Nie udało się wysłać maila. Spróbuj za chwilę." };
  }
  // lokalny podgląd bez skrzynki pocztowej: kod na ekranie (na serwerze — nigdy, tam bez SMTP jest tylko w logach)
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    return { krok: "kod", email, info: `Podgląd lokalny bez poczty — Twój kod: ${wynik.kod}` };
  }
  return { krok: "kod", email, info: ponownie ? "Wysłaliśmy nowy kod." : undefined };
}
