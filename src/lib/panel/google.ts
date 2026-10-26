import "server-only";
import { Google } from "arctic";
import { ADRES_SERWISU } from "../konfiguracja";

// Logowanie przez Google (OAuth 2.0 + PKCE). Klucze z Google Cloud Console → „Dane logowania” → identyfikator
// klienta OAuth (aplikacja internetowa). Dozwolone adresy przekierowania:
//   https://szamanie.pl/panel/logowanie/google/powrot  i lokalnie  http://localhost:3001/panel/logowanie/google/powrot

export const CIASTECZKA_GOOGLE = ["google_stan", "google_weryfikator", "google_dalej"] as const;
export const SCIEZKA_GOOGLE = "/panel/logowanie/google";

export function klientGoogle(zadanie: Request) {
  const id = process.env.GOOGLE_CLIENT_ID;
  const sekret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !sekret) return null;
  // na serwerze za Caddy adres żądania to http://app:3000, więc stały adres serwisu
  const baza = process.env.NODE_ENV === "production" ? ADRES_SERWISU : new URL(zadanie.url).origin;
  return new Google(id, sekret, `${baza}${SCIEZKA_GOOGLE}/powrot`);
}

export const opcjeCiasteczka = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: SCIEZKA_GOOGLE,
  maxAge: 10 * 60,
};
