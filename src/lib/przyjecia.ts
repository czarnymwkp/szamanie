// Lokale, które robią wesela i przyjęcia — strona /sale-weselne i sekcja „Przyjęcia” na stronie lokalu.
// Na razie ręcznie, ze stron i profili lokali (źródło przy każdym wpisie); później z panelu lokalu.
// Klucz = slug lokalu.

import type { Lokal } from "./lokale";

export type RodzajPrzyjecia = "wesela" | "komunie" | "chrzciny" | "okolicznosciowe" | "firmowe";

export const NAZWY_PRZYJEC: Record<RodzajPrzyjecia, string> = {
  wesela: "Wesela",
  komunie: "Komunie",
  chrzciny: "Chrzciny",
  okolicznosciowe: "Urodziny i rocznice",
  firmowe: "Imprezy firmowe",
};

export type Przyjecia = {
  rodzaje: RodzajPrzyjecia[];
  doOsob?: number; // największa sala, tak jak podaje lokal
  noclegi?: boolean;
  // sala bez zwykłej kuchni na co dzień: nie pokazujemy jej w „Co dziś szamiesz?” ani na stronach „gdzie zjeść”
  tylkoPrzyjecia?: boolean;
  zrodlo: string;
};

export const PRZYJECIA: Record<string, Przyjecia> = {
  "zielony-dworek-krasnik": {
    rodzaje: ["wesela", "komunie", "chrzciny", "okolicznosciowe", "firmowe"],
    doOsob: 220,
    noclegi: true,
    zrodlo: "zielony-dworek.pl (oferta/wesela.html), 31.10.2026",
  },
  "restauracja-diamentowa-wilkolaz-pierwszy": {
    rodzaje: ["wesela", "komunie", "chrzciny", "okolicznosciowe", "firmowe"],
    doOsob: 300,
    noclegi: true,
    zrodlo: "facebook.com/diamentowa.wilkolaz i diamentowa.pl, 31.10.2026",
  },
  "dom-weselny-gamma-krasnik": {
    rodzaje: ["wesela", "komunie", "chrzciny", "okolicznosciowe"],
    doOsob: 200,
    tylkoPrzyjecia: true,
    zrodlo: "profil Gammy na Facebooku, 31.10.2026; 200 osób z ich ogłoszenia na chrzcinyikomunie.pl (2022)",
  },
  "dom-weselny-u-bacy-kosin": {
    rodzaje: ["wesela", "komunie", "chrzciny", "okolicznosciowe"],
    tylkoPrzyjecia: true,
    zrodlo: "facebook.com/ubacydomweselny, 31.10.2026",
  },
};

export const przyjeciaLokalu = (l: Pick<Lokal, "slug">): Przyjecia | undefined => PRZYJECIA[l.slug];

/** Lokale do list „gdzie zjeść” — bez sal, które działają tylko na przyjęcia. */
export const bezSamychSal = <T extends Pick<Lokal, "slug">>(lokale: T[]) =>
  lokale.filter((l) => !PRZYJECIA[l.slug]?.tylkoPrzyjecia);

/** Sale z listy lokali: najpierw wyróżnione, potem alfabetycznie (jak na stronach fraz). */
export const saleZListy = (lokale: Lokal[]) =>
  lokale
    .filter((l) => PRZYJECIA[l.slug])
    .sort((a, b) => Number(b.promowany) - Number(a.promowany) || a.nazwa.localeCompare(b.nazwa, "pl"))
    .map((l) => ({ lokal: l, przyjecia: PRZYJECIA[l.slug] }));
