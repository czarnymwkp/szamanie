import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PhraseBanner,
  DishPrices,
  StructuredData,
  Order,
  NameList,
  Pills,
  Faq,
  Section,
  VenueGrid,
  ileLokali,
  type Breadcrumb,
  type Question,
} from "@/components/PhrasePage";
import { getVenues, type Venue } from "@/lib/venues";
import { getMenu, type Menu } from "@/lib/menu";
import { venuesFound, plural } from "@/lib/format";
import {
  categoryDishes,
  categoriesWithPage,
  categoryVenues,
  areasWithDelivery,
  areasWithPage,
  openOnSunday,
  pageTitle,
  findPage,
  withDelivery,
  type SeoCategory,
  type Area,
} from "@/lib/seo";

// Strona „Pizza w Kraśniku” — pod wyszukiwanie „pizza Kraśnik”: lista lokali z kategorii i odpowiedzi na pytania.

// Cała strona statyczna: nieznany adres czeka na wynik zamiast szkieletu z kodem 200, więc dostaje prawdziwe 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const venues = await getVenues();
  const pages = areasWithPage(venues).flatMap((o) =>
    categoriesWithPage(venues, o).map((k) => ({ obszar: o.slug, kategoria: k.slug })),
  );
  // Cache Components wymaga co najmniej jednego parametru; „brak” → 404.
  return pages.length ? pages : [{ obszar: "brak", kategoria: "brak" }];
}

async function load(params: PageProps<"/[obszar]/[kategoria]">["params"]) {
  const { obszar: o, kategoria: k } = await params;
  const venues = await getVenues();
  const page = findPage(venues, o, k);
  if (!page?.kategoria) return null;
  return { lokale: venues, obszar: page.obszar, kategoria: page.kategoria, dania: await categoryDishes(page.kategoria) };
}

export async function generateMetadata({ params }: PageProps<"/[obszar]/[kategoria]">): Promise<Metadata> {
  const date = await load(params);
  if (!date) return {};
  const { lokale, obszar, kategoria, dania } = date;
  const { w } = categoryVenues(lokale, obszar, kategoria);
  const names = w.slice(0, 3).map((l) => l.nazwa);
  const withPrices = dania.some((d) => w.some((l) => l.id === d.lokalId));
  const count = kategoria.liczba ? `${w.length} ${plural(w.length, kategoria.liczba)}` : ileLokali(w.length);
  // „dowóz” w tytule, gdy któryś lokal dowozi — ludzie szukają „pizza Kraśnik dowóz”
  const delivers = kategoria.dowoz && w.some((l) => l.dostawa);
  const what = [withPrices ? "ceny" : "godziny", delivers ? "dowóz" : withPrices ? "godziny" : "telefony"];
  return {
    title: pageTitle(`${kategoria.fraza} ${obszar.nazwa} — ${count}, ${what.join(", ")}`),
    description: `${kategoria.nazwa} ${obszar.w}: ${names.join(", ")}${w.length > 3 ? " i inne" : ""}. Sprawdź, co jest teraz otwarte, zadzwoń i zamów albo podjedź.`,
    alternates: { canonical: `/${obszar.slug}/${kategoria.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/[obszar]/[kategoria]">) {
  const date = await load(params);
  if (!date) notFound();
  const { lokale, obszar, kategoria, dania } = date;
  const { w, okolica } = categoryVenues(lokale, obszar, kategoria);
  const title = `${kategoria.nazwa} ${obszar.w}`;
  const withDishes = [...w, ...okolica].filter((l) => dania.some((d) => d.lokalId === l.id));
  const menu = new Map<number, Menu>();
  for (const [i, m] of (await Promise.all(withDishes.map((l) => getMenu(l.id)))).entries()) {
    if (m) menu.set(withDishes[i].id, m);
  }
  const breadcrumbs: Breadcrumb[] = [
    { nazwa: "szamanie.pl", adres: "/" },
    { nazwa: obszar.nazwa, adres: `/${obszar.slug}` },
    { nazwa: kategoria.nazwa, adres: `/${obszar.slug}/${kategoria.slug}` },
  ];
  const otherCategories = categoriesWithPage(lokale, obszar).filter((k) => k.slug !== kategoria.slug);
  const hasDelivery = areasWithDelivery(lokale).some((o) => o.slug === obszar.slug);
  const sameElsewhere = areasWithPage(lokale).filter(
    (o) => o.slug !== obszar.slug && categoriesWithPage(lokale, o).some((k) => k.slug === kategoria.slug),
  );

  return (
    <>
      <StructuredData okruszki={breadcrumbs} lokale={w} />
      <PhraseBanner okruszki={breadcrumbs} tytul={title} zdjecie={kategoria.zdjecie}>
        <p>
          {kategoria.opis} {ileLokali(w.length)} {obszar.w} — z godzinami otwarcia, telefonem i dojazdem.
        </p>
      </PhraseBanner>

      <div className="mx-auto max-w-6xl px-5">
        <Section id="lokale" tytul={`${title}: ${ileLokali(w.length)}`}>
          <VenueGrid lokale={w} />
          <Order />
        </Section>

        {okolica.length > 0 && (
          <Section id="okolica" tytul="W okolicy">
            <VenueGrid lokale={okolica} />
          </Section>
        )}

        {kategoria.menu && (
          <DishPrices
            tytul={`${kategoria.menu.ileKosztuje} ${obszar.w}?`}
            w={obszar.w}
            lokale={withDishes}
            dania={dania}
            menu={menu}
          />
        )}

        <Faq tytul="Pytania i odpowiedzi" pytania={questions(obszar, kategoria, w, hasDelivery)} />

        <Section id="wiecej" tytul={`Więcej ${obszar.w}`}>
          <Pills
            linki={[
              { nazwa: `Wszystkie lokale ${obszar.w}`, adres: `/${obszar.slug}` },
              ...(hasDelivery ? [{ nazwa: `Dowóz ${obszar.w}`, adres: `/${obszar.slug}/dowoz` }] : []),
              ...otherCategories.map((k) => ({ nazwa: k.nazwa, adres: `/${obszar.slug}/${k.slug}` })),
              ...sameElsewhere.map((o) => ({
                nazwa: `${kategoria.nazwa} ${o.w}`,
                adres: `/${o.slug}/${kategoria.slug}`,
              })),
            ]}
          />
        </Section>
      </div>
    </>
  );
}

function questions(
  area: Area,
  category: SeoCategory,
  venues: Venue[],
  hasDelivery: boolean, // czy obszar ma stronę /<obszar>/dowoz
): Question[] {
  const title = `${category.nazwa} ${area.w}`;
  const result: Question[] = [
    {
      pytanie: `${category.gdzie} ${area.w}?`,
      odpowiedz: (
        <>
          Na szamanie.pl {venuesFound(venues.length)}: <NameList lokale={venues} />. Przy każdym są godziny
          otwarcia, telefon i przycisk „Prowadź”, który od razu otwiera nawigację.
        </>
      ),
    },
  ];

  const { dowoz, naWynos } = withDelivery(venues);
  if (category.dowoz && (dowoz.length || naWynos.length)) {
    result.push({
      pytanie: `${title} z dowozem — kto dowozi?`,
      odpowiedz: (
        <>
          {dowoz.length > 0 && (
            <>
              Dowóz oznaczyły: <NameList lokale={dowoz} />.{" "}
            </>
          )}
          {naWynos.length > 0 && (
            <>
              Na wynos: <NameList lokale={naWynos} />.{" "}
            </>
          )}
          {hasDelivery ? (
            <>
              Kto dowiezie do Twojej miejscowości i za ile:{" "}
              <Link
                href={`/${area.slug}/dowoz`}
                className="font-extrabold text-akcent-tekst underline-offset-2 hover:underline"
              >
                jedzenie z dowozem {area.w}
              </Link>
              .
            </>
          ) : (
            <>Strefy i ceny dostawy dopiero zbieramy — zadzwoń i zapytaj, czy lokal dowiezie pod Twój adres.</>
          )}
        </>
      ),
    });
  }

  const sunday = openOnSunday(venues);
  if (sunday.length) {
    const hours = new Map(sunday.map(([l, g]) => [l.id, g]));
    result.push({
      pytanie: `${title} w niedzielę — co jest otwarte?`,
      odpowiedz: (
        <>
          Według podanych godzin w niedzielę otwarte są:{" "}
          <NameList lokale={sunday.map(([l]) => l)} dopisek={(l) => hours.get(l.id)!} />. W święta godziny mogą
          być inne — przed wyjazdem warto zadzwonić.
        </>
      ),
    });
  }
  return result;
}
