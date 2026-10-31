import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PhraseBanner,
  StructuredData,
  Order,
  CategoryTile,
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
import { venuesFound, cuisineName } from "@/lib/format";
import {
  categoriesWithPage,
  categoryVenues,
  areaVenues,
  areasWithDelivery,
  areasWithPage,
  openOnSunday,
  pageTitle,
  findPage,
  withDelivery,
  type Area,
} from "@/lib/seo";

// „Gdzie zjeść w Kraśniku?” page — all venues of the area and category tiles (/krasnik/pizza etc.).

// The whole page is static: an unknown URL waits for the result instead of a 200 skeleton, so it gets a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const areas = areasWithPage(await getVenues());
  // Cache Components needs at least one parameter; „brak” → 404.
  return areas.length ? areas.map((o) => ({ obszar: o.slug })) : [{ obszar: "brak" }];
}

async function load(params: PageProps<"/[obszar]">["params"]) {
  const { obszar: slug } = await params;
  const venues = await getVenues();
  const page = findPage(venues, slug);
  return page && { lokale: venues, obszar: page.obszar };
}

export async function generateMetadata({ params }: PageProps<"/[obszar]">): Promise<Metadata> {
  const date = await load(params);
  if (!date) return {};
  const { lokale, obszar } = date;
  const { w } = areaVenues(lokale, obszar);
  const categories = categoriesWithPage(lokale, obszar).map((k) => k.nazwa.toLowerCase());
  return {
    title: pageTitle(`Gdzie zjeść ${obszar.w}? ${ileLokali(w.length)}: ${categories.slice(0, 3).join(", ")}`),
    description: `Gdzie zjeść ${obszar.w}: ${[...categories.slice(0, 4), "inne"].join(", ")}. ${ileLokali(w.length)} z godzinami otwarcia, telefonem i dojazdem w jednym miejscu.`,
    alternates: { canonical: `/${obszar.slug}` },
  };
}

export default async function AreaPage({ params }: PageProps<"/[obszar]">) {
  const date = await load(params);
  if (!date) notFound();
  const { lokale, obszar } = date;
  const { w, okolica } = areaVenues(lokale, obszar);
  const categories = categoriesWithPage(lokale, obszar).map((k) => ({
    k,
    ile: categoryVenues(lokale, obszar, k).w.length,
  }));
  const otherAreas = areasWithPage(lokale).filter((o) => o.slug !== obszar.slug);
  const breadcrumbs: Breadcrumb[] = [
    { nazwa: "szamanie.pl", adres: "/" },
    { nazwa: obszar.nazwa, adres: `/${obszar.slug}` },
  ];

  return (
    <>
      <StructuredData okruszki={breadcrumbs} lokale={w} />
      <PhraseBanner okruszki={breadcrumbs} tytul={`Gdzie zjeść ${obszar.w}?`} zdjecie="restauracja">
        <p>
          {ileLokali(w.length)} {obszar.w}
          {categories.length > 0 && <>: {categories.map(({ k }) => k.nazwa.toLowerCase()).join(", ")}</>}. Godziny
          otwarcia, telefon i dojazd w jednym miejscu.
        </p>
      </PhraseBanner>

      <div className="mx-auto max-w-6xl px-5">
        {categories.length > 0 && (
          <Section id="kategorie" tytul="Na co masz ochotę?">
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map(({ k, ile }) => (
                <CategoryTile key={k.slug} k={k} o={obszar} ile={ile} />
              ))}
            </ul>
          </Section>
        )}

        <Section id="lokale" tytul={`Wszystkie lokale ${obszar.w}`}>
          <VenueGrid lokale={w} />
          <Order />
        </Section>

        {okolica.length > 0 && (
          <Section id="okolica" tytul="W okolicy">
            <VenueGrid lokale={okolica} />
          </Section>
        )}

        <Faq
          tytul="Pytania i odpowiedzi"
          pytania={questions(obszar, w, categories, areasWithDelivery(lokale).some((o) => o.slug === obszar.slug))}
        />

        {otherAreas.length > 0 && (
          <Section id="inne" tytul="Inne miejscowości">
            <Pills linki={otherAreas.map((o) => ({ nazwa: o.nazwa, adres: `/${o.slug}` }))} />
          </Section>
        )}
      </div>
    </>
  );
}

function questions(
  area: Area,
  venues: Venue[],
  categories: { k: { nazwa: string }; ile: number }[],
  hasDelivery: boolean, // whether the area has a /<area>/dowoz page
): Question[] {
  const result: Question[] = [];
  const cuisines = [...new Set(venues.flatMap((l) => l.kuchnie.map(cuisineName)))];

  result.push({
    pytanie: `Gdzie zjeść ${area.w}?`,
    odpowiedz: (
      <>
        Na szamanie.pl {venuesFound(venues.length)} {area.w}
        {categories.length > 0 && (
          <>
            , najwięcej w kategoriach:{" "}
            {[...categories]
              .sort((a, b) => b.ile - a.ile)
              .slice(0, 4)
              .map(({ k, ile }) => `${k.nazwa.toLowerCase()} (${ile})`)
              .join(", ")}
          </>
        )}
        .{cuisines.length > 0 && <> Kuchnie: {cuisines.slice(0, 8).join(", ").toLowerCase()}.</>}
      </>
    ),
  });

  const sunday = openOnSunday(venues);
  if (sunday.length) {
    const hours = new Map(sunday.map(([l, g]) => [l.id, g]));
    result.push({
      pytanie: `Co jest otwarte w niedzielę ${area.w}?`,
      odpowiedz: (
        <>
          Według podanych godzin w niedzielę otwarte są: <NameList lokale={sunday.slice(0, 10).map(([l]) => l)} dopisek={(l) => hours.get(l.id)!} />
          {sunday.length > 10 && <> i {ileLokali(sunday.length - 10)} więcej</>}. Godziny w święta mogą być inne —
          przed wyjazdem warto zadzwonić.
        </>
      ),
    });
  }

  const { dowoz } = withDelivery(venues);
  if (dowoz.length) {
    result.push({
      pytanie: `Kto dowozi jedzenie ${area.w}?`,
      odpowiedz: (
        <>
          Dowóz oznaczyły: <NameList lokale={dowoz.slice(0, 10)} />.{" "}
          {hasDelivery ? (
            <>
              Ceny dostawy do Twojej miejscowości:{" "}
              <Link
                href={`/${area.slug}/dowoz`}
                className="font-extrabold text-akcent-tekst underline-offset-2 hover:underline"
              >
                jedzenie z dowozem {area.w}
              </Link>
              .
            </>
          ) : (
            <>Strefy i ceny dostawy dopiero zbieramy — zadzwoń do lokalu i zapytaj, czy dowiezie pod Twój adres.</>
          )}
        </>
      ),
    });
  }
  return result;
}
