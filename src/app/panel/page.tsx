import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Plus, ShieldCheck, Store } from "lucide-react";
import { karta, komunikatOk } from "@/components/panel/style";
import { db } from "@/lib/db";
import { lokaleKonta, wymagajKonta } from "@/lib/panel/konta";

export const metadata: Metadata = { title: { absolute: "Twoje lokale · Panel lokalu" } };

export default async function Panel({ searchParams }: PageProps<"/panel">) {
  const konto = await wymagajKonta();
  const { zgloszono } = await searchParams;
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
