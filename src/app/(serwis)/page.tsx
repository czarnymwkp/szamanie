import type { Metadata } from "next";
import { Pills } from "@/components/StronaFrazy";
import SketchHome from "@/components/szkic/GlownaSzkic";
import { SITE_URL } from "@/lib/konfiguracja";
import { getVenues, getTowns, type Venue } from "@/lib/lokale";
import { venueCount } from "@/lib/nazwy";
import { excludeHallsOnly } from "@/lib/przyjecia";
import { toIndex, categoriesWithPage, AREAS, areasWithDelivery, areasWithPage } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Nazwa witryny i logo dla Google — w wynikach wyszukiwania zamiast adresu pokazuje się „szamanie.pl”.
const SITE_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "szamanie.pl",
    alternateName: "Szamanie",
    url: `${SITE_URL}/`,
    inLanguage: "pl",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "szamanie.pl",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
  },
];

export default async function HomePage() {
  const [lokale, miejscowosci] = await Promise.all([getVenues(), getTowns()]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_DATA).replace(/</g, "\\u003c") }}
      />
      <SketchHome lokale={excludeHallsOnly(lokale)} miejscowosci={miejscowosci} />
      <Guide lokale={lokale} />
    </>
  );
}

/**
 * „Gdzie zjeść w Kraśniku i okolicy” pod listą: krótki opis i linki do wszystkich stron fraz, sal i lokali
 * z miejscowości bez własnej strony. Strona główna jest najmocniejsza w Google, więc linki z niej mówią,
 * które podstrony są ważne — a „Co dziś szamiesz?” samo nie mówi Google, o czym jest serwis.
 */
async function Guide({ lokale }: { lokale: Venue[] }) {
  const food = excludeHallsOnly(lokale);
  const withPage = areasWithPage(lokale);
  const withDelivery = areasWithDelivery(lokale);
  // lokale z gmin bez strony obszaru (Urzędów, Dzierzkowice…) — tylko te, które są w Google
  const communesWithPage = new Set(withPage.flatMap((o) => [...o.gminy, ...o.okolica]));
  const rest = food.filter((l) => l.gmina && !communesWithPage.has(l.gmina));
  const inIndex = await Promise.all(rest.map(toIndex));
  const smaller = rest
    .filter((_, i) => inIndex[i])
    .sort((a, b) => (a.miejscowosc ?? "").localeCompare(b.miejscowosc ?? "", "pl") || a.nazwa.localeCompare(b.nazwa, "pl"));

  return (
    <section aria-labelledby="przewodnik" className="mx-auto max-w-5xl px-5 pt-12 pb-4">
      <h2 id="przewodnik" className="text-2xl font-black lg:text-3xl">
        Gdzie zjeść w Kraśniku i okolicy
      </h2>
      <p className="mt-2 max-w-3xl leading-relaxed font-semibold text-tekst-2">
        Na szamanie.pl jest {venueCount(food.length)} z Kraśnika i powiatu kraśnickiego: pizzerie, kebaby,
        restauracje z domowymi obiadami, kawiarnie i lodziarnie. Przy każdym znajdziesz godziny otwarcia, telefon
        i dojazd, a przy wielu także menu z cenami i listę, z której zamówisz jedzenie przez telefon.
      </p>

      {withPage.map((o) => (
        <div key={o.slug} className="mt-6">
          <h3 className="mb-2 text-lg font-black">{o.nazwa}</h3>
          <Pills
            linki={[
              { nazwa: `Gdzie zjeść ${o.w}`, adres: `/${o.slug}` },
              ...(withDelivery.includes(o) ? [{ nazwa: `Jedzenie z dowozem ${o.w}`, adres: `/${o.slug}/dowoz` }] : []),
              ...categoriesWithPage(lokale, o).map((k) => ({ nazwa: `${k.nazwa} ${o.w}`, adres: `/${o.slug}/${k.slug}` })),
            ]}
          />
        </div>
      ))}

      <div className="mt-6">
        <h3 className="mb-2 text-lg font-black">Wesela i przyjęcia</h3>
        <Pills linki={[{ nazwa: "Sale na wesela, komunie i chrzciny", adres: "/sale-weselne" }]} />
      </div>

      {smaller.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-black">
            {AREAS.filter((o) => !withPage.includes(o) && smaller.some((l) => l.gmina && o.gminy.includes(l.gmina)))
              .map((o) => o.nazwa)
              .join(", ")}{" "}
            i okolice
          </h3>
          <Pills linki={smaller.map((l) => ({ nazwa: `${l.nazwa} · ${l.miejscowosc}`, adres: `/lokal/${l.slug}` }))} />
        </div>
      )}
    </section>
  );
}
