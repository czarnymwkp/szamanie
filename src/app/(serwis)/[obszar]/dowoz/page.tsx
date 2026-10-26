import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BanerFrazy,
  CennikiDostawy,
  DaneDlaGoogle,
  Kolejnosc,
  ListaNazw,
  Pigulki,
  Pytania,
  Sekcja,
  SiatkaLokali,
  cenaDostawy,
  ileLokali,
  type Okruszek,
  type Pytanie,
} from "@/components/StronaFrazy";
import { zl } from "@/lib/ceny";
import { pobierzLokale, type Lokal } from "@/lib/lokale";
import type { Dostawa } from "@/lib/menu";
import {
  cennikiDostawy,
  kategorieZeStrona,
  lokaleKategorii,
  lokaleObszaru,
  lokaleZDowozem,
  obszaryZDowozem,
  zDowozem,
  type Obszar,
} from "@/lib/seo";

// Strona „Jedzenie z dowozem w Kraśniku” — pod wyszukiwania „dowóz Kraśnik”, „pizza z dowozem Kraśnik”:
// kto dowozi, ile kosztuje dostawa do której miejscowości i od jakiej kwoty.

// Cała strona statyczna: nieznany adres czeka na wynik zamiast szkieletu z kodem 200, więc dostaje prawdziwe 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const obszary = obszaryZDowozem(await pobierzLokale());
  // Cache Components wymaga co najmniej jednego parametru; „brak” → 404.
  return obszary.length ? obszary.map((o) => ({ obszar: o.slug })) : [{ obszar: "brak" }];
}

async function wczytaj(params: PageProps<"/[obszar]/dowoz">["params"]) {
  const { obszar: slug } = await params;
  const lokale = await pobierzLokale();
  const obszar = obszaryZDowozem(lokale).find((o) => o.slug === slug);
  if (!obszar) return null;
  const { w, okolica } = lokaleZDowozem(lokale, obszar);
  return { lokale, obszar, w, okolica, cenniki: await cennikiDostawy([...w, ...okolica]) };
}

export async function generateMetadata({ params }: PageProps<"/[obszar]/dowoz">): Promise<Metadata> {
  const dane = await wczytaj(params);
  if (!dane) return {};
  const { obszar, w } = dane;
  const nazwy = w.slice(0, 3).map((l) => l.nazwa);
  return {
    title: `Jedzenie z dowozem ${obszar.nazwa} — kto dowozi i za ile`,
    description: `Dowóz jedzenia ${obszar.w}: ${nazwy.join(", ")}${w.length > 3 ? " i inne" : ""}. Ceny dostawy, minimalne zamówienie i telefon — zamów pizzę albo obiad do domu.`,
    alternates: { canonical: `/${obszar.slug}/dowoz` },
  };
}

export default async function StronaDowozu({ params }: PageProps<"/[obszar]/dowoz">) {
  const dane = await wczytaj(params);
  if (!dane) notFound();
  const { lokale, obszar, w, okolica, cenniki } = dane;
  const bezCennika = w.filter((l) => !cenniki.some((c) => c.lokal.id === l.id));
  const okruszki: Okruszek[] = [
    { nazwa: "szamanie.pl", adres: "/" },
    { nazwa: obszar.nazwa, adres: `/${obszar.slug}` },
    { nazwa: "Dowóz", adres: `/${obszar.slug}/dowoz` },
  ];
  const kategorie = kategorieZeStrona(lokale, obszar).filter((k) => k.dowoz);
  const inneObszary = obszaryZDowozem(lokale).filter((o) => o.slug !== obszar.slug);

  return (
    <>
      <DaneDlaGoogle okruszki={okruszki} lokale={w} />
      <BanerFrazy okruszki={okruszki} tytul={`Jedzenie z dowozem ${obszar.w}`} zdjecie="pizza">
        <p>
          {ileLokali(w.length)} z dowozem {obszar.w}
          {okolica.length > 0 && <> i {okolica.length} w okolicy</>}. Sprawdź, kto dowiezie pod Twój adres, ile kosztuje
          dostawa i od jakiej kwoty.
        </p>
      </BanerFrazy>

      <div className="mx-auto max-w-6xl px-5">
        <Sekcja id="lokale" tytul={`Kto dowozi ${obszar.w}: ${ileLokali(w.length)}`}>
          <SiatkaLokali lokale={w} />
          <Kolejnosc />
        </Sekcja>

        {okolica.length > 0 && (
          <Sekcja id="okolica" tytul="Z dowozem w okolicy">
            <SiatkaLokali lokale={okolica} />
          </Sekcja>
        )}

        {cenniki.length > 0 && (
          <Sekcja id="cennik" tytul={`Ile kosztuje dowóz ${obszar.w}?`}>
            <p className="mb-4 max-w-3xl leading-relaxed font-semibold text-tekst-2">
              Ceny dostawy do poszczególnych miejscowości i części miasta, tak jak podają lokale. Im dalej, tym zwykle
              drożej i z wyższym minimalnym zamówieniem.
              {bezCennika.length > 0 && (
                <>
                  {" "}
                  Cennika jeszcze nie mamy od: <ListaNazw lokale={bezCennika} /> — zapytaj przy zamówieniu.
                </>
              )}
            </p>
            <CennikiDostawy cenniki={cenniki} />
          </Sekcja>
        )}

        <Pytania tytul="Pytania i odpowiedzi" pytania={pytania(lokale, obszar, w, okolica, cenniki)} />

        <Sekcja id="wiecej" tytul={`Więcej ${obszar.w}`}>
          <Pigulki
            linki={[
              { nazwa: `Wszystkie lokale ${obszar.w}`, adres: `/${obszar.slug}` },
              ...kategorie.map((k) => ({ nazwa: k.nazwa, adres: `/${obszar.slug}/${k.slug}` })),
              ...inneObszary.map((o) => ({ nazwa: `Dowóz ${o.w}`, adres: `/${o.slug}/dowoz` })),
            ]}
          />
        </Sekcja>
      </div>
    </>
  );
}

function pytania(
  lokale: Lokal[],
  obszar: Obszar,
  w: Lokal[],
  okolica: Lokal[],
  cenniki: { lokal: Lokal; dostawa: Dostawa }[],
): Pytanie[] {
  const wynik: Pytanie[] = [
    {
      pytanie: `Kto dowozi jedzenie ${obszar.w}?`,
      odpowiedz: (
        <>
          Dowóz oznaczyły: <ListaNazw lokale={w} />
          {okolica.length > 0 && (
            <>
              , a w okolicy: <ListaNazw lokale={okolica} />
            </>
          )}
          . Przy każdym lokalu jest telefon i godziny otwarcia — od razu widać, kto teraz przyjmuje zamówienia.
        </>
      ),
    },
  ];

  // Strefy obejmujące sam obszar, np. „Kraśnik Fabryczny” i „Kraśnik Stary” → miejsca ["Kraśnik"].
  const wObszarze = cenniki.flatMap(({ lokal, dostawa }) => {
    const strefy = dostawa.strefy.filter((s) => s.miejsca.includes(obszar.nazwa));
    return strefy.length ? [{ lokal, strefy }] : [];
  });
  if (wObszarze.length) {
    wynik.push({
      pytanie: `Ile kosztuje dowóz ${obszar.w}?`,
      odpowiedz: (
        <>
          {wObszarze.map(({ lokal, strefy }, i) => (
            <span key={lokal.id}>
              {i > 0 && " "}
              <ListaNazw lokale={[lokal]} />:{" "}
              {strefy
                .map((s) =>
                  s.cenaGr === null
                    ? `${s.nazwa} — cenę podaje przy zamówieniu`
                    : `${s.nazwa} — ${cenaDostawy(s)}${s.minGr ? ` (zamówienie od ${zl(s.minGr)})` : ""}`,
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
  for (const k of kategorieZeStrona(lokale, obszar).filter((k) => k.dowoz)) {
    const zKategorii = lokaleKategorii(lokale, obszar, k).w.filter((l) => l.dostawa);
    if (!zKategorii.length) continue;
    wynik.push({
      pytanie: `${k.nazwa} z dowozem ${obszar.w} — gdzie zamówić?`,
      odpowiedz: (
        <>
          Z dowozem: <ListaNazw lokale={zKategorii} />. Wszystkie lokale z tej kategorii, także na miejscu i na wynos:{" "}
          <Link
            href={`/${obszar.slug}/${k.slug}`}
            className="font-extrabold text-akcent-tekst underline-offset-2 hover:underline"
          >
            {k.nazwa} {obszar.w}
          </Link>
          .
        </>
      ),
    });
  }

  // bez lodziarni — lody na wynos to oczywistość, a sieciówka z trzema punktami trzy razy powtarza tę samą nazwę
  const naWynos = zDowozem(lokaleObszaru(lokale, obszar).w).naWynos.filter((l) => l.typ !== "ice_cream");
  if (naWynos.length) {
    wynik.push({
      pytanie: `Gdzie wziąć jedzenie na wynos ${obszar.w}?`,
      odpowiedz: (
        <>
          Na wynos (bez dowozu): <ListaNazw lokale={naWynos} />. Zadzwoń wcześniej, a jedzenie będzie gotowe, kiedy
          podjedziesz.
        </>
      ),
    });
  }

  wynik.push({
    pytanie: "Jak zamówić jedzenie z dowozem przez szamanie.pl?",
    odpowiedz: (
      <>
        Na stronie lokalu dodaj dania z menu do listy — zobaczysz sumę razem z dostawą do Twojej miejscowości
        i minimalne zamówienie. Potem „Zadzwoń i zamów”: lista zostaje na ekranie, więc czytasz zamówienie prosto
        z telefonu. Bez konta i bez prowizji — płacisz lokalowi jak zwykle.
      </>
    ),
  });
  return wynik;
}
