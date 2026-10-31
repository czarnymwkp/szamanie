import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { renderSVG } from "uqr";
import PrintButton from "@/components/PrintButton";
import CopyCode from "@/components/CopyCode";
import { SITE_URL } from "@/lib/config";
import { getVenue, getVenues } from "@/lib/venues";

// Naklejka do druku z kodem QR do strony lokalu i odznaka na stronę www lokalu (link do nas — ważny dla Google).
// Bez nagłówka i stopki serwisu, żeby wydruk był czysty; nie do indeksowania (robots.ts: Disallow /naklejka).

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "Naklejka i odznaka dla lokalu",
  robots: { index: false, follow: false },
};

export async function generateStaticParams() {
  const venues = await getVenues();
  return venues.length ? venues.map((l) => ({ slug: l.slug })) : [{ slug: "brak" }];
}

export default async function Sticker({ params }: PageProps<"/naklejka/[slug]">) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();
  const address = `${SITE_URL}/lokal/${venue.slug}`;
  const badgeCode = `<a href="${address}" title="${venue.nazwa} — menu, godziny i telefon na szamanie.pl"><img src="${SITE_URL}/odznaka.svg" alt="Znajdziesz nas na szamanie.pl" width="200" height="64"></a>`;

  return (
    <main id="tresc" className="mx-auto w-full max-w-3xl px-5 py-8 print:p-0">
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-black">Naklejka dla: {venue.nazwa}</h1>
        <p className="mt-1 font-semibold text-tekst-2">
          Wydrukuj i powieś na drzwiach, przy kasie albo w karcie menu. Kod QR otwiera stronę lokalu na szamanie.pl.
        </p>
        <PrintButton tekst="Drukuj naklejkę" />
      </div>

      <section
        aria-label="Naklejka"
        className="mx-auto flex aspect-[1/1.414] w-full max-w-[105mm] flex-col items-center overflow-hidden rounded-[1.6rem] border-[3px] border-tekst bg-white text-center print:rounded-none print:border-2"
      >
        <div className="w-full bg-akcent px-6 py-5">
          <p className="text-xl leading-tight font-black text-tekst">Znajdziesz nas na</p>
          <Image src="/logo-jasne-tlo.png" alt="szamanie.pl" width={1793} height={388} className="mx-auto mt-2 w-4/5 rounded-lg bg-tlo px-2 py-1" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-4">
          <p className="text-2xl leading-tight font-black text-balance">{venue.nazwa}</p>
          <div
            className="mt-3 w-3/5 [&_svg]:h-auto [&_svg]:w-full"
            // SVG z biblioteki uqr — same kwadraty kodu
            dangerouslySetInnerHTML={{ __html: renderSVG(address, { border: 1 }) }}
          />
          <p className="mt-3 text-base leading-snug font-extrabold">Zeskanuj aparatem w telefonie:</p>
          <p className="text-sm font-semibold text-tekst-2">menu, godziny, telefon i lista do zamówienia</p>
        </div>
      </section>

      <section aria-labelledby="odznaka" className="mt-10 print:hidden">
        <h2 id="odznaka" className="text-xl font-black">
          Odznaka na stronę internetową lokalu
        </h2>
        <p className="mt-1 font-semibold text-tekst-2">
          Wklej ten kod na swojej stronie (np. w stopce). Goście trafią prosto do Twojego menu na szamanie.pl.
        </p>
        <div className="mt-3 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- podgląd dokładnie tej odznaki, którą wkleja lokal */}
          <img src="/odznaka.svg" alt="Znajdziesz nas na szamanie.pl" width={200} height={64} />
        </div>
        <div className="mt-3">
          <CopyCode kod={badgeCode} etykieta="Kod odznaki do wklejenia" />
        </div>
      </section>
    </main>
  );
}
