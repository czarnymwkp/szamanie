// Strony pod wyszukiwania w Google typu „pizza Kraśnik”, „kebab Annopol”, „gdzie zjeść w Kraśniku”.
// Obszar = gmina (miasto Kraśnik osobno), kategoria = jedna z KATEGORIE. Strona powstaje dopiero, gdy ma
// dość lokali — prawie pusta podstrona szkodzi w Google bardziej, niż pomaga.

import { opisDnia, parsujGodziny } from "./godziny";
import type { Lokal } from "./lokale";
import { pobierzDostawe, pobierzMenu, szukajDan, type Danie } from "./menu";
import { KATEGORIE } from "./nazwy";
import { bezPolskich } from "./slug.mjs";
import type { KluczZdjecia } from "./zdjeciaKategorii";

export type Obszar = {
  slug: string;
  nazwa: string; // „Kraśnik”
  w: string; // „w Kraśniku”
  gminy: string[]; // wartości lokale.gmina należące do obszaru
  okolica: string[]; // gminy dookoła, pokazywane osobno jako „w okolicy”
};

// Gminy powiatu kraśnickiego (nazwy gmin jak w scripts/import-osm.mjs).
export const OBSZARY: Obszar[] = [
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

export type KategoriaSeo = {
  id: string; // id z KATEGORIE albo własne, gdy kategoria ma swoje `pasuje`
  slug: string; // w adresie: /krasnik/<slug>
  nazwa: string; // nagłówek: „Pizza w Kraśniku”
  fraza: string; // tytuł w Google, tak jak ludzie wpisują: „Pizza Kraśnik”, „Burger Kraśnik”
  gdzie: string; // pytanie: „Gdzie zjeść pizzę” + „ w Kraśniku?”
  zdjecie: KluczZdjecia;
  dowoz: boolean; // czy pytać o dowóz (przy kawie czy piwie nie ma to sensu)
  opis: string;
  menu?: { szukaj: string; ileKosztuje: string }; // dania z menu do sekcji z cenami: czego szukać, pytanie
  pasuje?: (l: Lokal) => boolean; // kategoria tylko dla stron fraz, bez filtra na stronie głównej
};

const POLSKIE = ["polish", "regional", "dumplings"];

export const KATEGORIE_SEO: KategoriaSeo[] = [
  {
    id: "pizza",
    slug: "pizza",
    nazwa: "Pizza",
    fraza: "Pizza",
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
    gdzie: "Gdzie iść do restauracji",
    zdjecie: "restauracja",
    dowoz: true,
    opis: "Restauracje na obiad, rodzinne wyjście albo spotkanie ze znajomymi.",
  },
  {
    id: "obiady",
    slug: "obiady",
    nazwa: "Obiady domowe",
    fraza: "Obiady",
    gdzie: "Gdzie zjeść obiad",
    zdjecie: "polska",
    dowoz: true,
    opis: "Domowe obiady, zupy, pierogi i kuchnia polska — na miejscu, na wynos albo z dowozem.",
    pasuje: (l) => l.kuchnie.some((k) => POLSKIE.includes(k)),
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
    fraza: "Kuchnia azjatycka",
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
];

const DODATKI = /dodat|\bsos|\bdip/;

/** Dania z menu z danej kategorii — do sekcji „Ile kosztuje pizza”. „Sos do pizzy” czy „Dodatek serowy” to nie pizza. */
export async function daniaKategorii(k: KategoriaSeo): Promise<Danie[]> {
  if (!k.menu) return [];
  const dania = await szukajDan(k.menu.szukaj);
  return dania.filter((d) => !DODATKI.test(bezPolskich(`${d.sekcja} ${d.nazwa}`)));
}

/**
 * Czy strona lokalu idzie do Google. Bez telefonu, godzin, strony www, Facebooka i menu zostaje sama nazwa
 * i punkt na mapie — takie strony obniżają ocenę całej domeny, więc mają noindex i nie ma ich w sitemap.
 * Odblokowują się same, gdy dane dojdą (npm run popraw, menu).
 */
export async function doIndeksu(l: Lokal) {
  return Boolean(l.telefon || l.godziny || l.www || l.facebook || (await pobierzMenu(l.id)));
}

/** Strona obszaru wymaga tylu lokali w obszarze, strona kategorii — tylu lokali z kategorii. */
const MIN_W_OBSZARZE = 3;
const MIN_W_KATEGORII = 2;

const pasuje = (k: KategoriaSeo) => k.pasuje ?? KATEGORIE.find((kat) => kat.id === k.id)!.pasuje;

export function lokaleObszaru(lokale: Lokal[], o: Obszar) {
  return {
    w: lokale.filter((l) => l.gmina && o.gminy.includes(l.gmina)),
    okolica: lokale.filter((l) => l.gmina && o.okolica.includes(l.gmina)),
  };
}

export function lokaleKategorii(lokale: Lokal[], o: Obszar, k: KategoriaSeo) {
  const { w, okolica } = lokaleObszaru(lokale, o);
  return { w: w.filter(pasuje(k)), okolica: okolica.filter(pasuje(k)) };
}

/** Obszary, które mają swoją stronę. */
export function obszaryZeStrona(lokale: Lokal[]) {
  return OBSZARY.filter((o) => lokaleObszaru(lokale, o).w.length >= MIN_W_OBSZARZE);
}

/**
 * Kategorie, które mają stronę w danym obszarze (obszar musi mieć stronę). Bez kategorii z wszystkimi lokalami
 * obszaru — „Restauracje Annopol” z tymi samymi 3 lokalami co „Gdzie zjeść w Annopolu” to ta sama strona dwa razy.
 */
export function kategorieZeStrona(lokale: Lokal[], o: Obszar) {
  const wObszarze = lokaleObszaru(lokale, o).w.length;
  if (wObszarze < MIN_W_OBSZARZE) return [];
  return KATEGORIE_SEO.filter((k) => {
    const n = lokaleKategorii(lokale, o, k).w.length;
    return n >= MIN_W_KATEGORII && n < wObszarze;
  });
}

export function znajdzStrone(lokale: Lokal[], obszarSlug: string, kategoriaSlug?: string) {
  const obszar = obszaryZeStrona(lokale).find((o) => o.slug === obszarSlug);
  if (!obszar) return null;
  if (kategoriaSlug === undefined) return { obszar, kategoria: null };
  const kategoria = kategorieZeStrona(lokale, obszar).find((k) => k.slug === kategoriaSlug);
  return kategoria ? { obszar, kategoria } : null;
}

/** Wszystkie strony fraz: [obszar] i [obszar, kategoria] — do mapy strony i linków. */
export function wszystkieStrony(lokale: Lokal[]) {
  return obszaryZeStrona(lokale).flatMap((o) => [
    { obszar: o, kategoria: null },
    ...kategorieZeStrona(lokale, o).map((k) => ({ obszar: o, kategoria: k })),
  ]);
}

/** Lokale otwarte w niedzielę według podanych godzin, z godzinami: [lokal, „12:00–21:00”]. */
export function otwarteWNiedziele(lokale: Lokal[]) {
  return lokale.flatMap((l) => {
    const dzien = parsujGodziny(l.godziny)?.[6]; // tydzień od poniedziałku
    return dzien?.length ? [[l, opisDnia(dzien)] as const] : [];
  });
}

/** Lokale, które oznaczyły dowóz albo jedzenie na wynos. */
export function zDowozem(lokale: Lokal[]) {
  return { dowoz: lokale.filter((l) => l.dostawa), naWynos: lokale.filter((l) => l.naWynos && !l.dostawa) };
}

/** Strona „Jedzenie z dowozem w Kraśniku” (/krasnik/dowoz) wymaga tylu lokali z dowozem w obszarze. */
const MIN_Z_DOWOZEM = 2;

export function lokaleZDowozem(lokale: Lokal[], o: Obszar) {
  const { w, okolica } = lokaleObszaru(lokale, o);
  return { w: w.filter((l) => l.dostawa), okolica: okolica.filter((l) => l.dostawa) };
}

/** Obszary, które mają stronę z dowozem (obszar musi mieć swoją stronę). */
export function obszaryZDowozem(lokale: Lokal[]) {
  return obszaryZeStrona(lokale).filter((o) => lokaleZDowozem(lokale, o).w.length >= MIN_Z_DOWOZEM);
}

/** Strefy dostawy lokali, które je podały — w kolejności lokali. */
export async function cennikiDostawy(lokale: Lokal[]) {
  const dostawy = await Promise.all(lokale.map((l) => pobierzDostawe(l.id)));
  return lokale.flatMap((lokal, i) => {
    const dostawa = dostawy[i];
    return dostawa ? [{ lokal, dostawa }] : [];
  });
}
