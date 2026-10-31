import "server-only";
import { Google } from "arctic";
import { SITE_URL } from "../config";

// Sign in with Google (OAuth 2.0 + PKCE). Keys from Google Cloud Console → „Credentials” → OAuth client ID (web
// application), redirect URI:
// klienta OAuth (aplikacja internetowa). Dozwolone adresy przekierowania:
// https://szamanie.pl/panel/logowanie/google/powrot and locally http://localhost:3001/panel/logowanie/google/powrot

export const GOOGLE_COOKIES = ["google_stan", "google_weryfikator", "google_dalej"] as const;
export const GOOGLE_PATH = "/panel/logowanie/google";

export function googleClient(task: Request) {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) return null;
  // on the server behind Caddy the request URL is http://app:3000, so we use the fixed site URL
  const database = process.env.NODE_ENV === "production" ? SITE_URL : new URL(task.url).origin;
  return new Google(id, secret, `${database}${GOOGLE_PATH}/powrot`);
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: GOOGLE_PATH,
  maxAge: 10 * 60,
};
