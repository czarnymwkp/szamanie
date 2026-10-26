import type { Metadata } from "next";
import BanerDlaLokali from "@/components/BanerDlaLokali";
import Katalog from "@/components/Katalog";
import { ADRES_SERWISU } from "@/lib/konfiguracja";
import { pobierzLokale, pobierzMiejscowosci } from "@/lib/lokale";

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
    url: `${ADRES_SERWISU}/`,
    inLanguage: "pl",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "szamanie.pl",
    url: `${ADRES_SERWISU}/`,
    logo: `${ADRES_SERWISU}/logo.png`,
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
      <Katalog lokale={lokale} miejscowosci={miejscowosci} />
      <BanerDlaLokali />
    </>
  );
}
