import { decodeIdToken } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { CIASTECZKA_GOOGLE, klientGoogle, opcjeCiasteczka } from "@/lib/panel/google";
import { bezpiecznyCel, kontoZewnetrzne, logowanieWlaczone, zalogujKonto } from "@/lib/panel/konta";

type Dane = { iss?: string; aud?: string; sub?: string; email?: string; email_verified?: boolean; name?: string };

// Powrót z Google. Token ID przychodzi prosto z serwera Google (HTTPS, z naszym sekretem), więc wystarczy sprawdzić,
// że jest wystawiony przez Google dla naszego klienta (OpenID Connect Core 3.1.3.7).
export async function GET(zadanie: NextRequest) {
  const parametry = zadanie.nextUrl.searchParams;
  const sloik = await cookies();
  const [stan, weryfikator, dalej] = CIASTECZKA_GOOGLE.map((n) => sloik.get(n)?.value);
  for (const n of CIASTECZKA_GOOGLE) sloik.set(n, "", { ...opcjeCiasteczka, maxAge: 0 });

  const google = logowanieWlaczone() ? klientGoogle(zadanie) : null;
  const kod = parametry.get("code");
  if (!google || !kod || !stan || !weryfikator || parametry.get("state") !== stan) redirect("/panel/logowanie?blad=google");

  let dane: Dane | null = null;
  try {
    const tokeny = await google.validateAuthorizationCode(kod, weryfikator);
    dane = decodeIdToken(tokeny.idToken()) as Dane;
  } catch (blad) {
    console.error("[panel] logowanie Google:", blad);
  }
  const wystawca = dane?.iss === "https://accounts.google.com" || dane?.iss === "accounts.google.com";
  if (!dane?.sub || !wystawca || dane.aud !== process.env.GOOGLE_CLIENT_ID) redirect("/panel/logowanie?blad=google");
  if (!dane.email || dane.email_verified !== true) redirect("/panel/logowanie?blad=google-email");

  await zalogujKonto(kontoZewnetrzne("google", dane.sub, dane.email, dane.name ?? null));
  redirect(bezpiecznyCel(dalej));
}
