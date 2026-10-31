import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PhraseBanner,
  DeliveryPricing,
  StructuredData,
  Order,
  NameList,
  Pills,
  Faq,
  Section,
  VenueGrid,
  deliveryPrice,
  ileLokali,
  type Breadcrumb,
  type Question,
} from "@/components/StronaFrazy";
import { formatPln } from "@/lib/ceny";
import { getVenues, type Venue } from "@/lib/lokale";
import type { Delivery } from "@/lib/menu";
import {
  deliveryPricing,
  categoriesWithPage,
  categoryVenues,
  areaVenues,
  venuesWithDelivery,
  areasWithDelivery,
  withDelivery,
  type Area,
} from "@/lib/seo";

// Strona „Jedzenie z dowozem w Kraśniku” — pod wyszukiwania „dowóz Kraśnik”, „pizza z dowozem Kraśnik”:
// kto dowozi, ile kosztuje dostawa do której miejscowości i od jakiej kwoty.

// Cała strona statyczna: nieznany adres czeka na wynik zamiast szkieletu z kodem 200, więc dostaje prawdziwe 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const areas = areasWithDelivery(await getVenues());
  // Cache Components wymaga co najmniej jednego parametru; „brak” → 404.
  return areas.length ? areas.map((o) => ({ obszar: o.slug })) : [{ obszar: "brak" }];
}

async function load(params: PageProps<"/[obszar]/dowoz">["params"]) {
  const { obszar: slug } = await params;
  const venues = await getVenues();
  const area = areasWithDelivery(venues).find((o) => o.slug === slug);
  if (!area) return null;
  const { w, okolica } = venuesWithDelivery(venues, area);
  return { lokale: venues, obszar: area, w, okolica, cenniki: await deliveryPricing([...w, ...okolica]) };
}

export async function generateMetadata({ params }: PageProps<"/[obszar]/dowoz">): Promise<Metadata> {
  const date = await load(params);
  if (!date) return {};
  const { obszar, w } = date;
  const names = w.slice(0, 3).map((l) => l.nazwa);
  return {
    title: `Jedzenie z dowozem ${obszar.nazwa} — kto dowozi i za ile`,
    description: `Dowóz jedzenia ${obszar.w}: ${names.join(", ")}${w.length > 3 ? " i inne" : ""}. Ceny dostawy, minimalne zamówienie i telefon — zamów pizzę albo obiad do domu.`,
    alternates: { canonical: `/${obszar.slug}/dowoz` },
  };
}

export default async function DeliveryPage({ params }: PageProps<"/[obszar]/dowoz">) {
  const date = await load(params);
  if (!date) notFound();
  const { lokale, obszar, w, okolica, cenniki } = date;
  const withoutPricing = w.filter((l) => !cenniki.some((c) => c.lokal.id === l.id));
  const breadcrumbs: Breadcrumb[] = [
    { nazwa: "szamanie.pl", adres: "/" },
    { nazwa: obszar.nazwa, adres: `/${obszar.slug}` },
    { nazwa: "Dowóz", adres: `/${obszar.slug}/dowoz` },
  ];
  const categories = categoriesWithPage(lokale, obszar).filter((k) => k.dowoz);
  const otherAreas = areasWithDelivery(lokale).filter((o) => o.slug !== obszar.slug);

  return (
    <>
      <StructuredData okruszki={breadcrumbs} lokale={w} />
      <PhraseBanner okruszki={breadcrumbs} tytul={`Jedzenie z dowozem ${obszar.w}`} zdjecie="pizza">
        <p>
          {ileLokali(w.length)} z dowozem {obszar.w}
          {okolica.length > 0 && <> i {okolica.length} w okolicy</>}. Sprawdź, kto dowiezie pod Twój adres, ile kosztuje
          dostawa i od jakiej kwoty.
        </p>
      </PhraseBanner>

      <div className="mx-auto max-w-6xl px-5">
        <Section id="lokale" tytul={`Kto dowozi ${obszar.w}: ${ileLokali(w.length)}`}>
          <VenueGrid lokale={w} />
          <Order />
        </Section>

        {okolica.length > 0 && (
          <Section id="okolica" tytul="Z dowozem w okolicy">
            <VenueGrid lokale={okolica} />
          </Section>
        )}

        {cenniki.length > 0 && (
          <Section id="cennik" tytul={`Ile kosztuje dowóz ${obszar.w}?`}>
            <p className="mb-4 max-w-3xl leading-relaxed font-semibold text-tekst-2">
              Ceny dostawy do poszczególnych miejscowości i części miasta, tak jak podają lokale. Im dalej, tym zwykle
              drożej i z wyższym minimalnym zamówieniem.
              {withoutPricing.length > 0 && (
                <>
                  {" "}
                  Cennika jeszcze nie mamy od: <NameList lokale={withoutPricing} /> — zapytaj przy zamówieniu.
                </>
              )}
            </p>
            <DeliveryPricing cenniki={cenniki} />
          </Section>
        )}

        <Faq tytul="Pytania i odpowiedzi" pytania={questions(lokale, obszar, w, okolica, cenniki)} />

        <Section id="wiecej" tytul={`Więcej ${obszar.w}`}>
          <Pills
            linki={[
              { nazwa: `Wszystkie lokale ${obszar.w}`, adres: `/${obszar.slug}` },
              ...categories.map((k) => ({ nazwa: k.nazwa, adres: `/${obszar.slug}/${k.slug}` })),
              ...otherAreas.map((o) => ({ nazwa: `Dowóz ${o.w}`, adres: `/${o.slug}/dowoz` })),
            ]}
          />
        </Section>
      </div>
    </>
  );
}

function questions(
  venues: Venue[],
  area: Area,
  w: Venue[],
  surroundings: Venue[],
  pricing: { lokal: Venue; dostawa: Delivery }[],
): Question[] {
  const result: Question[] = [
    {
      pytanie: `Kto dowozi jedzenie ${area.w}?`,
      odpowiedz: (
        <>
          Dowóz oznaczyły: <NameList lokale={w} />
          {surroundings.length > 0 && (
            <>
              , a w okolicy: <NameList lokale={surroundings} />
            </>
          )}
          . Przy każdym lokalu jest telefon i godziny otwarcia — od razu widać, kto teraz przyjmuje zamówienia.
        </>
      ),
    },
  ];

  // Strefy obejmujące sam obszar, np. „Kraśnik Fabryczny” i „Kraśnik Stary” → miejsca ["Kraśnik"].
  const inArea = pricing.flatMap(({ lokal, dostawa }) => {
    const zones = dostawa.strefy.filter((s) => s.miejsca.includes(area.nazwa));
    return zones.length ? [{ lokal, strefy: zones }] : [];
  });
  if (inArea.length) {
    result.push({
      pytanie: `Ile kosztuje dowóz ${area.w}?`,
      odpowiedz: (
        <>
          {inArea.map(({ lokal, strefy }, i) => (
            <span key={lokal.id}>
              {i > 0 && " "}
              <NameList lokale={[lokal]} />:{" "}
              {strefy
                .map((s) =>
                  s.cenaGr === null
                    ? `${s.nazwa} — cenę podaje przy zamówieniu`
                    : `${s.nazwa} — ${deliveryPrice(s)}${s.minGr ? ` (zamówienie od ${formatPln(s.minGr)})` : ""}`,
                )
                .join(", ")}
              .
            </span>
          ))}{" "}
          Ceny do okolicznych miejscowości są w cenniku wyżej.
        </>
      ),
    });
  }

  // „Pizza z dowozem w Kraśniku” — tylko kategorie, w których ktoś dowozi.
  for (const k of categoriesWithPage(venues, area).filter((k) => k.dowoz)) {
    const fromCategory = categoryVenues(venues, area, k).w.filter((l) => l.dostawa);
    if (!fromCategory.length) continue;
    result.push({
      pytanie: `${k.nazwa} z dowozem ${area.w} — gdzie zamówić?`,
      odpowiedz: (
        <>
          Z dowozem: <NameList lokale={fromCategory} />. Wszystkie lokale z tej kategorii, także na miejscu i na wynos:{" "}
          <Link
            href={`/${area.slug}/${k.slug}`}
            className="font-extrabold text-akcent-tekst underline-offset-2 hover:underline"
          >
            {k.nazwa} {area.w}
          </Link>
          .
        </>
      ),
    });
  }

  // bez lodziarni — lody na wynos to oczywistość, a sieciówka z trzema punktami trzy razy powtarza tę samą nazwę
  const takeaway = withDelivery(areaVenues(venues, area).w).naWynos.filter((l) => l.typ !== "ice_cream");
  if (takeaway.length) {
    result.push({
      pytanie: `Gdzie wziąć jedzenie na wynos ${area.w}?`,
      odpowiedz: (
        <>
          Na wynos (bez dowozu): <NameList lokale={takeaway} />. Zadzwoń wcześniej, a jedzenie będzie gotowe, kiedy
          podjedziesz.
        </>
      ),
    });
  }

  result.push({
    pytanie: "Jak zamówić jedzenie z dowozem przez szamanie.pl?",
    odpowiedz: (
      <>
        Na stronie lokalu dodaj dania z menu do listy — zobaczysz sumę razem z dostawą do Twojej miejscowości
        i minimalne zamówienie. Potem „Zadzwoń i zamów”: lista zostaje na ekranie, więc czytasz zamówienie prosto
        z telefonu. Bez konta i bez prowizji — płacisz lokalowi jak zwykle.
      </>
    ),
  });
  return result;
}
