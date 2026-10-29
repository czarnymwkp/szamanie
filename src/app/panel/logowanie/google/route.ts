import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection, type NextRequest } from "next/server";
import { klientGoogle, opcjeCiasteczka } from "@/lib/panel/google";
import { bezpiecznyCel, logowanieWlaczone } from "@/lib/panel/konta";

// Start logowania przez Google: stan (ochrona przed CSRF) i weryfikator PKCE w ciasteczkach na 10 minut.
export async function GET(zadanie: NextRequest) {
  // zawsze przy żądaniu: bez tego build zapisałby przekierowanie na stałe (np. gdy klucza Google jeszcze nie ma)
  await connection();
  const google = logowanieWlaczone() ? klientGoogle(zadanie) : null;
  if (!google) redirect("/panel/logowanie");

  const stan = generateState();
  const weryfikator = generateCodeVerifier();
  const url = google.createAuthorizationURL(stan, weryfikator, ["openid", "email", "profile"]);
  url.searchParams.set("prompt", "select_account");

  const sloik = await cookies();
  sloik.set("google_stan", stan, opcjeCiasteczka);
  sloik.set("google_weryfikator", weryfikator, opcjeCiasteczka);
  sloik.set("google_dalej", bezpiecznyCel(zadanie.nextUrl.searchParams.get("dalej")), opcjeCiasteczka);
  redirect(url.toString());
}
