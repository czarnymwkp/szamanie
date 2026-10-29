import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Plus, ShieldCheck, Store } from "lucide-react";
import { karta, komunikatBledu, komunikatOk } from "@/components/panel/style";
import { db } from "@/lib/db";
import { logowanieWlaczone, lokaleDoWyboru, lokaleKonta, pobierzKonto } from "@/lib/panel/konta";
import ListaLokali from "./dodaj/ListaLokali";

export const metadata: Metadata = { title: { absolute: "Twoje lokale · Panel lokalu" } };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
export const instant = false;

export default async function Panel({ searchParams }: PageProps<"/panel">) {
  const konto = await pobierzKonto();
  const { zgloszono, link } = await searchParams;
  if (!konto) return <Wejscie zgloszono={!!zgloszono} nieaktywny={link === "nieaktywny"} />;
  const lokale = lokaleKonta(konto.id);
  const czekajace = (
    db
      .prepare(
        `SELECT z.id, l.nazwa, l.adres, z.utworzono FROM zgloszenia z JOIN lokale l ON l.id = z.lokal_id
         WHERE z.konto_id = ? AND z.status = 'nowe' ORDER BY z.utworzono DESC`,
      )
      .all(konto.id) as { id: number; nazwa: string; adres: string | null; utworzono: string }[]
  ).map((z) => ({ ...z }));
  const noweDlaAdmina =
    konto.rola === "admin"
      ? (db.prepare("SELECT COUNT(*) AS n FROM zgloszenia WHERE status = 'nowe'").get() as { n: number }).n
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight sm:text-4xl">
          Cześć{konto.imie ? `, ${konto.imie.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-1 text-tekst-2">Tu zarządzasz swoim lokalem na szamanie.pl.</p>
      </div>

      {zgloszono && (
        <p className={komunikatOk}>
          Dziękujemy! Zadzwonimy na numer lokalu, żeby potwierdzić, i wtedy lokal pojawi się na tej liście.
        </p>
      )}

      {konto.rola === "admin" && (
        <Link
          href="/panel/admin"
          className="flex items-center gap-3 rounded-2xl bg-tekst p-4 text-white transition hover:-translate-y-0.5"
        >
          <ShieldCheck className="size-5 text-akcent" aria-hidden />
          <span className="flex-1 font-extrabold">Administracja: zgłoszenia lokali</span>
          {noweDlaAdmina > 0 && (
            <span className="rounded-full bg-akcent px-2.5 py-0.5 text-sm font-black text-tekst">{noweDlaAdmina}</span>
          )}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}

      <section>
        <h2 className="mb-3 text-lg font-black">Twoje lokale</h2>
        {lokale.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {lokale.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/panel/${l.slug}`}
                  className={`${karta} group flex items-center gap-4 transition hover:-translate-y-0.5 hover:ring-akcent`}
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
          <p className={`${karta} text-tekst-2`}>
            Nie masz jeszcze żadnego lokalu. Znajdź swój lokal na liście i poproś o dostęp — sprawdzimy to jednym
            telefonem.
          </p>
        )}
      </section>

      {czekajace.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-black">Czekają na potwierdzenie</h2>
          <ul className="space-y-2">
            {czekajace.map((z) => (
              <li key={z.id} className={`${karta} flex items-center gap-3`}>
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

/** Panel bez sesji: jak dostać link do panelu (na razie zamiast logowania). */
function Wejscie({ zgloszono, nieaktywny }: { zgloszono: boolean; nieaktywny: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Panel dla lokali</h1>
        <p className="mt-2 leading-relaxed text-tekst-2">
          Zmieniaj menu i ceny, godziny otwarcia i dodawaj promocje. Bez hasła i zakładania konta.
        </p>
      </div>

      {zgloszono && (
        <p className={komunikatOk}>
          Dziękujemy! Zadzwonimy na numer lokalu, żeby potwierdzić, a potem wyślemy Ci SMS-em link do panelu.
        </p>
      )}
      {nieaktywny && (
        <p role="alert" className={komunikatBledu}>
          Ten link do panelu już nie działa. Poproś nas o nowy albo wyślij zgłoszenie poniżej.
        </p>
      )}

      <ol className={`${karta} space-y-3 bg-krem text-sm leading-relaxed ring-0`}>
        {[
          "Znajdź swój lokal na liście i zostaw numer telefonu.",
          "Zadzwonimy na numer lokalu, żeby potwierdzić, że to Ty.",
          "Dostaniesz SMS-em link do panelu — wystarczy go otworzyć. Ten sam link zadziała też na drugim telefonie.",
        ].map((krok, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-akcent text-xs font-black text-na-akcencie">
              {i + 1}
            </span>
            {krok}
          </li>
        ))}
      </ol>

      <section>
        <h2 className="mb-3 text-lg font-black">Znajdź swój lokal</h2>
        <ListaLokali lokale={lokaleDoWyboru()} />
      </section>

      {logowanieWlaczone() && (
        <Link href="/panel/logowanie" className="inline-flex items-center gap-2 font-extrabold text-akcent-tekst hover:underline">
          Masz już konto? Zaloguj się <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
