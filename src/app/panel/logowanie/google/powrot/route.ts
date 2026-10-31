import { decodeIdToken } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { GOOGLE_COOKIES, googleClient, cookieOptions } from "@/lib/panel/google";
import { safeTarget, externalAccount, loginEnabled, loginAccount } from "@/lib/panel/accounts";

type Data = { iss?: string; aud?: string; sub?: string; email?: string; email_verified?: boolean; name?: string };

// Return from Google. The ID token comes straight from Google's server (HTTPS, with our secret), so it is enough to
// check that Google issued it for our client (OpenID Connect Core 3.1.3.7).
export async function GET(task: NextRequest) {
  const params = task.nextUrl.searchParams;
  const jar = await cookies();
  const [stan, weryfikator, dalej] = GOOGLE_COOKIES.map((n) => jar.get(n)?.value);
  for (const n of GOOGLE_COOKIES) jar.set(n, "", { ...cookieOptions, maxAge: 0 });

  const google = loginEnabled() ? googleClient(task) : null;
  const code = params.get("code");
  if (!google || !code || !stan || !weryfikator || params.get("state") !== stan) redirect("/panel/logowanie?blad=google");

  let date: Data | null = null;
  try {
    const tokens = await google.validateAuthorizationCode(code, weryfikator);
    date = decodeIdToken(tokens.idToken()) as Data;
  } catch (error) {
    console.error("[panel] logowanie Google:", error);
  }
  const issuer = date?.iss === "https://accounts.google.com" || date?.iss === "accounts.google.com";
  if (!date?.sub || !issuer || date.aud !== process.env.GOOGLE_CLIENT_ID) redirect("/panel/logowanie?blad=google");
  if (!date.email || date.email_verified !== true) redirect("/panel/logowanie?blad=google-email");

  await loginAccount(externalAccount("google", date.sub, date.email, date.name ?? null));
  redirect(safeTarget(dalej));
}
