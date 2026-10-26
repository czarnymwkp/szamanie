import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Phone } from "lucide-react";
import { dataPl, zl } from "@/lib/ceny";
import { ADRES_SERWISU } from "@/lib/konfiguracja";
import type { Lokal } from "@/lib/lokale";
import type { Danie, Dostawa, Menu, Strefa } from "@/lib/menu";
import { ileLokali, linkTelefonu } from "@/lib/nazwy";
import type { KategoriaSeo, Obszar } from "@/lib/seo";
import { ZDJECIA_KATEGORII, type KluczZdjecia } from "@/lib/zdjeciaKategorii";
import KartaLokalu from "./KartaLokalu";

// Wspólne kawałki stron fraz (/krasnik, /krasnik/pizza): baner, listy lokali, pytania i dane dla Google.

export { ileLokali };

export type Okruszek = { nazwa: string; adres: string };

export function BanerFrazy({
  okruszki,
  tytul,
  children,
  zdjecie,
}: {
  okruszki: Okruszek[];
  tytul: string;
  children: ReactNode;
  zdjecie?: KluczZdjecia;
}) {
  const z = zdjecie && ZDJECIA_KATEGORII[zdjecie];
  return (
    <section className="relative overflow-hidden rounded-b-[2.25rem] bg-akcent">
      <Image
        src="/znak.png"
        alt=""
        width={180}
        height={180}
        priority
        className="pointer-events-none absolute -right-10 -bottom-12 w-40 -rotate-12 animate-unoszenie opacity-20 lg:hidden"
      />
      <div className="relative mx-auto flex max-w-6xl items-center gap-10 px-5 pt-6 pb-10 lg:pt-10 lg:pb-14">
        <div className="min-w-0 flex-1">
          <nav aria-label="Jesteś tutaj" className="animate-wjazd">
            <ol className="flex flex-wrap items-center gap-1 text-sm font-bold">
              {okruszki.map((o, i) => (
                <li key={o.adres} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-4 opacity-60" aria-hidden />}
                  {i < okruszki.length - 1 ? (
                    <Link href={o.adres} className="underline-offset-2 hover:underline">
                      {o.nazwa}
                    </Link>
                  ) : (
                    <span aria-current="page">{o.nazwa}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="mt-3 animate-wjazd text-4xl leading-[1.05] font-black tracking-tight text-balance [animation-delay:80ms] lg:text-6xl">
            {tytul}
          </h1>
          <div className="mt-4 max-w-xl animate-wjazd text-base leading-relaxed font-semibold [animation-delay:160ms] lg:text-lg">
            {children}
          </div>
        </div>
        {z && (
          <div className="relative hidden size-72 shrink-0 animate-wjazd overflow-hidden rounded-full border-8 border-white/30 shadow-[0_24px_48px_rgba(0,0,0,0.18)] [animation-delay:120ms] lg:block">
            <Image src={z.plik} alt="" fill sizes="288px" priority className="object-cover" style={{ objectPosition: z.pozycja }} />
          </div>
        )}
      </div>
    </section>
  );
}

export function SiatkaLokali({ lokale }: { lokale: Lokal[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lokale.map((l) => (
        <KartaLokalu key={l.id} lokal={l} />
      ))}
    </ul>
  );
}

/** Informacja o kolejności — przy płatnym wyróżnieniu wymagana prawem. */
export function Kolejnosc() {
  return (
    <p className="mt-4 text-xs font-semibold text-tekst-2">
      Kolejność: najpierw lokale z wykupionym wyróżnieniem (oznaczone „Promowane”), potem alfabetycznie.
    </p>
  );
}

export function Sekcja({ id, tytul, children }: { id: string; tytul: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="pt-10">
      <h2 id={id} className="mb-4 text-2xl font-black lg:text-3xl">
        {tytul}
      </h2>
      {children}
    </section>
  );
}

export function KafelekKategorii({ k, o, ile }: { k: KategoriaSeo; o: Obszar; ile: number }) {
  const z = ZDJECIA_KATEGORII[k.zdjecie];
  return (
    <li className="group pojawianie relative h-36 overflow-hidden rounded-[1.15rem] bg-tekst shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 has-[a:focus-visible]:ring-4 has-[a:focus-visible]:ring-akcent/50">
      {z && (
        <Image
          src={z.plik}
          alt=""
          fill
          sizes="(min-width: 1024px) 280px, 50vw"
          className="object-cover opacity-70 transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ objectPosition: z.pozycja }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="text-lg leading-tight font-black">
          <Link
            href={`/${o.slug}/${k.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-[1.15rem]"
          >
            {k.nazwa}
          </Link>
        </h3>
        <p className="text-sm font-bold text-white/85">{ileLokali(ile)}</p>
      </div>
    </li>
  );
}

/** Linki do lokali po przecinku: „Parkowa, Roma i U Górala”. */
export function ListaNazw({ lokale, dopisek }: { lokale: Lokal[]; dopisek?: (l: Lokal) => string }) {
  return lokale.map((l, i) => (
    <span key={l.id}>
      {i > 0 && (i === lokale.length - 1 ? " i " : ", ")}
      <Link href={`/lokal/${l.slug}`} className="font-extrabold text-akcent-tekst underline-offset-2 hover:underline">
        {l.nazwa}
      </Link>
      {dopisek && ` (${dopisek(l)})`}
    </span>
  ));
}

const najnizsza = (d: Danie) => Math.min(...d.ceny.map((c) => c.gr));

/** „Ile kosztuje pizza w Kraśniku?” — dania z menu lokali z cenami, po kilka na lokal. */
export function CenyDan({
  tytul,
  w,
  lokale,
  dania,
  menu,
}: {
  tytul: string;
  w: string; // „w Kraśniku”
  lokale: Lokal[];
  dania: Danie[];
  menu: Map<number, Menu>;
}) {
  // tylko lokale z tej strony — kebab z menu Nadwiślanki (Annopol) nie trafia do cen „w Kraśniku”
  const zCena = dania.filter((d) => d.ceny.length && lokale.some((l) => l.id === d.lokalId));
  const lokaleZDaniami = lokale.filter((l) => zCena.some((d) => d.lokalId === l.id));
  if (!lokaleZDaniami.length) return null;
  const poCenie = [...zCena].sort((a, b) => najnizsza(a) - najnizsza(b));
  const [najtansze, najdrozsze] = [poCenie[0], poCenie[poCenie.length - 1]];
  const nazwaLokalu = (id: number) => lokale.find((l) => l.id === id)!.nazwa;

  return (
    <Sekcja id="ceny" tytul={tytul}>
      <p className="max-w-3xl leading-relaxed font-semibold text-tekst-2">
        Ceny z menu {lokaleZDaniami.length === 1 ? "jednego lokalu" : `${lokaleZDaniami.length} lokali`} {w}: od{" "}
        <strong className="text-tekst">{zl(najnizsza(najtansze))}</strong> do{" "}
        <strong className="text-tekst">{zl(najnizsza(najdrozsze))}</strong>. Najtaniej: {najtansze.nazwa} w{" "}
        {nazwaLokalu(najtansze.lokalId)}.
      </p>
      {/* grid-cols-1 = minmax(0, 1fr) — bez tego ucięte opisy dań rozpychają kolumnę na telefonie */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {lokaleZDaniami.map((l) => {
          const daniaLokalu = zCena.filter((d) => d.lokalId === l.id);
          const m = menu.get(l.id);
          return (
            <section key={l.id} aria-label={l.nazwa} className="pojawianie rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black">
                <Link href={`/lokal/${l.slug}`} className="hover:text-akcent-tekst">
                  {l.nazwa}
                </Link>
              </h3>
              {m?.sprawdzono && (
                <p className="text-xs font-bold text-tekst-2">Ceny z menu sprawdzone {dataPl(m.sprawdzono)}</p>
              )}
              <ul className="mt-3 divide-y divide-obrys">
                {daniaLokalu.slice(0, 6).map((d) => (
                  <li key={d.id} className="flex items-baseline justify-between gap-4 py-2">
                    <div className="min-w-0">
                      <p className="font-extrabold">{d.nazwa}</p>
                      {d.opis && <p className="truncate text-sm font-semibold text-tekst-2">{d.opis}</p>}
                    </div>
                    <p className="shrink-0 text-right text-sm font-black whitespace-nowrap">
                      {d.ceny.map((c) => (
                        <span key={`${c.wariant}-${c.gr}`} className="block">
                          {c.wariant && <span className="font-bold text-tekst-2">{c.wariant} </span>}
                          {zl(c.gr)}
                        </span>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
              <Link
                href={`/lokal/${l.slug}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-black text-akcent-tekst hover:underline"
              >
                {daniaLokalu.length > 6 ? `Jeszcze ${daniaLokalu.length - 6} — całe menu` : "Całe menu"}
                {m && ` (${m.liczba} poz.)`}
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </section>
          );
        })}
      </div>
    </Sekcja>
  );
}

/** Cena dostawy jak na stronie lokalu: „3 zł”, „gratis”, „zapytaj”. */
export const cenaDostawy = (s: Strefa) => (s.cenaGr === null ? "zapytaj" : s.cenaGr ? zl(s.cenaGr) : "gratis");

/** „Ile kosztuje dowóz?” — strefy dostawy lokali z ceną i minimalnym zamówieniem, po karcie na lokal. */
export function CennikiDostawy({ cenniki }: { cenniki: { lokal: Lokal; dostawa: Dostawa }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {cenniki.map(({ lokal: l, dostawa: d }) => (
        <section key={l.id} aria-label={`Dostawa — ${l.nazwa}`} className="pojawianie rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-black">
                <Link href={`/lokal/${l.slug}`} className="hover:text-akcent-tekst">
                  {l.nazwa}
                </Link>
              </h3>
              {d.sprawdzono && (
                <p className="text-xs font-bold text-tekst-2">
                  Cennik{" "}
                  {d.zrodlo && /^https?:/.test(d.zrodlo) ? (
                    <a href={d.zrodlo} rel="nofollow" className="underline hover:text-tekst">
                      ze strony lokalu
                    </a>
                  ) : (
                    "od lokalu"
                  )}
                  , sprawdzony {dataPl(d.sprawdzono)}
                </p>
              )}
            </div>
            {l.telefon && (
              <a
                href={linkTelefonu(l.telefon)}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-tekst px-4 text-sm font-black text-white transition active:scale-95"
              >
                <Phone className="size-4" aria-hidden />
                Zadzwoń
              </a>
            )}
          </div>
          {d.uwagi && <p className="mt-2 text-sm font-semibold text-tekst-2">{d.uwagi}</p>}
          <ul className="mt-3 divide-y divide-obrys">
            {d.strefy.map((s) => (
              <li key={s.nazwa} className="flex items-baseline justify-between gap-4 py-2">
                <p className="min-w-0 font-extrabold">{s.nazwa}</p>
                <p className="shrink-0 text-right text-sm font-black whitespace-nowrap">
                  {cenaDostawy(s)}
                  {s.minGr ? (
                    <span className="block text-xs font-bold text-tekst-2">zamówienie od {zl(s.minGr)}</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href={`/lokal/${l.slug}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-black text-akcent-tekst hover:underline"
          >
            Menu i lista do zamówienia
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </section>
      ))}
    </div>
  );
}

export type Pytanie = { pytanie: string; odpowiedz: ReactNode };

export function Pytania({ pytania, tytul }: { pytania: Pytanie[]; tytul: string }) {
  if (!pytania.length) return null;
  return (
    <Sekcja id="pytania" tytul={tytul}>
      <div className="grid gap-4 lg:grid-cols-2">
        {pytania.map((p) => (
          <div key={p.pytanie} className="pojawianie rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="text-lg leading-snug font-black">{p.pytanie}</h3>
            <p className="mt-2 leading-relaxed font-semibold text-tekst-2">{p.odpowiedz}</p>
          </div>
        ))}
      </div>
    </Sekcja>
  );
}

export function Pigulki({ linki }: { linki: { nazwa: string; adres: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {linki.map((l) => (
        <li key={l.adres}>
          <Link
            href={l.adres}
            className="flex h-10 items-center rounded-full border-[1.5px] border-obrys-2 bg-white px-4 text-sm font-extrabold transition hover:border-tekst active:scale-95"
          >
            {l.nazwa}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Dane strukturalne dla Google: ścieżka okruszków i lista lokali (strona zbiorcza → strony lokali). */
export function DaneDlaGoogle({ okruszki, lokale }: { okruszki: Okruszek[]; lokale: Lokal[] }) {
  const dane = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: okruszki.map((o, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: o.nazwa,
        item: `${ADRES_SERWISU}${o.adres === "/" ? "" : o.adres}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: lokale.map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${ADRES_SERWISU}/lokal/${l.slug}`,
        name: l.nazwa,
      })),
    },
  ];
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dane).replace(/</g, "\\u003c") }} />
  );
}
