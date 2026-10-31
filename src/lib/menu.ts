import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { stripPolish } from "./slug.mjs";
import { dishPhoto } from "./dishPhotos";
import { CATEGORY_PHOTOS, type PhotoKey } from "./categoryPhotos";

export type Price = { wariant: string | null; gr: number };
export type DishFeature = "wege" | "ostre" | "polecane" | "sezonowe";

export type MenuItem = {
  id: number;
  nazwa: string;
  opis: string | null;
  ceny: Price[];
  cechy: DishFeature[];
};

/** Zdjęcie na kafelku sekcji; `pozycja` to object-position kadru. */
export type Cover = { plik: string; pozycja: string };

export type MenuSectionData = {
  nazwa: string;
  opis: string | null;
  okladka: Cover | null; // zdjęcie poglądowe na kafelku sekcji (w samym menu dań bez zdjęć)
  pozycje: MenuItem[];
};

export type Menu = {
  sekcje: MenuSectionData[];
  liczba: number;
  zrodlo: string | null;
  sprawdzono: string | null;
  bezCen: boolean; // lokal podaje same dania (np. Zielony Dworek)
  stareCeny: boolean; // ceny sprzed ponad roku (np. zdjęcie tablicy z 2023)
};

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export type Zone = { nazwa: string; miejsca: string[]; cenaGr: number | null; minGr: number | null };
export type Delivery = { strefy: Zone[]; zrodlo: string | null; sprawdzono: string | null; uwagi: string | null };

// Okładki sekcji: najpierw zdjęcie kategorii (pierwsza pasująca reguła), potem zdjęcie poglądowe pierwszego dania
// sekcji, które je ma (np. „Napoje zimne” → cola). To samo zdjęcie nie powtarza się w jednym menu.
const COVERS: [RegExp, PhotoKey][] = [
  [/pizz|calzone/, "pizza"],
  [/burger/, "burger"],
  [/kebab|grill/, "kebab"],
  [/sushi|azjat|chinsk|wok/, "azjatycka"],
  [/frytk|kanapk|tost|wrap|zapiek|hot.?dog/, "fastfood"],
  [/makaron|past[ay]/, "wloska"],
  [/salat|insalat/, "grecka"],
  [/zup|maczne|pierog/, "polska"],
  [/dania glowne|obiad/, "restauracja"],
  [/kaw|herbat|napoje gorace/, "kawa"],
  [/lody/, "lody"],
  [/piw/, "piwo"],
  [/drink|alkohol|win[ao]|koktajl/, "bar"],
];

function cover(section: string, dishes: { nazwa: string; opis: string | null }[], used: Set<string>): Cover | null {
  const text = stripPolish(section);
  const hit = COVERS.find(([wzor]) => wzor.test(text));
  const categoryOf = hit && CATEGORY_PHOTOS[hit[1]];
  if (categoryOf && !used.has(categoryOf.plik)) {
    used.add(categoryOf.plik);
    return { plik: categoryOf.plik, pozycja: categoryOf.pozycja };
  }
  for (const d of dishes) {
    const file = dishPhoto(section, d.nazwa, d.opis);
    if (file && !used.has(file)) {
      used.add(file);
      return { plik: file, pozycja: "center" };
    }
  }
  return null;
}

/** Menu lokalu z podziałem na sekcje; null, gdy lokal nie ma jeszcze menu w bazie. */
export async function getMenu(venueId: number): Promise<Menu | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("menu");

  const items = db
    .prepare("SELECT id, sekcja, nazwa, opis, ceny, cechy FROM menu WHERE lokal_id = ? ORDER BY kolejnosc")
    .all(venueId) as { id: number; sekcja: string; nazwa: string; opis: string | null; ceny: string; cechy: string }[];
  if (!items.length) return null;

  const sections = (
    db.prepare("SELECT nazwa, opis FROM menu_sekcje WHERE lokal_id = ? ORDER BY kolejnosc").all(venueId) as {
      nazwa: string;
      opis: string | null;
    }[]
  ).map((s): MenuSectionData => ({ nazwa: s.nazwa, opis: s.opis, okladka: null, pozycje: [] }));
  const byName = new Map(sections.map((s) => [s.nazwa, s]));

  for (const p of items) {
    byName.get(p.sekcja)?.pozycje.push({
      id: p.id,
      nazwa: p.nazwa,
      opis: p.opis,
      ceny: JSON.parse(p.ceny),
      cechy: JSON.parse(p.cechy),
    });
  }
  const used = new Set<string>();
  for (const s of sections) s.okladka = cover(s.nazwa, s.pozycje, used);
  const info = db.prepare("SELECT menu_zrodlo, menu_sprawdzono FROM lokale WHERE id = ?").get(venueId) as {
    menu_zrodlo: string | null;
    menu_sprawdzono: string | null;
  };
  return {
    sekcje: sections.filter((s) => s.pozycje.length),
    liczba: items.length,
    zrodlo: info.menu_zrodlo,
    sprawdzono: info.menu_sprawdzono,
    bezCen: items.every((p) => p.ceny === "[]"),
    stareCeny: !!info.menu_sprawdzono && Date.now() - Date.parse(info.menu_sprawdzono) > YEAR_MS,
  };
}

/** Strefy dostawy lokalu (miejscowość → cena, minimum); null, gdy lokal ich nie podał. */
export async function getDelivery(venueId: number): Promise<Delivery | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("menu");

  const zones = (
    db
      .prepare("SELECT nazwa, miejsca, cena_gr, min_gr FROM strefy_dostawy WHERE lokal_id = ? ORDER BY kolejnosc")
      .all(venueId) as { nazwa: string; miejsca: string; cena_gr: number | null; min_gr: number | null }[]
  ).map((s) => ({ nazwa: s.nazwa, miejsca: JSON.parse(s.miejsca) as string[], cenaGr: s.cena_gr, minGr: s.min_gr }));
  if (!zones.length) return null;

  const info = db
    .prepare("SELECT dostawa_zrodlo, dostawa_sprawdzono, dostawa_uwagi FROM lokale WHERE id = ?")
    .get(venueId) as { dostawa_zrodlo: string | null; dostawa_sprawdzono: string | null; dostawa_uwagi: string | null };
  return { strefy: zones, zrodlo: info.dostawa_zrodlo, sprawdzono: info.dostawa_sprawdzono, uwagi: info.dostawa_uwagi };
}

export type Dish = { id: number; lokalId: number; sekcja: string; nazwa: string; opis: string | null; ceny: Price[] };

/**
 * Dania ze wszystkich lokali pasujące do frazy (nazwa, opis albo sekcja; bez polskich znaków),
 * np. „burger” → wszystkie burgery z cenami. Do wyszukiwarki dań i stron fraz.
 */
export async function searchDishes(phrase: string): Promise<Dish[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("menu");

  // Szukamy od początku słowa: „lody” nie trafi w „młody”. Kolumna szukaj ma same słowa oddzielone spacją.
  const f = stripPolish(phrase).replace(/[^a-z0-9]+/g, " ").trim();
  if (f.length < 2) return [];
  return (
    db
      .prepare(
        `SELECT id, lokal_id, sekcja, nazwa, opis, ceny FROM menu
         WHERE ' ' || szukaj LIKE ? ORDER BY lokal_id, kolejnosc`,
      )
      .all(`% ${f}%`) as { id: number; lokal_id: number; sekcja: string; nazwa: string; opis: string | null; ceny: string }[]
  ).map((d) => ({ id: d.id, lokalId: d.lokal_id, sekcja: d.sekcja, nazwa: d.nazwa, opis: d.opis, ceny: JSON.parse(d.ceny) }));
}
