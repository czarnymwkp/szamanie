import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventDetails } from "@/components/Events";
import { Pills, Section } from "@/components/PhrasePage";
import VenueTemplate from "@/components/templates";
import { schemaOrgHours, parseHours } from "@/lib/hours";
import { SITE_URL } from "@/lib/config";
import { getVenue, getVenues, type Venue } from "@/lib/venues";
import { getMenu, type Menu } from "@/lib/menu";
import { facebookUrl, websiteUrl, cuisineName, venueDescription, fullAddress } from "@/lib/format";
import { venueEvents } from "@/lib/events";
import { toIndex, categoriesWithPage, categoryVenues, areasWithPage, pageTitle, type Area } from "@/lib/seo";

// The whole page is static: an unknown URL waits for the result instead of a 200 skeleton, so it gets a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const venues = await getVenues();
  // Cache Components needs at least one parameter; an empty database → 404 page.
  return venues.length ? venues.map((l) => ({ slug: l.slug })) : [{ slug: "brak" }];
}

export async function generateMetadata({ params }: PageProps<"/lokal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return {};
  const [menu, lokale, indeks] = await Promise.all([getMenu(venue.id), getVenues(), toIndex(venue)]);
  const city = venue.miejscowosc ?? "Kraśnik";
  // „Zapiekanki Kraśnik - Bar Przekąskowy” without a second „Kraśnik”; venues with the same name in the same town
  // (three ice-cream shops of Sandomierska Manufaktura Lodów) are told apart by the street — short, without first names
  // and ranks („Generała Władysława Sikorskiego 7a” → „Sikorskiego 7a”), because the title is long anyway.
  const street = venue.adres?.match(/(?:(?:Plac|Aleja|Al\.|Rynek|Osiedle|Os\.) )?\S+ \d\S*$/)?.[0] ?? venue.adres;
  const where = [
    venue.nazwa.toLowerCase().includes(city.toLowerCase()) ? "" : ` ${city}`,
    street && lokale.some((l) => l.id !== venue.id && l.nazwa === venue.nazwa && l.miejscowosc === venue.miejscowosc)
      ? `, ${street}`
      : "",
  ].join("");
  const services = [venue.dostawa && "dowóz", venue.naWynos && "na wynos"].filter(Boolean).join(" i ");
  // type and at most two cuisines — the full list („Kawa · Lody · Makarony · Sałatki…”) pushes the description past 160
  // characters
  const kind = venueDescription(venue).split(" · ").slice(0, 3).join(" · ");
  // With a menu the title catches searches like „<venue> Kraśnik menu”, „… ceny”. The name goes into the description,
  // otherwise five kebab places would share one description.
  const fullPath = `${venue.nazwa}${where} — ${menu ? "menu i ceny" : "godziny i telefon"}`;
  // very long name (with the street): a shorter ending, so the whole title fits in a Google result
  const title = fullPath.length > 60 ? `${venue.nazwa}${where} — ${menu ? "menu" : "godziny"}` : fullPath;
  return {
    // long venue name: no „ | szamanie.pl” suffix, so Google does not cut off „menu i ceny”
    title: pageTitle(title),
    description: menu
      ? `${venue.nazwa}: menu z cenami (${menu.liczba} pozycji), godziny otwarcia, telefon i dojazd. ${kind}, ${fullAddress(venue)}.`
      : `${venue.nazwa} — ${kind}, ${fullAddress(venue)}. ${services ? `${services[0].toUpperCase()}${services.slice(1)}. ` : ""}Sprawdź godziny otwarcia, telefon i dojazd.`,
    alternates: { canonical: `/lokal/${venue.slug}` },
    ...(!indeks && { robots: { index: false, follow: true } }),
  };
}

const SCHEMA_TYPES: Record<string, string> = {
  restaurant: "Restaurant",
  fast_food: "FastFoodRestaurant",
  cafe: "CafeOrCoffeeShop",
  pub: "BarOrPub",
  bar: "BarOrPub",
  ice_cream: "IceCreamShop",
};

// Structured data for Google (schema.org), so the venue can show up with its address, opening hours and menu.
function structuredData(venue: Venue, menu: Menu | null) {
  const week = parseHours(venue.godziny);
  return {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPES[venue.typ] ?? "FoodEstablishment",
    name: venue.nazwa,
    url: `${SITE_URL}/lokal/${venue.slug}`,
    telephone: venue.telefon ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.adres ?? undefined,
      addressLocality: venue.miejscowosc ?? undefined,
      addressCountry: "PL",
    },
    geo: { "@type": "GeoCoordinates", latitude: venue.lat, longitude: venue.lon },
    servesCuisine: venue.kuchnie.length ? venue.kuchnie.map(cuisineName) : undefined,
    openingHours: week ? schemaOrgHours(week) : undefined,
    sameAs:
      venue.www || venue.facebook
        ? [venue.www && websiteUrl(venue.www), venue.facebook && facebookUrl(venue.facebook)].filter(Boolean)
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
              // item without a price (the venue does not publish prices) — no offers instead of an empty list or a
              // price of 0
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

/** Breadcrumbs for Google: szamanie.pl › Kraśnik › venue (the area only when it has its own page). */
function breadcrumbs(venue: Venue, area: Area | undefined) {
  const path = [
    { name: "szamanie.pl", item: SITE_URL },
    ...(area ? [{ name: area.nazwa, item: `${SITE_URL}/${area.slug}` }] : []),
    { name: venue.nazwa, item: `${SITE_URL}/lokal/${venue.slug}` },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: path.map((o, i) => ({ "@type": "ListItem", position: i + 1, ...o })),
  };
}

// URL-dependent content is inside <Suspense>, so the shared page shell can show right away. Cards in the list prefetch,
// so on click the content is already loaded and the banner morphs smoothly.
export default function VenuePage({ params }: PageProps<"/lokal/[slug]">) {
  return (
    <Suspense fallback={<VenueSkeleton />}>
      <VenueContent params={params} />
    </Suspense>
  );
}

async function VenueContent({ params }: Pick<PageProps<"/lokal/[slug]">, "params">) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();
  const [menu, lokale] = await Promise.all([getMenu(venue.id), getVenues()]);
  // Links to the phrase pages that include this venue („Pizza w Kraśniku”…).
  const area = areasWithPage(lokale).find((o) => venue.gmina && [...o.gminy, ...o.okolica].includes(venue.gmina));
  const links = area
    ? [
        ...categoriesWithPage(lokale, area)
          .filter((k) => {
            const { w, okolica } = categoryVenues([venue], area, k);
            return w.length + okolica.length > 0;
          })
          .map((k) => ({ nazwa: `${k.nazwa} ${area.w}`, adres: `/${area.slug}/${k.slug}` })),
        { nazwa: `Gdzie zjeść ${area.w}`, adres: `/${area.slug}` },
      ]
    : [];
  const events = venueEvents(venue);
  if (events) links.push({ nazwa: "Sale weselne i na przyjęcia", adres: "/sale-weselne" });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([structuredData(venue, menu), breadcrumbs(venue, area)]).replace(/</g, "\\u003c"),
        }}
      />
      <VenueTemplate lokal={venue} />
      {events && (
        <div className="mx-auto max-w-5xl px-5">
          <Section id="przyjecia" tytul="Wesela i przyjęcia">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-semibold text-tekst-2">
                {venue.nazwa} organizuje przyjęcia. O wolny termin i menu zapytaj przez telefon.
              </p>
              <EventDetails przyjecia={events} />
            </div>
          </Section>
        </div>
      )}
      {links.length > 0 && (
        <div className="mx-auto max-w-5xl px-5">
          <Section id="zobacz-tez" tytul="Zobacz też">
            <Pills linki={links} />
          </Section>
        </div>
      )}
    </>
  );
}

function VenueSkeleton() {
  return (
    // full screen height: on first load the footer does not flash right below the skeleton and jump down (CLS)
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
