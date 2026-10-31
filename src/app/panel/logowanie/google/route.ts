import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection, type NextRequest } from "next/server";
import { googleClient, cookieOptions } from "@/lib/panel/google";
import { safeTarget, loginEnabled } from "@/lib/panel/accounts";

// Start of Google sign-in: state (CSRF protection) and the PKCE verifier in cookies for 10 minutes.
export async function GET(task: NextRequest) {
  // always at request time: otherwise the build would store the redirect for good (e.g. while the Google key is not set
  // yet)
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
