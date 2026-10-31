import type { Metadata } from "next";
import Link from "next/link";
import { HallCard } from "@/components/Przyjecia";
import {
  PhraseBanner,
  StructuredData,
  Order,
  NameList,
  Pills,
  Faq,
  Section,
  type Breadcrumb,
  type Question,
} from "@/components/StronaFrazy";
import { getVenues, type Venue } from "@/lib/lokale";
import { plural } from "@/lib/nazwy";
import { hallsFromList, type Events, type EventKind } from "@/lib/przyjecia";

// Strona pod wyszukiwania „sala weselna Kraśnik”, „komunia Kraśnik”, „chrzciny Kraśnik” — sale z całego powiatu,
// bo na wesele jedzie się dalej niż na pizzę.

const BREADCRUMBS: Breadcrumb[] = [
  { nazwa: "szamanie.pl", adres: "/" },
  { nazwa: "Sale weselne", adres: "/sale-weselne" },
];

const hallCount = (n: number) => `${n} ${plural(n, ["sala", "sale", "sal"])}`;

export async function generateMetadata(): Promise<Metadata> {
  const halls = hallsFromList(await getVenues());
  // w opisie największe sale z pojemnością — to najczęstsze pytanie przy wyborze
  const names = halls
    .filter((s) => s.przyjecia.doOsob)
    .sort((x, y) => y.przyjecia.doOsob! - x.przyjecia.doOsob!)
    .slice(0, 2)
    .map(({ lokal, przyjecia }) => `${lokal.nazwa} (do ${przyjecia.doOsob} osób)`);
  return {
    title: "Sale weselne Kraśnik — wesela, komunie, chrzciny",
    description: `${hallCount(halls.length)} na wesela, komunie i chrzciny w Kraśniku i okolicy, m.in. ${names.join(", ")}. Pojemność, noclegi i telefon.`,
    alternates: { canonical: "/sale-weselne" },
  };
}

export default async function WeddingHalls() {
  const halls = hallsFromList(await getVenues());
  return (
    <>
      <StructuredData okruszki={BREADCRUMBS} lokale={halls.map((s) => s.lokal)} />
      <PhraseBanner okruszki={BREADCRUMBS} tytul="Sale na wesela i przyjęcia w Kraśniku i okolicy" zdjecie="restauracja">
        <p>
          {hallCount(halls.length)} w Kraśniku i powiecie kraśnickim na wesele, komunię, chrzciny albo urodziny — ile osób
          mieszczą, czy mają noclegi i telefon, żeby od razu zapytać o wolny termin.
        </p>
      </PhraseBanner>

      <div className="mx-auto max-w-6xl px-5">
        <Section id="sale" tytul={`Sale na przyjęcia: ${hallCount(halls.length)}`}>
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {halls.map(({ lokal, przyjecia }) => (
              <HallCard key={lokal.id} lokal={lokal} przyjecia={przyjecia} />
            ))}
          </ul>
          <Order />
        </Section>

        <Faq tytul="Pytania i odpowiedzi" pytania={questions(halls)} />

        <Section id="wiecej" tytul="Więcej">
          <Pills
            linki={[
              { nazwa: "Gdzie zjeść w Kraśniku", adres: "/krasnik" },
              { nazwa: "Restauracje w Kraśniku", adres: "/krasnik/restauracje" },
              { nazwa: "Prowadzisz salę? Dodaj ją", adres: "/dla-lokali" },
            ]}
          />
        </Section>
      </div>
    </>
  );
}

function questions(halls: { lokal: Venue; przyjecia: Events }[]): Question[] {
  const z = (kind: EventKind) => halls.filter((s) => s.przyjecia.rodzaje.includes(kind)).map((s) => s.lokal);
  const capacity = (l: Venue) => {
    const n = halls.find((s) => s.lokal.id === l.id)?.przyjecia.doOsob;
    return n ? `do ${n} osób` : "";
  };
  const result: Question[] = [];
  const weddings = z("wesela");
  if (weddings.length) {
    result.push({
      pytanie: "Gdzie zrobić wesele w Kraśniku i okolicy?",
      odpowiedz: (
        <>
          Wesela organizują: <NameList lokale={weddings} dopisek={capacity} />. Terminy na sezon rezerwuje się zwykle
          z dużym wyprzedzeniem, więc najlepiej od razu zadzwonić i zapytać o wolną datę.
        </>
      ),
    });
  }
  const family = halls.filter((s) => s.przyjecia.rodzaje.some((r) => r === "komunie" || r === "chrzciny"));
  if (family.length) {
    result.push({
      pytanie: "Gdzie zorganizować komunię albo chrzciny?",
      odpowiedz: (
        <>
          Komunie i chrzciny robią: <NameList lokale={family.map((s) => s.lokal)} />. Przy mniejszym przyjęciu
          zapytaj też{" "}
          <Link href="/krasnik/restauracje" className="font-extrabold text-akcent-tekst underline-offset-2 hover:underline">
            restauracje w Kraśniku
          </Link>{" "}
          — wiele z nich przyjmuje rodzinne obiady.
        </>
      ),
    });
  }
  const lodging = halls.filter((s) => s.przyjecia.noclegi).map((s) => s.lokal);
  if (lodging.length) {
    result.push({
      pytanie: "Która sala ma noclegi dla gości?",
      odpowiedz: (
        <>
          Pokoje dla gości weselnych mają: <NameList lokale={lodging} />.
        </>
      ),
    });
  }
  const corporate = z("firmowe");
  if (corporate.length) {
    result.push({
      pytanie: "Gdzie zrobić imprezę firmową albo konferencję?",
      odpowiedz: (
        <>
          Imprezy firmowe i spotkania organizują: <NameList lokale={corporate} />.
        </>
      ),
    });
  }
  return result;
}
