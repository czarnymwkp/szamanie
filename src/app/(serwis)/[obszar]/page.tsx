import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BanerFrazy,
  DaneDlaGoogle,
  Kolejnosc,
  KafelekKategorii,
  ListaNazw,
  Pigulki,
  Pytania,
  Sekcja,
  SiatkaLokali,
  ileLokali,
  type Okruszek,
  type Pytanie,
} from "@/components/StronaFrazy";
import { pobierzLokale, type Lokal } from "@/lib/lokale";
import { jestLokali, nazwaKuchni } from "@/lib/nazwy";
import {
  kategorieZeStrona,
  lokaleKategorii,
  lokaleObszaru,
  obszaryZDowozem,
  obszaryZeStrona,
  otwarteWNiedziele,
  znajdzStrone,
  zDowozem,
  type Obszar,
} from "@/lib/seo";

// Strona „Gdzie zjeść w Kraśniku?” — wszystkie lokale obszaru i kafelki kategorii (/krasnik/pizza itd.).

// Cała strona statyczna: nieznany adres czeka na wynik zamiast szkieletu z kodem 200, więc dostaje prawdziwe 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const obszary = obszaryZeStrona(await pobierzLokale());
  // Cache Components wymaga co najmniej jednego parametru; „brak” → 404.
  return obszary.length ? obszary.map((o) => ({ obszar: o.slug })) : [{ obszar: "brak" }];
}

async function wczytaj(params: PageProps<"/[obszar]">["params"]) {
  const { obszar: slug } = await params;
  const lokale = await pobierzLokale();
  const strona = znajdzStrone(lokale, slug);
  return strona && { lokale, obszar: strona.obszar };
}

export async function generateMetadata({ params }: PageProps<"/[obszar]">): Promise<Metadata> {
  const dane = await wczytaj(params);
  if (!dane) return {};
  const { lokale, obszar } = dane;
  const { w } = lokaleObszaru(lokale, obszar);
  const kategorie = kategorieZeStrona(lokale, obszar).map((k) => k.nazwa.toLowerCase());
  return {
    title: `Gdzie zjeść ${obszar.w}? ${ileLokali(w.length)}`,
    description: `Gdzie zjeść ${obszar.w}: ${[...kategorie.slice(0, 4), "inne"].join(", ")}. ${ileLokali(w.length)} z godzinami otwarcia, telefonem i dojazdem w jednym miejscu.`,
    alternates: { canonical: `/${obszar.slug}` },
  };
}

export default async function StronaObszaru({ params }: PageProps<"/[obszar]">) {
  const dane = await wczytaj(params);
  if (!dane) notFound();
  const { lokale, obszar } = dane;
  const { w, okolica } = lokaleObszaru(lokale, obszar);
  const kategorie = kategorieZeStrona(lokale, obszar).map((k) => ({
    k,
    ile: lokaleKategorii(lokale, obszar, k).w.length,
  }));
  const inneObszary = obszaryZeStrona(lokale).filter((o) => o.slug !== obszar.slug);
  const okruszki: Okruszek[] = [
    { nazwa: "szamanie.pl", adres: "/" },
    { nazwa: obszar.nazwa, adres: `/${obszar.slug}` },
  ];

  return (
    <>
      <DaneDlaGoogle okruszki={okruszki} lokale={w} />
      <BanerFrazy okruszki={okruszki} tytul={`Gdzie zjeść ${obszar.w}?`} zdjecie="restauracja">
        <p>
          {ileLokali(w.length)} {obszar.w}
          {kategorie.length > 0 && <>: {kategorie.map(({ k }) => k.nazwa.toLowerCase()).join(", ")}</>}. Godziny
          otwarcia, telefon i dojazd w jednym miejscu.
        </p>
      </BanerFrazy>

      <div className="mx-auto max-w-6xl px-5">
        {kategorie.length > 0 && (
          <Sekcja id="kategorie" tytul="Na co masz ochotę?">
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {kategorie.map(({ k, ile }) => (
                <KafelekKategorii key={k.slug} k={k} o={obszar} ile={ile} />
              ))}
            </ul>
          </Sekcja>
        )}

        <Sekcja id="lokale" tytul={`Wszystkie lokale ${obszar.w}`}>
          <SiatkaLokali lokale={w} />
          <Kolejnosc />
        </Sekcja>

        {okolica.length > 0 && (
          <Sekcja id="okolica" tytul="W okolicy">
            <SiatkaLokali lokale={okolica} />
          </Sekcja>
        )}

        <Pytania
          tytul="Pytania i odpowiedzi"
          pytania={pytania(obszar, w, kategorie, obszaryZDowozem(lokale).some((o) => o.slug === obszar.slug))}
        />

        {inneObszary.length > 0 && (
          <Sekcja id="inne" tytul="Inne miejscowości">
            <Pigulki linki={inneObszary.map((o) => ({ nazwa: o.nazwa, adres: `/${o.slug}` }))} />
          </Sekcja>
        )}
      </div>
    </>
  );
}

function pytania(
  obszar: Obszar,
  lokale: Lokal[],
  kategorie: { k: { nazwa: string }; ile: number }[],
  maDowoz: boolean, // czy obszar ma stronę /<obszar>/dowoz
): Pytanie[] {
  const wynik: Pytanie[] = [];
  const kuchnie = [...new Set(lokale.flatMap((l) => l.kuchnie.map(nazwaKuchni)))];

  wynik.push({
    pytanie: `Gdzie zjeść ${obszar.w}?`,
    odpowiedz: (
      <>
        Na szamanie.pl {jestLokali(lokale.length)} {obszar.w}
        {kategorie.length > 0 && (
          <>
            , najwięcej w kategoriach:{" "}
            {[...kategorie]
              .sort((a, b) => b.ile - a.ile)
              .slice(0, 4)
              .map(({ k, ile }) => `${k.nazwa.toLowerCase()} (${ile})`)
              .join(", ")}
          </>
        )}
        .{kuchnie.length > 0 && <> Kuchnie: {kuchnie.slice(0, 8).join(", ").toLowerCase()}.</>}
      </>
    ),
  });

  const niedziela = otwarteWNiedziele(lokale);
  if (niedziela.length) {
    const godziny = new Map(niedziela.map(([l, g]) => [l.id, g]));
    wynik.push({
      pytanie: `Co jest otwarte w niedzielę ${obszar.w}?`,
      odpowiedz: (
        <>
          Według podanych godzin w niedzielę otwarte są: <ListaNazw lokale={niedziela.slice(0, 10).map(([l]) => l)} dopisek={(l) => godziny.get(l.id)!} />
          {niedziela.length > 10 && <> i {ileLokali(niedziela.length - 10)} więcej</>}. Godziny w święta mogą być inne —
          przed wyjazdem warto zadzwonić.
        </>
      ),
    });
  }

  const { dowoz } = zDowozem(lokale);
  if (dowoz.length) {
    wynik.push({
      pytanie: `Kto dowozi jedzenie ${obszar.w}?`,
      odpowiedz: (
        <>
          Dowóz oznaczyły: <ListaNazw lokale={dowoz.slice(0, 10)} />.{" "}
          {maDowoz ? (
            <>
              Ceny dostawy do Twojej miejscowości:{" "}
              <Link
                href={`/${obszar.slug}/dowoz`}
                className="font-extrabold text-akcent-tekst underline-offset-2 hover:underline"
              >
                jedzenie z dowozem {obszar.w}
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
  return wynik;
}
