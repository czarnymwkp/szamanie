// Venues that host weddings and events — the /sale-weselne page and the „Przyjęcia” section on the venue page. Entered
// by hand for now, from the venues' websites and profiles (source next to every entry); later from the venue panel. Key
// = venue slug.

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
  doOsob?: number; // the largest hall, as the venue states it
  noclegi?: boolean;
  // a hall without a regular everyday kitchen: not shown in „Co dziś szamiesz?” or on the „gdzie zjeść” pages
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

/** Venues for the „gdzie zjeść” lists — without halls that only work for events. */
export const excludeHallsOnly = <T extends Pick<Venue, "slug">>(venues: T[]) =>
  venues.filter((l) => !EVENTS[l.slug]?.tylkoPrzyjecia);

/** Halls from the venue list: promoted first, then alphabetically (as on the phrase pages). */
export const hallsFromList = (venues: Venue[]) =>
  venues
    .filter((l) => EVENTS[l.slug])
    .sort((a, b) => Number(b.promowany) - Number(a.promowany) || a.nazwa.localeCompare(b.nazwa, "pl"))
    .map((l) => ({ lokal: l, przyjecia: EVENTS[l.slug] }));
