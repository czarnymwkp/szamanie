import type { Metadata } from "next";
import { Pigulki } from "@/components/StronaFrazy";
import GlownaSzkic from "@/components/szkic/GlownaSzkic";
import { SITE_URL } from "@/lib/konfiguracja";
import { pobierzLokale, pobierzMiejscowosci, type Lokal } from "@/lib/lokale";
import { ileLokali } from "@/lib/nazwy";
import { bezSamychSal } from "@/lib/przyjecia";
import { doIndeksu, kategorieZeStrona, OBSZARY, obszaryZDowozem, obszaryZeStrona } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Nazwa witryny i logo dla Google — w wynikach wyszukiwania zamiast adresu pokazuje się „szamanie.pl”.
const DANE_WITRYNY = [
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

export default async function StronaGlowna() {
  const [lokale, miejscowosci] = await Promise.all([pobierzLokale(), pobierzMiejscowosci()]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DANE_WITRYNY).replace(/</g, "\\u003c") }}
      />
      <GlownaSzkic lokale={bezSamychSal(lokale)} miejscowosci={miejscowosci} />
      <Przewodnik lokale={lokale} />
    </>
  );
}

/**
 * „Gdzie zjeść w Kraśniku i okolicy” pod listą: krótki opis i linki do wszystkich stron fraz, sal i lokali
 * z miejscowości bez własnej strony. Strona główna jest najmocniejsza w Google, więc linki z niej mówią,
 * które podstrony są ważne — a „Co dziś szamiesz?” samo nie mówi Google, o czym jest serwis.
 */
async function Przewodnik({ lokale }: { lokale: Lokal[] }) {
  const doJedzenia = bezSamychSal(lokale);
  const zeStrona = obszaryZeStrona(lokale);
  const zDowozem = obszaryZDowozem(lokale);
  // lokale z gmin bez strony obszaru (Urzędów, Dzierzkowice…) — tylko te, które są w Google
  const gminyZeStrona = new Set(zeStrona.flatMap((o) => [...o.gminy, ...o.okolica]));
  const reszta = doJedzenia.filter((l) => l.gmina && !gminyZeStrona.has(l.gmina));
  const wIndeksie = await Promise.all(reszta.map(doIndeksu));
  const mniejsze = reszta
    .filter((_, i) => wIndeksie[i])
    .sort((a, b) => (a.miejscowosc ?? "").localeCompare(b.miejscowosc ?? "", "pl") || a.nazwa.localeCompare(b.nazwa, "pl"));

  return (
    <section aria-labelledby="przewodnik" className="mx-auto max-w-5xl px-5 pt-12 pb-4">
      <h2 id="przewodnik" className="text-2xl font-black lg:text-3xl">
        Gdzie zjeść w Kraśniku i okolicy
      </h2>
      <p className="mt-2 max-w-3xl leading-relaxed font-semibold text-tekst-2">
        Na szamanie.pl jest {ileLokali(doJedzenia.length)} z Kraśnika i powiatu kraśnickiego: pizzerie, kebaby,
        restauracje z domowymi obiadami, kawiarnie i lodziarnie. Przy każdym znajdziesz godziny otwarcia, telefon
        i dojazd, a przy wielu także menu z cenami i listę, z której zamówisz jedzenie przez telefon.
      </p>

      {zeStrona.map((o) => (
        <div key={o.slug} className="mt-6">
          <h3 className="mb-2 text-lg font-black">{o.nazwa}</h3>
          <Pigulki
            linki={[
              { nazwa: `Gdzie zjeść ${o.w}`, adres: `/${o.slug}` },
              ...(zDowozem.includes(o) ? [{ nazwa: `Jedzenie z dowozem ${o.w}`, adres: `/${o.slug}/dowoz` }] : []),
              ...kategorieZeStrona(lokale, o).map((k) => ({ nazwa: `${k.nazwa} ${o.w}`, adres: `/${o.slug}/${k.slug}` })),
            ]}
          />
        </div>
      ))}

      <div className="mt-6">
        <h3 className="mb-2 text-lg font-black">Wesela i przyjęcia</h3>
        <Pigulki linki={[{ nazwa: "Sale na wesela, komunie i chrzciny", adres: "/sale-weselne" }]} />
      </div>

      {mniejsze.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-black">
            {OBSZARY.filter((o) => !zeStrona.includes(o) && mniejsze.some((l) => l.gmina && o.gminy.includes(l.gmina)))
              .map((o) => o.nazwa)
              .join(", ")}{" "}
            i okolice
          </h3>
          <Pigulki linki={mniejsze.map((l) => ({ nazwa: `${l.nazwa} · ${l.miejscowosc}`, adres: `/lokal/${l.slug}` }))} />
        </div>
      )}
    </section>
  );
}
