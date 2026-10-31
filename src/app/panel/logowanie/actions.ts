"use server";

import { redirect } from "next/navigation";
import { newCode, checkCode } from "@/lib/panel/codes";
import {
  ipAddress,
  safeTarget,
  accountByEmail,
  loginEnabled,
  normalizeEmail,
  validEmail,
  loginAccount,
} from "@/lib/panel/accounts";
import { sendLoginCode } from "@/lib/panel/mail";

export type LoginState = { krok: "email" | "kod"; email: string; blad?: string; info?: string };

/** Jeden formularz w dwóch krokach: „wyslij” — kod na e-mail, „zaloguj” — sprawdzenie kodu. */
export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  if (!loginEnabled()) redirect("/panel");
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const action = formData.get("akcja");

  if (action === "zaloguj") {
    const result = checkCode(email, String(formData.get("kod") ?? ""));
    if (result === "zly") return { krok: "kod", email, blad: "Nieprawidłowy kod. Sprawdź i wpisz jeszcze raz." };
    if (result === "za-duzo") return { krok: "email", email, blad: "Za dużo błędnych prób. Poproś o nowy kod." };
    if (result === "wygasl") return { krok: "email", email, blad: "Kod wygasł. Poproś o nowy." };
    await loginAccount(accountByEmail(email));
    redirect(safeTarget(formData.get("dalej")));
  }

  const again = action === "ponownie";
  if (!validEmail(email)) return { krok: "email", email, blad: "Wpisz poprawny adres e-mail." };
  const outcome = newCode(email, await ipAddress());
  if ("blad" in outcome) {
    return outcome.juzWyslany
      ? { krok: "kod", email, info: outcome.blad }
      : { krok: again ? "kod" : "email", email, blad: outcome.blad };
  }
  try {
    await sendLoginCode(email, outcome.kod);
  } catch (error) {
    console.error("[panel] wysyłka kodu:", error);
    return { krok: "email", email, blad: "Nie udało się wysłać maila. Spróbuj za chwilę." };
  }
  // lokalny podgląd bez skrzynki pocztowej: kod na ekranie (na serwerze — nigdy, tam bez SMTP jest tylko w logach)
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    return { krok: "kod", email, info: `Podgląd lokalny bez poczty — Twój kod: ${outcome.kod}` };
  }
  return { krok: "kod", email, info: again ? "Wysłaliśmy nowy kod." : undefined };
}
