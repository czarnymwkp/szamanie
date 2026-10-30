import type { Metadata } from "next";
import Link from "next/link";
import { KartaSali } from "@/components/Przyjecia";
import {
  BanerFrazy,
  DaneDlaGoogle,
  Kolejnosc,
  ListaNazw,
  Pigulki,
  Pytania,
  Sekcja,
  type Okruszek,
  type Pytanie,
} from "@/components/StronaFrazy";
import { pobierzLokale, type Lokal } from "@/lib/lokale";
import { odmiana } from "@/lib/nazwy";
import { saleZListy, type Przyjecia, type RodzajPrzyjecia } from "@/lib/przyjecia";

// Strona pod wyszukiwania „sala weselna Kraśnik”, „komunia Kraśnik”, „chrzciny Kraśnik” — sale z całego powiatu,
// bo na wesele jedzie się dalej niż na pizzę.

const OKRUSZKI: Okruszek[] = [
  { nazwa: "szamanie.pl", adres: "/" },
  { nazwa: "Sale weselne", adres: "/sale-weselne" },
];

const ileSal = (n: number) => `${n} ${odmiana(n, ["sala", "sale", "sal"])}`;

export async function generateMetadata(): Promise<Metadata> {
  const sale = saleZListy(await pobierzLokale());
  const nazwy = sale.slice(0, 3).map(({ lokal, przyjecia }) => `${lokal.nazwa}${przyjecia.doOsob ? ` (do ${przyjecia.doOsob} osób)` : ""}`);
  return {
    title: "Sale weselne Kraśnik — wesela, komunie, chrzciny",
    description: `Sale na wesela, komunie i chrzciny w Kraśniku i okolicy: ${nazwy.join(", ")}${sale.length > 3 ? " i inne" : ""}. Ile osób mieszczą, noclegi i telefony.`,
    alternates: { canonical: "/sale-weselne" },
  };
}

export default async function SaleWeselne() {
  const sale = saleZListy(await pobierzLokale());
  return (
    <>
      <DaneDlaGoogle okruszki={OKRUSZKI} lokale={sale.map((s) => s.lokal)} />
      <BanerFrazy okruszki={OKRUSZKI} tytul="Sale na wesela i przyjęcia w Kraśniku i okolicy" zdjecie="restauracja">
        <p>
          {ileSal(sale.length)} w Kraśniku i powiecie kraśnickim na wesele, komunię, chrzciny albo urodziny — ile osób
          mieszczą, czy mają noclegi i telefon, żeby od razu zapytać o wolny termin.
        </p>
      </BanerFrazy>

      <div className="mx-auto max-w-6xl px-5">
        <Sekcja id="sale" tytul={`Sale na przyjęcia: ${ileSal(sale.length)}`}>
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sale.map(({ lokal, przyjecia }) => (
              <KartaSali key={lokal.id} lokal={lokal} przyjecia={przyjecia} />
            ))}
          </ul>
          <Kolejnosc />
        </Sekcja>

        <Pytania tytul="Pytania i odpowiedzi" pytania={pytania(sale)} />

        <Sekcja id="wiecej" tytul="Więcej">
          <Pigulki
            linki={[
              { nazwa: "Gdzie zjeść w Kraśniku", adres: "/krasnik" },
              { nazwa: "Restauracje w Kraśniku", adres: "/krasnik/restauracje" },
              { nazwa: "Prowadzisz salę? Dodaj ją", adres: "/dla-lokali" },
            ]}
          />
        </Sekcja>
      </div>
    </>
  );
}

function pytania(sale: { lokal: Lokal; przyjecia: Przyjecia }[]): Pytanie[] {
  const z = (rodzaj: RodzajPrzyjecia) => sale.filter((s) => s.przyjecia.rodzaje.includes(rodzaj)).map((s) => s.lokal);
  const pojemnosc = (l: Lokal) => {
    const n = sale.find((s) => s.lokal.id === l.id)?.przyjecia.doOsob;
    return n ? `do ${n} osób` : "";
  };
  const wynik: Pytanie[] = [];
  const wesela = z("wesela");
  if (wesela.length) {
    wynik.push({
      pytanie: "Gdzie zrobić wesele w Kraśniku i okolicy?",
      odpowiedz: (
        <>
          Wesela organizują: <ListaNazw lokale={wesela} dopisek={pojemnosc} />. Terminy na sezon rezerwuje się zwykle
          z dużym wyprzedzeniem, więc najlepiej od razu zadzwonić i zapytać o wolną datę.
        </>
      ),
    });
  }
  const rodzinne = sale.filter((s) => s.przyjecia.rodzaje.some((r) => r === "komunie" || r === "chrzciny"));
  if (rodzinne.length) {
    wynik.push({
      pytanie: "Gdzie zorganizować komunię albo chrzciny?",
      odpowiedz: (
        <>
          Komunie i chrzciny robią: <ListaNazw lokale={rodzinne.map((s) => s.lokal)} />. Przy mniejszym przyjęciu
          zapytaj też{" "}
          <Link href="/krasnik/restauracje" className="font-extrabold text-akcent-tekst underline-offset-2 hover:underline">
            restauracje w Kraśniku
          </Link>{" "}
          — wiele z nich przyjmuje rodzinne obiady.
        </>
      ),
    });
  }
  const noclegi = sale.filter((s) => s.przyjecia.noclegi).map((s) => s.lokal);
  if (noclegi.length) {
    wynik.push({
      pytanie: "Która sala ma noclegi dla gości?",
      odpowiedz: (
        <>
          Pokoje dla gości weselnych mają: <ListaNazw lokale={noclegi} />.
        </>
      ),
    });
  }
  const firmowe = z("firmowe");
  if (firmowe.length) {
    wynik.push({
      pytanie: "Gdzie zrobić imprezę firmową albo konferencję?",
      odpowiedz: (
        <>
          Imprezy firmowe i spotkania organizują: <ListaNazw lokale={firmowe} />.
        </>
      ),
    });
  }
  return wynik;
}
