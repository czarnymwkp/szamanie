import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BanerFrazy,
  CenyDan,
  DaneDlaGoogle,
  Kolejnosc,
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
import { pobierzMenu, type Menu } from "@/lib/menu";
import { jestLokali } from "@/lib/nazwy";
import {
  daniaKategorii,
  kategorieZeStrona,
  lokaleKategorii,
  obszaryZDowozem,
  obszaryZeStrona,
  otwarteWNiedziele,
  znajdzStrone,
  zDowozem,
  type KategoriaSeo,
  type Obszar,
} from "@/lib/seo";

// Strona „Pizza w Kraśniku” — pod wyszukiwanie „pizza Kraśnik”: lista lokali z kategorii i odpowiedzi na pytania.

// Cała strona statyczna: nieznany adres czeka na wynik zamiast szkieletu z kodem 200, więc dostaje prawdziwe 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const lokale = await pobierzLokale();
  const strony = obszaryZeStrona(lokale).flatMap((o) =>
    kategorieZeStrona(lokale, o).map((k) => ({ obszar: o.slug, kategoria: k.slug })),
  );
  // Cache Components wymaga co najmniej jednego parametru; „brak” → 404.
  return strony.length ? strony : [{ obszar: "brak", kategoria: "brak" }];
}

async function wczytaj(params: PageProps<"/[obszar]/[kategoria]">["params"]) {
  const { obszar: o, kategoria: k } = await params;
  const lokale = await pobierzLokale();
  const strona = znajdzStrone(lokale, o, k);
  if (!strona?.kategoria) return null;
  return { lokale, obszar: strona.obszar, kategoria: strona.kategoria, dania: await daniaKategorii(strona.kategoria) };
}

export async function generateMetadata({ params }: PageProps<"/[obszar]/[kategoria]">): Promise<Metadata> {
  const dane = await wczytaj(params);
  if (!dane) return {};
  const { lokale, obszar, kategoria, dania } = dane;
  const { w } = lokaleKategorii(lokale, obszar, kategoria);
  const nazwy = w.slice(0, 3).map((l) => l.nazwa);
  const zCenami = dania.some((d) => w.some((l) => l.id === d.lokalId));
  return {
    title: `${kategoria.fraza} ${obszar.nazwa} — ${ileLokali(w.length)}, ${zCenami ? "ceny, godziny" : "godziny, telefony"}`,
    description: `${kategoria.nazwa} ${obszar.w}: ${nazwy.join(", ")}${w.length > 3 ? " i inne" : ""}. Sprawdź, co jest teraz otwarte, zadzwoń i zamów albo podjedź.`,
    alternates: { canonical: `/${obszar.slug}/${kategoria.slug}` },
  };
}

export default async function StronaKategorii({ params }: PageProps<"/[obszar]/[kategoria]">) {
  const dane = await wczytaj(params);
  if (!dane) notFound();
  const { lokale, obszar, kategoria, dania } = dane;
  const { w, okolica } = lokaleKategorii(lokale, obszar, kategoria);
  const tytul = `${kategoria.nazwa} ${obszar.w}`;
  const zDaniami = [...w, ...okolica].filter((l) => dania.some((d) => d.lokalId === l.id));
  const menu = new Map<number, Menu>();
  for (const [i, m] of (await Promise.all(zDaniami.map((l) => pobierzMenu(l.id)))).entries()) {
    if (m) menu.set(zDaniami[i].id, m);
  }
  const okruszki: Okruszek[] = [
    { nazwa: "szamanie.pl", adres: "/" },
    { nazwa: obszar.nazwa, adres: `/${obszar.slug}` },
    { nazwa: kategoria.nazwa, adres: `/${obszar.slug}/${kategoria.slug}` },
  ];
  const inneKategorie = kategorieZeStrona(lokale, obszar).filter((k) => k.slug !== kategoria.slug);
  const maDowoz = obszaryZDowozem(lokale).some((o) => o.slug === obszar.slug);
  const taSamaGdzieIndziej = obszaryZeStrona(lokale).filter(
    (o) => o.slug !== obszar.slug && kategorieZeStrona(lokale, o).some((k) => k.slug === kategoria.slug),
  );

  return (
    <>
      <DaneDlaGoogle okruszki={okruszki} lokale={w} />
      <BanerFrazy okruszki={okruszki} tytul={tytul} zdjecie={kategoria.zdjecie}>
        <p>
          {kategoria.opis} {ileLokali(w.length)} {obszar.w} — z godzinami otwarcia, telefonem i dojazdem.
        </p>
      </BanerFrazy>

      <div className="mx-auto max-w-6xl px-5">
        <Sekcja id="lokale" tytul={`${tytul}: ${ileLokali(w.length)}`}>
          <SiatkaLokali lokale={w} />
          <Kolejnosc />
        </Sekcja>

        {okolica.length > 0 && (
          <Sekcja id="okolica" tytul="W okolicy">
            <SiatkaLokali lokale={okolica} />
          </Sekcja>
        )}

        {kategoria.menu && (
          <CenyDan
            tytul={`${kategoria.menu.ileKosztuje} ${obszar.w}?`}
            w={obszar.w}
            lokale={zDaniami}
            dania={dania}
            menu={menu}
          />
        )}

        <Pytania tytul="Pytania i odpowiedzi" pytania={pytania(obszar, kategoria, w, maDowoz)} />

        <Sekcja id="wiecej" tytul={`Więcej ${obszar.w}`}>
          <Pigulki
            linki={[
              { nazwa: `Wszystkie lokale ${obszar.w}`, adres: `/${obszar.slug}` },
              ...(maDowoz ? [{ nazwa: `Dowóz ${obszar.w}`, adres: `/${obszar.slug}/dowoz` }] : []),
              ...inneKategorie.map((k) => ({ nazwa: k.nazwa, adres: `/${obszar.slug}/${k.slug}` })),
              ...taSamaGdzieIndziej.map((o) => ({
                nazwa: `${kategoria.nazwa} ${o.w}`,
                adres: `/${o.slug}/${kategoria.slug}`,
              })),
            ]}
          />
        </Sekcja>
      </div>
    </>
  );
}

function pytania(
  obszar: Obszar,
  kategoria: KategoriaSeo,
  lokale: Lokal[],
  maDowoz: boolean, // czy obszar ma stronę /<obszar>/dowoz
): Pytanie[] {
  const tytul = `${kategoria.nazwa} ${obszar.w}`;
  const wynik: Pytanie[] = [
    {
      pytanie: `${kategoria.gdzie} ${obszar.w}?`,
      odpowiedz: (
        <>
          Na szamanie.pl {jestLokali(lokale.length)}: <ListaNazw lokale={lokale} />. Przy każdym są godziny
          otwarcia, telefon i przycisk „Prowadź”, który od razu otwiera nawigację.
        </>
      ),
    },
  ];

  const { dowoz, naWynos } = zDowozem(lokale);
  if (kategoria.dowoz && (dowoz.length || naWynos.length)) {
    wynik.push({
      pytanie: `${tytul} z dowozem — kto dowozi?`,
      odpowiedz: (
        <>
          {dowoz.length > 0 && (
            <>
              Dowóz oznaczyły: <ListaNazw lokale={dowoz} />.{" "}
            </>
          )}
          {naWynos.length > 0 && (
            <>
              Na wynos: <ListaNazw lokale={naWynos} />.{" "}
            </>
          )}
          {maDowoz ? (
            <>
              Kto dowiezie do Twojej miejscowości i za ile:{" "}
              <Link
                href={`/${obszar.slug}/dowoz`}
                className="font-extrabold text-akcent-tekst underline-offset-2 hover:underline"
              >
                jedzenie z dowozem {obszar.w}
              </Link>
              .
            </>
          ) : (
            <>Strefy i ceny dostawy dopiero zbieramy — zadzwoń i zapytaj, czy lokal dowiezie pod Twój adres.</>
          )}
        </>
      ),
    });
  }

  const niedziela = otwarteWNiedziele(lokale);
  if (niedziela.length) {
    const godziny = new Map(niedziela.map(([l, g]) => [l.id, g]));
    wynik.push({
      pytanie: `${tytul} w niedzielę — co jest otwarte?`,
      odpowiedz: (
        <>
          Według podanych godzin w niedzielę otwarte są:{" "}
          <ListaNazw lokale={niedziela.map(([l]) => l)} dopisek={(l) => godziny.get(l.id)!} />. W święta godziny mogą
          być inne — przed wyjazdem warto zadzwonić.
        </>
      ),
    });
  }
  return wynik;
}
