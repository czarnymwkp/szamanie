import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { card, errorMessage } from "@/components/panel/style";
import { safeTarget, loginEnabled, getAccount } from "@/lib/panel/konta";
import LoginForm from "./FormularzLogowania";

export const metadata: Metadata = { title: "Logowanie" };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
export const instant = false;

const ERRORS: Record<string, string> = {
  google: "Logowanie przez Google się nie udało. Spróbuj jeszcze raz albo zaloguj się kodem z e-maila.",
  "google-email": "Twoje konto Google nie ma potwierdzonego adresu e-mail. Zaloguj się kodem z e-maila.",
};

export default async function LoginPage({ searchParams }: PageProps<"/panel/logowanie">) {
  const { dalej, blad } = await searchParams;
  const target = safeTarget(dalej);
  // na razie bez logowania — wchodzi się linkiem od nas (strona /panel mówi, jak go dostać)
  if (!loginEnabled()) redirect("/panel");
  if (await getAccount()) redirect(target);
  const google = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Panel dla lokali</h1>
      <p className="mt-2 leading-relaxed text-tekst-2">
        Zmieniaj menu i ceny, godziny otwarcia i dodawaj promocje. Konto zakłada się samo przy pierwszym logowaniu.
      </p>

      {typeof blad === "string" && ERRORS[blad] && (
        <p role="alert" className={`mt-5 ${errorMessage}`}>
          {ERRORS[blad]}
        </p>
      )}

      <div className={`mt-6 ${card}`}>
        {google && (
          <>
            {/* zwykły link, nie <Link>: to przekierowanie do Google, nie strona do pobrania z wyprzedzeniem */}
            <a
              href={`/panel/logowanie/google?dalej=${encodeURIComponent(target)}`}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full border-2 border-obrys-2 bg-white font-extrabold transition hover:border-tekst"
            >
              <GoogleLogo />
              Zaloguj przez Google
            </a>
            <div className="my-5 flex items-center gap-3 text-xs font-bold tracking-wide text-tekst-2 uppercase">
              <span className="h-px flex-1 bg-obrys" /> albo e-mailem <span className="h-px flex-1 bg-obrys" />
            </div>
          </>
        )}
        <LoginForm dalej={target} />
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-tekst-2">
        Logując się, akceptujesz zasady opisane w{" "}
        <Link href="/polityka-prywatnosci" className="font-bold underline underline-offset-2">
          polityce prywatności
        </Link>
        .
      </p>
    </div>
  );
}

// Znak „G” w kolorach Google — wymagany na przycisku logowania przez Google.
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
