// Strony pod wyszukiwania w Google typu „pizza Kraśnik”, „kebab Annopol”, „gdzie zjeść w Kraśniku”.
// Obszar = gmina (miasto Kraśnik osobno), kategoria = jedna z KATEGORIE. Strona powstaje dopiero, gdy ma
// dość lokali — prawie pusta podstrona szkodzi w Google bardziej, niż pomaga.

import { dayDescription, parseHours } from "./hours";
import type { Venue } from "./venues";
import { getDelivery, getMenu, searchDishes, type Dish } from "./menu";
import { CATEGORIES } from "./format";
import { excludeHallsOnly } from "./events";
import { stripPolish } from "./slug.mjs";
import type { PhotoKey } from "./categoryPhotos";

export type Area = {
  slug: string;
  nazwa: string; // „Kraśnik”
  w: string; // „w Kraśniku”
  gminy: string[]; // wartości lokale.gmina należące do obszaru
  okolica: string[]; // gminy dookoła, pokazywane osobno jako „w okolicy”
};

// Gminy powiatu kraśnickiego (nazwy gmin jak w scripts/import-osm.mjs).
export const AREAS: Area[] = [
  { slug: "krasnik", nazwa: "Kraśnik", w: "w Kraśniku", gminy: ["Kraśnik"], okolica: ["gm. Kraśnik"] },
  { slug: "annopol", nazwa: "Annopol", w: "w Annopolu", gminy: ["gm. Annopol"], okolica: [] },
  { slug: "dzierzkowice", nazwa: "Dzierzkowice", w: "w Dzierzkowicach", gminy: ["gm. Dzierzkowice"], okolica: [] },
  { slug: "goscieradow", nazwa: "Gościeradów", w: "w Gościeradowie", gminy: ["gm. Gościeradów"], okolica: [] },
  { slug: "szastarka", nazwa: "Szastarka", w: "w Szastarce", gminy: ["gm. Szastarka"], okolica: [] },
  { slug: "trzydnik-duzy", nazwa: "Trzydnik Duży", w: "w Trzydniku Dużym", gminy: ["gm. Trzydnik Duży"], okolica: [] },
  { slug: "urzedow", nazwa: "Urzędów", w: "w Urzędowie", gminy: ["gm. Urzędów"], okolica: [] },
  { slug: "wilkolaz", nazwa: "Wilkołaz", w: "w Wilkołazie", gminy: ["gm. Wilkołaz"], okolica: [] },
  { slug: "zakrzowek", nazwa: "Zakrzówek", w: "w Zakrzówku", gminy: ["gm. Zakrzówek"], okolica: [] },
];

export type SeoCategory = {
  id: string; // id z KATEGORIE albo własne, gdy kategoria ma swoje `pasuje`
  slug: string; // w adresie: /krasnik/<slug>
  nazwa: string; // nagłówek: „Pizza w Kraśniku”
  fraza: string; // tytuł w Google, tak jak ludzie wpisują: „Pizza Kraśnik”, „Burger Kraśnik”
  // jak liczyć lokale w tytule („9 pizzerii”) — druga fraza, którą ludzie wpisują („pizzeria Kraśnik”)
  liczba?: [string, string, string];
  gdzie: string; // pytanie: „Gdzie zjeść pizzę” + „ w Kraśniku?”
  zdjecie: PhotoKey;
  dowoz: boolean; // czy pytać o dowóz (przy kawie czy piwie nie ma to sensu)
  opis: string;
  menu?: { szukaj: string; ileKosztuje: string }; // dania z menu do sekcji z cenami: czego szukać, pytanie
  pasuje?: (l: Venue) => boolean; // kategoria tylko dla stron fraz, bez filtra na stronie głównej
};

const POLISH_CHARS = ["polish", "regional", "dumplings"];

export const SEO_CATEGORIES: SeoCategory[] = [
  {
    id: "pizza",
    slug: "pizza",
    nazwa: "Pizza",
    fraza: "Pizza",
    liczba: ["pizzeria", "pizzerie", "pizzerii"],
    gdzie: "Gdzie zjeść pizzę",
    zdjecie: "pizza",
    dowoz: true,
    opis: "Pizzerie i lokale, w których zjesz pizzę na miejscu albo zamówisz ją na wynos.",
    menu: { szukaj: "pizz", ileKosztuje: "Ile kosztuje pizza" },
  },
  {
    id: "burgery",
    slug: "burgery",
    nazwa: "Burgery",
    fraza: "Burger",
    gdzie: "Gdzie zjeść burgera",
    zdjecie: "burger",
    dowoz: true,
    opis: "Burgerownie i lokale z burgerami w menu — na szybki obiad, na wynos albo z dostawą.",
    menu: { szukaj: "burger", ileKosztuje: "Ile kosztuje burger" },
  },
  {
    id: "kebab",
    slug: "kebab",
    nazwa: "Kebab",
    fraza: "Kebab",
    liczba: ["kebab", "kebaby", "kebabów"],
    gdzie: "Gdzie zjeść kebaba",
    zdjecie: "kebab",
    dowoz: true,
    opis: "Kebaby w bułce, w tortilli i na talerzu — lokale, w których zjesz na miejscu lub weźmiesz na wynos.",
    menu: { szukaj: "kebab", ileKosztuje: "Ile kosztuje kebab" },
  },
  {
    id: "restauracje",
    slug: "restauracje",
    nazwa: "Restauracje",
    fraza: "Restauracje",
    liczba: ["restauracja", "restauracje", "restauracji"],
    gdzie: "Gdzie iść do restauracji",
    zdjecie: "restauracja",
    dowoz: true,
    opis: "Restauracje na obiad, rodzinne wyjście albo spotkanie ze znajomymi.",
  },
  {
    id: "obiady",
    slug: "obiady",
    nazwa: "Obiady domowe",
    fraza: "Obiady domowe",
    gdzie: "Gdzie zjeść obiad",
    zdjecie: "polska",
    dowoz: true,
    opis: "Domowe obiady, zupy, pierogi i kuchnia polska — na miejscu, na wynos albo z dowozem.",
    pasuje: (l) => l.kuchnie.some((k) => POLISH_CHARS.includes(k)),
  },
  {
    id: "pierogi",
    slug: "pierogi",
    nazwa: "Pierogi",
    fraza: "Pierogi",
    gdzie: "Gdzie zjeść pierogi",
    zdjecie: "polska",
    dowoz: true,
    opis: "Pierogarnie i lokale z pierogami: ruskie, z mięsem, z kapustą i na słodko.",
    menu: { szukaj: "pierog", ileKosztuje: "Ile kosztują pierogi" },
    pasuje: (l) => l.kuchnie.includes("dumplings"),
  },
  {
    id: "fastfood",
    slug: "fast-food",
    nazwa: "Fast food",
    fraza: "Fast food",
    gdzie: "Gdzie zjeść coś szybkiego",
    zdjecie: "fastfood",
    dowoz: true,
    opis: "Lokale z szybkim jedzeniem: zapiekanki, frytki, kebaby, burgery i inne przekąski.",
  },
  {
    id: "zapiekanki",
    slug: "zapiekanki",
    nazwa: "Zapiekanki",
    fraza: "Zapiekanki",
    gdzie: "Gdzie zjeść zapiekankę",
    zdjecie: "fastfood",
    dowoz: false,
    opis: "Zapiekanki i budki z szybkim jedzeniem — na przekąskę, na wynos albo w drodze.",
    menu: { szukaj: "zapiek", ileKosztuje: "Ile kosztuje zapiekanka" },
    pasuje: (l) => l.kuchnie.includes("zapiekanka"),
  },
  {
    id: "kawiarnie",
    slug: "kawiarnie",
    nazwa: "Kawiarnie",
    fraza: "Kawiarnie",
    liczba: ["kawiarnia", "kawiarnie", "kawiarni"],
    gdzie: "Gdzie na kawę",
    zdjecie: "kawa",
    dowoz: false,
    opis: "Kawiarnie na kawę, ciasto i spotkanie — z godzinami otwarcia i dojazdem.",
  },
  {
    id: "lody",
    slug: "lody",
    nazwa: "Lody",
    fraza: "Lody",
    liczba: ["lodziarnia", "lodziarnie", "lodziarni"],
    gdzie: "Gdzie na lody",
    zdjecie: "lody",
    dowoz: false,
    opis: "Lodziarnie i lokale z lodami — sprawdź, które są dziś otwarte.",
    menu: { szukaj: "lody", ileKosztuje: "Ile kosztują lody" },
  },
  {
    id: "azjatycka",
    slug: "kuchnia-azjatycka",
    nazwa: "Kuchnia azjatycka",
    fraza: "Sushi i kuchnia azjatycka", // ludzie szukają „sushi Kraśnik”
    gdzie: "Gdzie zjeść po azjatycku",
    zdjecie: "azjatycka",
    dowoz: true,
    opis: "Kuchnia chińska, wietnamska, tajska i sushi.",
  },
  {
    id: "puby",
    slug: "puby-i-bary",
    nazwa: "Puby i bary",
    fraza: "Puby i bary",
    gdzie: "Gdzie na piwo",
    zdjecie: "piwo",
    dowoz: false,
    opis: "Puby i bary na piwo, mecz albo wieczór ze znajomymi.",
  },
  // Strony pod pytania o porę: „co otwarte w niedzielę Kraśnik”, „jedzenie w nocy Kraśnik” — z godzin lokali.
  {
    id: "niedziela",
    slug: "otwarte-w-niedziele",
    nazwa: "Otwarte w niedzielę",
    fraza: "Otwarte w niedzielę",
    gdzie: "Gdzie zjeść w niedzielę",
    zdjecie: "polska",
    dowoz: true,
    opis: "Lokale, które według podanych godzin są otwarte w niedzielę — na rodzinny obiad, pizzę albo kawę.",
    pasuje: (l) => (parseHours(l.godziny)?.[6].length ?? 0) > 0,
  },
  {
    id: "dopozna",
    slug: "do-pozna",
    nazwa: "Otwarte do późna",
    fraza: "Jedzenie do późna",
    gdzie: "Gdzie zjeść późnym wieczorem",
    zdjecie: "fastfood",
    dowoz: true,
    opis: "Lokale otwarte po 22:00 przynajmniej w niektóre dni — kiedy głód przychodzi wieczorem albo w nocy.",
    pasuje: (l) => parseHours(l.godziny)?.some((day) => day.some(([, koniec]) => koniec > 22 * 60)) ?? false,
  },
];

const EXTRAS = /dodat|\bsos|\bdip/;

/** Dania z menu z danej kategorii — do sekcji „Ile kosztuje pizza”. „Sos do pizzy” czy „Dodatek serowy” to nie pizza. */
export async function categoryDishes(k: SeoCategory): Promise<Dish[]> {
  if (!k.menu) return [];
  const dishes = await searchDishes(k.menu.szukaj);
  return dishes.filter((d) => !EXTRAS.test(stripPolish(`${d.sekcja} ${d.nazwa}`)));
}

/**
 * Czy strona lokalu idzie do Google. Bez telefonu, godzin, strony www, Facebooka i menu zostaje sama nazwa
 * i punkt na mapie — takie strony obniżają ocenę całej domeny, więc mają noindex i nie ma ich w sitemap.
 * Odblokowują się same, gdy dane dojdą (npm run popraw, menu).
 */
export async function toIndex(l: Venue) {
  return Boolean(l.telefon || l.godziny || l.www || l.facebook || (await getMenu(l.id)));
}

/**
 * Tytuł strony w Google. Dłuższy niż ok. 50 znaków idzie bez „ | szamanie.pl”, żeby Google nie uciął końcówki
 * (ceny, dowóz), która przyciąga kliknięcie.
 */
export const pageTitle = (title: string) => (title.length > 50 ? { absolute: title } : title);

/** Strona obszaru wymaga tylu lokali w obszarze, strona kategorii — tylu lokali z kategorii. */
const MIN_IN_AREA = 3;
const MIN_IN_CATEGORY = 2;

const matches = (k: SeoCategory) => k.pasuje ?? CATEGORIES.find((cat) => cat.id === k.id)!.pasuje;

export function areaVenues(all: Venue[], o: Area) {
  // sale tylko na przyjęcia mają swoją stronę /sale-weselne, a nie „gdzie zjeść”
  const venues = excludeHallsOnly(all);
  return {
    w: venues.filter((l) => l.gmina && o.gminy.includes(l.gmina)),
    okolica: venues.filter((l) => l.gmina && o.okolica.includes(l.gmina)),
  };
}

export function categoryVenues(venues: Venue[], o: Area, k: SeoCategory) {
  const { w, okolica } = areaVenues(venues, o);
  return { w: w.filter(matches(k)), okolica: okolica.filter(matches(k)) };
}

/** Obszary, które mają swoją stronę. */
export function areasWithPage(venues: Venue[]) {
  return AREAS.filter((o) => areaVenues(venues, o).w.length >= MIN_IN_AREA);
}

/**
 * Kategorie, które mają stronę w danym obszarze (obszar musi mieć stronę). Bez kategorii z wszystkimi lokalami
 * obszaru — „Restauracje Annopol” z tymi samymi 3 lokalami co „Gdzie zjeść w Annopolu” to ta sama strona dwa razy.
 */
export function categoriesWithPage(venues: Venue[], o: Area) {
  const inArea = areaVenues(venues, o).w.length;
  if (inArea < MIN_IN_AREA) return [];
  return SEO_CATEGORIES.filter((k) => {
    const n = categoryVenues(venues, o, k).w.length;
    return n >= MIN_IN_CATEGORY && n < inArea;
  });
}

export function findPage(venues: Venue[], areaSlug: string, categorySlug?: string) {
  const area = areasWithPage(venues).find((o) => o.slug === areaSlug);
  if (!area) return null;
  if (categorySlug === undefined) return { obszar: area, kategoria: null };
  const category = categoriesWithPage(venues, area).find((k) => k.slug === categorySlug);
  return category ? { obszar: area, kategoria: category } : null;
}

/** Wszystkie strony fraz: [obszar] i [obszar, kategoria] — do mapy strony i linków. */
export function allPages(venues: Venue[]) {
  return areasWithPage(venues).flatMap((o) => [
    { obszar: o, kategoria: null },
    ...categoriesWithPage(venues, o).map((k) => ({ obszar: o, kategoria: k })),
  ]);
}

/** Lokale otwarte w niedzielę według podanych godzin, z godzinami: [lokal, „12:00–21:00”]. */
export function openOnSunday(venues: Venue[]) {
  return venues.flatMap((l) => {
    const day = parseHours(l.godziny)?.[6]; // tydzień od poniedziałku
    return day?.length ? [[l, dayDescription(day)] as const] : [];
  });
}

/** Lokale, które oznaczyły dowóz albo jedzenie na wynos. */
export function withDelivery(venues: Venue[]) {
  return { dowoz: venues.filter((l) => l.dostawa), naWynos: venues.filter((l) => l.naWynos && !l.dostawa) };
}

/** Strona „Jedzenie z dowozem w Kraśniku” (/krasnik/dowoz) wymaga tylu lokali z dowozem w obszarze. */
const MIN_WITH_DELIVERY = 2;

export function venuesWithDelivery(venues: Venue[], o: Area) {
  const { w, okolica } = areaVenues(venues, o);
  return { w: w.filter((l) => l.dostawa), okolica: okolica.filter((l) => l.dostawa) };
}

/** Obszary, które mają stronę z dowozem (obszar musi mieć swoją stronę). */
export function areasWithDelivery(venues: Venue[]) {
  return areasWithPage(venues).filter((o) => venuesWithDelivery(venues, o).w.length >= MIN_WITH_DELIVERY);
}

/** Strefy dostawy lokali, które je podały — w kolejności lokali. */
export async function deliveryPricing(venues: Venue[]) {
  const deliveries = await Promise.all(venues.map((l) => getDelivery(l.id)));
  return venues.flatMap((venue, i) => {
    const delivery = deliveries[i];
    return delivery ? [{ lokal: venue, dostawa: delivery }] : [];
  });
}
