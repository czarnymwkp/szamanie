import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection, type NextRequest } from "next/server";
import { googleClient, cookieOptions } from "@/lib/panel/google";
import { safeTarget, loginEnabled } from "@/lib/panel/accounts";

// Start logowania przez Google: stan (ochrona przed CSRF) i weryfikator PKCE w ciasteczkach na 10 minut.
export async function GET(task: NextRequest) {
  // zawsze przy żądaniu: bez tego build zapisałby przekierowanie na stałe (np. gdy klucza Google jeszcze nie ma)
  await connection();
  const google = loginEnabled() ? googleClient(task) : null;
  if (!google) redirect("/panel/logowanie");

  const state = generateState();
  const verifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, verifier, ["openid", "email", "profile"]);
  url.searchParams.set("prompt", "select_account");

  const jar = await cookies();
  jar.set("google_stan", state, cookieOptions);
  jar.set("google_weryfikator", verifier, cookieOptions);
  jar.set("google_dalej", safeTarget(task.nextUrl.searchParams.get("dalej")), cookieOptions);
  redirect(url.toString());
}
