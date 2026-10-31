import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Plus, ShieldCheck, Store } from "lucide-react";
import { card, errorMessage, okMessage } from "@/components/panel/style";
import { db } from "@/lib/db";
import { loginEnabled, selectableVenues, accountVenues, getAccount } from "@/lib/panel/accounts";
import VenueList from "./dodaj/VenueList";

export const metadata: Metadata = { title: { absolute: "Twoje lokale · Panel lokalu" } };

// the page depends on the account and the URL — it waits for the server (like the whole panel)
export const instant = false;

export default async function PanelPage({ searchParams }: PageProps<"/panel">) {
  const account = await getAccount();
  const { zgloszono, link } = await searchParams;
  if (!account) return <EnterPage zgloszono={!!zgloszono} nieaktywny={link === "nieaktywny"} />;
  const venues = accountVenues(account.id);
  const pending = (
    db
      .prepare(
        `SELECT z.id, l.nazwa, l.adres, z.utworzono FROM zgloszenia z JOIN lokale l ON l.id = z.lokal_id
         WHERE z.konto_id = ? AND z.status = 'nowe' ORDER BY z.utworzono DESC`,
      )
      .all(account.id) as { id: number; nazwa: string; adres: string | null; utworzono: string }[]
  ).map((z) => ({ ...z }));
  const newForAdmin =
    account.rola === "admin"
      ? (db.prepare("SELECT COUNT(*) AS n FROM zgloszenia WHERE status = 'nowe'").get() as { n: number }).n
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight sm:text-4xl">
          Cześć{account.imie ? `, ${account.imie.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-1 text-tekst-2">Tu zarządzasz swoim lokalem na szamanie.pl.</p>
      </div>

      {zgloszono && (
        <p className={okMessage}>
          Dziękujemy! Zadzwonimy na numer lokalu, żeby potwierdzić, i wtedy lokal pojawi się na tej liście.
        </p>
      )}

      {account.rola === "admin" && (
        <Link
          href="/panel/admin"
          className="flex items-center gap-3 rounded-2xl bg-tekst p-4 text-white transition hover:-translate-y-0.5"
        >
          <ShieldCheck className="size-5 text-akcent" aria-hidden />
          <span className="flex-1 font-extrabold">Administracja: zgłoszenia lokali</span>
          {newForAdmin > 0 && (
            <span className="rounded-full bg-akcent px-2.5 py-0.5 text-sm font-black text-tekst">{newForAdmin}</span>
          )}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}

      <section>
        <h2 className="mb-3 text-lg font-black">Twoje lokale</h2>
        {venues.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {venues.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/panel/${l.slug}`}
                  className={`${card} group flex items-center gap-4 transition hover:-translate-y-0.5 hover:ring-akcent`}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-krem">
                    <Store className="size-6 text-akcent-tekst" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-black">{l.nazwa}</span>
                    <span className="block truncate text-sm text-tekst-2">
                      {[l.adres, l.miejscowosc].filter(Boolean).join(", ")}
                    </span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${card} text-tekst-2`}>
            Nie masz jeszcze żadnego lokalu. Znajdź swój lokal na liście i poproś o dostęp — sprawdzimy to jednym
            telefonem.
          </p>
        )}
      </section>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-black">Czekają na potwierdzenie</h2>
          <ul className="space-y-2">
            {pending.map((z) => (
              <li key={z.id} className={`${card} flex items-center gap-3`}>
                <Clock className="size-5 shrink-0 text-akcent-tekst" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{z.nazwa}</span>
                  <span className="block text-sm text-tekst-2">Zadzwonimy na numer lokalu, żeby potwierdzić.</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href="/panel/dodaj" className="inline-flex items-center gap-2 font-extrabold text-akcent-tekst hover:underline">
        <Plus className="size-5" aria-hidden /> Dodaj swój lokal
      </Link>
    </div>
  );
}

/** Panel without a session: how to get a panel link (instead of signing in, for now). */
function EnterPage({ zgloszono, nieaktywny }: { zgloszono: boolean; nieaktywny: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Panel dla lokali</h1>
        <p className="mt-2 leading-relaxed text-tekst-2">
          Zmieniaj menu i ceny, godziny otwarcia i dodawaj promocje. Bez hasła i zakładania konta.
        </p>
      </div>

      {zgloszono && (
        <p className={okMessage}>
          Dziękujemy! Zadzwonimy na numer lokalu, żeby potwierdzić, a potem wyślemy Ci SMS-em link do panelu.
        </p>
      )}
      {nieaktywny && (
        <p role="alert" className={errorMessage}>
          Ten link do panelu już nie działa. Poproś nas o nowy albo wyślij zgłoszenie poniżej.
        </p>
      )}

      <ol className={`${card} space-y-3 bg-krem text-sm leading-relaxed ring-0`}>
        {[
          "Znajdź swój lokal na liście i zostaw numer telefonu.",
          "Zadzwonimy na numer lokalu, żeby potwierdzić, że to Ty.",
          "Dostaniesz SMS-em link do panelu — wystarczy go otworzyć. Ten sam link zadziała też na drugim telefonie.",
        ].map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-akcent text-xs font-black text-na-akcencie">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <section>
        <h2 className="mb-3 text-lg font-black">Znajdź swój lokal</h2>
        <VenueList lokale={selectableVenues()} />
      </section>

      {loginEnabled() && (
        <Link href="/panel/logowanie" className="inline-flex items-center gap-2 font-extrabold text-akcent-tekst hover:underline">
          Masz już konto? Zaloguj się <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
