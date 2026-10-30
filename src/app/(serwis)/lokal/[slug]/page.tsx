import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pigulki, Sekcja } from "@/components/StronaFrazy";
import SzablonLokalu from "@/components/szablony";
import { godzinySchemaOrg, parsujGodziny } from "@/lib/godziny";
import { SITE_URL } from "@/lib/konfiguracja";
import { pobierzLokal, pobierzLokale, type Lokal } from "@/lib/lokale";
import { pobierzMenu, type Menu } from "@/lib/menu";
import { linkFacebooka, linkWww, nazwaKuchni, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { doIndeksu, kategorieZeStrona, lokaleKategorii, obszaryZeStrona, type Obszar } from "@/lib/seo";

// Cała strona statyczna: nieznany adres czeka na wynik zamiast szkieletu z kodem 200, więc dostaje prawdziwe 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const lokale = await pobierzLokale();
  // Cache Components wymaga co najmniej jednego parametru; pusta baza → strona 404.
  return lokale.length ? lokale.map((l) => ({ slug: l.slug })) : [{ slug: "brak" }];
}

export async function generateMetadata({ params }: PageProps<"/lokal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lokal = await pobierzLokal(slug);
  if (!lokal) return {};
  const [menu, lokale, indeks] = await Promise.all([pobierzMenu(lokal.id), pobierzLokale(), doIndeksu(lokal)]);
  const miasto = lokal.miejscowosc ?? "Kraśnik";
  // „Zapiekanki Kraśnik - Bar Przekąskowy” bez drugiego „Kraśnik”; lokale o tej samej nazwie w tej samej
  // miejscowości (trzy lodziarnie Sandomierskiej Manufaktury Lodów) rozróżnia ulica — krótko, bez imion i stopni
  // („Generała Władysława Sikorskiego 7a” → „Sikorskiego 7a”), bo tytuł i tak jest długi.
  const ulica = lokal.adres?.match(/(?:(?:Plac|Aleja|Al\.|Rynek|Osiedle|Os\.) )?\S+ \d\S*$/)?.[0] ?? lokal.adres;
  const gdzie = [
    lokal.nazwa.toLowerCase().includes(miasto.toLowerCase()) ? "" : ` ${miasto}`,
    ulica && lokale.some((l) => l.id !== lokal.id && l.nazwa === lokal.nazwa && l.miejscowosc === lokal.miejscowosc)
      ? `, ${ulica}`
      : "",
  ].join("");
  const uslugi = [lokal.dostawa && "dowóz", lokal.naWynos && "na wynos"].filter(Boolean).join(" i ");
  // rodzaj i najwyżej dwie kuchnie — pełna lista („Kawa · Lody · Makarony · Sałatki…”) wydłuża opis ponad 160 znaków
  const rodzaj = opisLokalu(lokal).split(" · ").slice(0, 3).join(" · ");
  // Z menu tytuł łapie wyszukiwania „<lokal> Kraśnik menu”, „… ceny”. Nazwa w opisie, bo bez niej pięć kebabów
  // miałoby ten sam opis.
  const tytul = `${lokal.nazwa}${gdzie} — ${menu ? "menu i ceny" : "godziny i telefon"}`;
  return {
    // długa nazwa lokalu: bez „ | szamanie.pl” na końcu, żeby Google nie uciął „menu i ceny”
    title: tytul.length > 50 ? { absolute: tytul } : tytul,
    description: menu
      ? `${lokal.nazwa}: menu z cenami (${menu.liczba} pozycji), godziny otwarcia, telefon i dojazd. ${rodzaj}, ${pelnyAdres(lokal)}.`
      : `${lokal.nazwa} — ${rodzaj}, ${pelnyAdres(lokal)}. ${uslugi ? `${uslugi[0].toUpperCase()}${uslugi.slice(1)}. ` : ""}Sprawdź godziny otwarcia, telefon i dojazd.`,
    alternates: { canonical: `/lokal/${lokal.slug}` },
    ...(!indeks && { robots: { index: false, follow: true } }),
  };
}

const TYPY_SCHEMA: Record<string, string> = {
  restaurant: "Restaurant",
  fast_food: "FastFoodRestaurant",
  cafe: "CafeOrCoffeeShop",
  pub: "BarOrPub",
  bar: "BarOrPub",
  ice_cream: "IceCreamShop",
};

// Dane strukturalne dla Google (schema.org), żeby lokal mógł się pokazać z adresem, godzinami i menu.
function daneStrukturalne(lokal: Lokal, menu: Menu | null) {
  const tydzien = parsujGodziny(lokal.godziny);
  return {
    "@context": "https://schema.org",
    "@type": TYPY_SCHEMA[lokal.typ] ?? "FoodEstablishment",
    name: lokal.nazwa,
    url: `${SITE_URL}/lokal/${lokal.slug}`,
    telephone: lokal.telefon ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: lokal.adres ?? undefined,
      addressLocality: lokal.miejscowosc ?? undefined,
      addressCountry: "PL",
    },
    geo: { "@type": "GeoCoordinates", latitude: lokal.lat, longitude: lokal.lon },
    servesCuisine: lokal.kuchnie.length ? lokal.kuchnie.map(nazwaKuchni) : undefined,
    openingHours: tydzien ? godzinySchemaOrg(tydzien) : undefined,
    sameAs:
      lokal.www || lokal.facebook
        ? [lokal.www && linkWww(lokal.www), lokal.facebook && linkFacebooka(lokal.facebook)].filter(Boolean)
        : undefined,
    hasMenu: menu
      ? {
          "@type": "Menu",
          hasMenuSection: menu.sekcje.map((s) => ({
            "@type": "MenuSection",
            name: s.nazwa,
            description: s.opis ?? undefined,
            hasMenuItem: s.pozycje.map((p) => ({
              "@type": "MenuItem",
              name: p.nazwa,
              description: p.opis ?? undefined,
              // pozycja bez ceny (lokal nie podaje cen) — bez offers zamiast pustej listy albo ceny 0
              offers: p.ceny.some((c) => c.gr > 0)
                ? p.ceny
                    .filter((c) => c.gr > 0)
                    .map((c) => ({
                      "@type": "Offer",
                      name: c.wariant ?? undefined,
                      price: (c.gr / 100).toFixed(2),
                      priceCurrency: "PLN",
                    }))
                : undefined,
            })),
          })),
        }
      : undefined,
  };
}

/** Okruszki dla Google: szamanie.pl › Kraśnik › lokal (obszar tylko, gdy ma swoją stronę). */
function okruszki(lokal: Lokal, obszar: Obszar | undefined) {
  const sciezka = [
    { name: "szamanie.pl", item: SITE_URL },
    ...(obszar ? [{ name: obszar.nazwa, item: `${SITE_URL}/${obszar.slug}` }] : []),
    { name: lokal.nazwa, item: `${SITE_URL}/lokal/${lokal.slug}` },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: sciezka.map((o, i) => ({ "@type": "ListItem", position: i + 1, ...o })),
  };
}

// Treść zależna od adresu jest w <Suspense>, żeby wspólny szkielet strony mógł się pokazać od razu.
// Karty na liście mają prefetch, więc przy kliknięciu treść jest już pobrana i baner płynnie przechodzi.
export default function StronaLokalu({ params }: PageProps<"/lokal/[slug]">) {
  return (
    <Suspense fallback={<SzkieletLokalu />}>
      <TrescLokalu params={params} />
    </Suspense>
  );
}

async function TrescLokalu({ params }: Pick<PageProps<"/lokal/[slug]">, "params">) {
  const { slug } = await params;
  const lokal = await pobierzLokal(slug);
  if (!lokal) notFound();
  const [menu, lokale] = await Promise.all([pobierzMenu(lokal.id), pobierzLokale()]);
  // Linki do stron fraz, na których jest ten lokal („Pizza w Kraśniku”…).
  const obszar = obszaryZeStrona(lokale).find((o) => lokal.gmina && [...o.gminy, ...o.okolica].includes(lokal.gmina));
  const linki = obszar
    ? [
        ...kategorieZeStrona(lokale, obszar)
          .filter((k) => {
            const { w, okolica } = lokaleKategorii([lokal], obszar, k);
            return w.length + okolica.length > 0;
          })
          .map((k) => ({ nazwa: `${k.nazwa} ${obszar.w}`, adres: `/${obszar.slug}/${k.slug}` })),
        { nazwa: `Gdzie zjeść ${obszar.w}`, adres: `/${obszar.slug}` },
      ]
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([daneStrukturalne(lokal, menu), okruszki(lokal, obszar)]).replace(/</g, "\\u003c"),
        }}
      />
      <SzablonLokalu lokal={lokal} />
      {linki.length > 0 && (
        <div className="mx-auto max-w-5xl px-5">
          <Sekcja id="zobacz-tez" tytul="Zobacz też">
            <Pigulki linki={linki} />
          </Sekcja>
        </div>
      )}
    </>
  );
}

function SzkieletLokalu() {
  return (
    // wysoki na cały ekran: przy pierwszym wczytaniu stopka nie mignie tuż pod szkieletem i nie skoczy w dół (CLS)
    <div aria-busy="true" aria-label="Wczytywanie lokalu" className="min-h-svh animate-pulse">
      <div className="h-44 bg-obrys sm:h-56 lg:h-64" />
      <div className="mx-auto max-w-5xl px-5">
        <div className="-mt-10 size-20 rounded-[1.3rem] bg-white shadow sm:-mt-12 sm:size-24" />
        <div className="mt-5 h-10 w-2/3 rounded-xl bg-obrys" />
        <div className="mt-3 h-5 w-1/3 rounded-lg bg-obrys" />
      </div>
    </div>
  );
}
