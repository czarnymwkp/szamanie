// Lokale, które robią wesela i przyjęcia — strona /sale-weselne i sekcja „Przyjęcia” na stronie lokalu.
// Na razie ręcznie, ze stron i profili lokali (źródło przy każdym wpisie); później z panelu lokalu.
// Klucz = slug lokalu.

import type { Venue } from "./venues";

export type EventKind = "wesela" | "komunie" | "chrzciny" | "okolicznosciowe" | "firmowe" | "stypy";

export const EVENT_NAMES: Record<EventKind, string> = {
  wesela: "Wesela",
  komunie: "Komunie",
  chrzciny: "Chrzciny",
  okolicznosciowe: "Urodziny i rocznice",
  firmowe: "Imprezy firmowe",
  stypy: "Stypy",
};

export type Events = {
  rodzaje: EventKind[];
  doOsob?: number; // największa sala, tak jak podaje lokal
  noclegi?: boolean;
  // sala bez zwykłej kuchni na co dzień: nie pokazujemy jej w „Co dziś szamiesz?” ani na stronach „gdzie zjeść”
  tylkoPrzyjecia?: boolean;
  zrodlo: string;
};

export const EVENTS: Record<string, Events> = {
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
  "restauracja-piwonia-krasnik": {
    rodzaje: ["wesela", "komunie", "chrzciny", "okolicznosciowe"],
    zrodlo: "profil Piwonii na Facebooku i ich ogłoszenia na gdziewesele.pl i chrzcinyikomunie.pl, 31.10.2026",
  },
  "restauracja-dom-bar-smacznie-zdrowo-bo-domowo-wolka-olbiecka": {
    rodzaje: ["wesela", "komunie", "chrzciny", "okolicznosciowe", "stypy"],
    zrodlo: "dombarkrasnik.pl (Zajazd Kowalin), 31.10.2026",
  },
  "dom-weselny-u-bacy-kosin": {
    rodzaje: ["wesela", "komunie", "chrzciny", "okolicznosciowe"],
    tylkoPrzyjecia: true,
    zrodlo: "facebook.com/ubacydomweselny, 31.10.2026",
  },
};

export const venueEvents = (l: Pick<Venue, "slug">): Events | undefined => EVENTS[l.slug];

/** Lokale do list „gdzie zjeść” — bez sal, które działają tylko na przyjęcia. */
export const excludeHallsOnly = <T extends Pick<Venue, "slug">>(venues: T[]) =>
  venues.filter((l) => !EVENTS[l.slug]?.tylkoPrzyjecia);

/** Sale z listy lokali: najpierw wyróżnione, potem alfabetycznie (jak na stronach fraz). */
export const hallsFromList = (venues: Venue[]) =>
  venues
    .filter((l) => EVENTS[l.slug])
    .sort((a, b) => Number(b.promowany) - Number(a.promowany) || a.nazwa.localeCompare(b.nazwa, "pl"))
    .map((l) => ({ lokal: l, przyjecia: EVENTS[l.slug] }));
