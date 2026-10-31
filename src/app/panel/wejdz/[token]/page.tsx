import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogIn, Store } from "lucide-react";
import { card, primaryButton } from "@/components/panel/style";
import { accountByLink, accountVenues, getAccount } from "@/lib/panel/accounts";
import { enterWithLink } from "../../actions";

export const metadata: Metadata = { title: "Wejście do panelu" };

// the page depends on the link and the cookie — it waits for the server (like the whole panel)
export const instant = false;

// A link from an SMS opens this page, and only the button (POST) starts the session. Link previews in messengers and
// mail scanners fetch the page but do not click, so they never get a session.
export default async function LinkEntry({ params }: PageProps<"/panel/wejdz/[token]">) {
  const { token } = await params;
  const account = accountByLink(token);
  if (!account) redirect("/panel?link=nieaktywny");
  const venues = accountVenues(account);
  if ((await getAccount())?.id === account) redirect(venues.length === 1 ? `/panel/${venues[0].slug}` : "/panel");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Panel lokalu</h1>
        <p className="mt-2 leading-relaxed text-tekst-2">Zmieniaj menu i ceny, godziny otwarcia i dodawaj promocje.</p>
      </div>
      {venues.length > 0 && (
        <ul className={`${card} space-y-2`}>
          {venues.map((l) => (
            <li key={l.id} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-krem">
                <Store className="size-5 text-akcent-tekst" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-black">{l.nazwa}</span>
                <span className="block truncate text-sm text-tekst-2">
                  {[l.adres, l.miejscowosc].filter(Boolean).join(", ")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form action={enterWithLink.bind(null, token)}>
        <button type="submit" className={`${primaryButton} w-full`}>
          <LogIn className="size-5" aria-hidden /> Wejdź do panelu
        </button>
      </form>
      <p className="text-center text-xs leading-relaxed text-tekst-2">
        Ten link jest tylko dla Ciebie — nie przekazuj go dalej. Zapisz go, żeby wejść też z innego telefonu.
      </p>
    </div>
  );
}
