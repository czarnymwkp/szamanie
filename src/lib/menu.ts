import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { bezPolskich } from "./slug.mjs";
import { zdjecieDania } from "./zdjeciaDan";
import { ZDJECIA_KATEGORII, type KluczZdjecia } from "./zdjeciaKategorii";

export type Cena = { wariant: string | null; gr: number };
export type CechaDania = "wege" | "ostre" | "polecane" | "sezonowe";

export type PozycjaMenu = {
  id: number;
  nazwa: string;
  opis: string | null;
  ceny: Cena[];
  cechy: CechaDania[];
};

/** Zdjęcie na kafelku sekcji; `pozycja` to object-position kadru. */
export type Okladka = { plik: string; pozycja: string };

export type SekcjaMenu = {
  nazwa: string;
  opis: string | null;
  okladka: Okladka | null; // zdjęcie poglądowe na kafelku sekcji (w samym menu dań bez zdjęć)
  pozycje: PozycjaMenu[];
};

export type Menu = {
  sekcje: SekcjaMenu[];
  liczba: number;
  zrodlo: string | null;
  sprawdzono: string | null;
  bezCen: boolean; // lokal podaje same dania (np. Zielony Dworek)
  stareCeny: boolean; // ceny sprzed ponad roku (np. zdjęcie tablicy z 2023)
};

const ROK_MS = 365 * 24 * 60 * 60 * 1000;

export type Strefa = { nazwa: string; miejsca: string[]; cenaGr: number | null; minGr: number | null };
export type Dostawa = { strefy: Strefa[]; zrodlo: string | null; sprawdzono: string | null; uwagi: string | null };

// Okładki sekcji: najpierw zdjęcie kategorii (pierwsza pasująca reguła), potem zdjęcie poglądowe pierwszego dania
// sekcji, które je ma (np. „Napoje zimne” → cola). To samo zdjęcie nie powtarza się w jednym menu.
const OKLADKI: [RegExp, KluczZdjecia][] = [
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

function okladka(sekcja: string, dania: { nazwa: string; opis: string | null }[], uzyte: Set<string>): Okladka | null {
  const tekst = bezPolskich(sekcja);
  const trafienie = OKLADKI.find(([wzor]) => wzor.test(tekst));
  const kategorii = trafienie && ZDJECIA_KATEGORII[trafienie[1]];
  if (kategorii && !uzyte.has(kategorii.plik)) {
    uzyte.add(kategorii.plik);
    return { plik: kategorii.plik, pozycja: kategorii.pozycja };
  }
  for (const d of dania) {
    const plik = zdjecieDania(sekcja, d.nazwa, d.opis);
    if (plik && !uzyte.has(plik)) {
      uzyte.add(plik);
      return { plik, pozycja: "center" };
    }
  }
  return null;
}

/** Menu lokalu z podziałem na sekcje; null, gdy lokal nie ma jeszcze menu w bazie. */
export async function pobierzMenu(lokalId: number): Promise<Menu | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("menu");

  const pozycje = db
    .prepare("SELECT id, sekcja, nazwa, opis, ceny, cechy FROM menu WHERE lokal_id = ? ORDER BY kolejnosc")
    .all(lokalId) as { id: number; sekcja: string; nazwa: string; opis: string | null; ceny: string; cechy: string }[];
  if (!pozycje.length) return null;

  const sekcje = (
    db.prepare("SELECT nazwa, opis FROM menu_sekcje WHERE lokal_id = ? ORDER BY kolejnosc").all(lokalId) as {
      nazwa: string;
      opis: string | null;
    }[]
  ).map((s): SekcjaMenu => ({ nazwa: s.nazwa, opis: s.opis, okladka: null, pozycje: [] }));
  const poNazwie = new Map(sekcje.map((s) => [s.nazwa, s]));

  for (const p of pozycje) {
    poNazwie.get(p.sekcja)?.pozycje.push({
      id: p.id,
      nazwa: p.nazwa,
      opis: p.opis,
      ceny: JSON.parse(p.ceny),
      cechy: JSON.parse(p.cechy),
    });
  }
  const uzyte = new Set<string>();
  for (const s of sekcje) s.okladka = okladka(s.nazwa, s.pozycje, uzyte);
  const info = db.prepare("SELECT menu_zrodlo, menu_sprawdzono FROM lokale WHERE id = ?").get(lokalId) as {
    menu_zrodlo: string | null;
    menu_sprawdzono: string | null;
  };
  return {
    sekcje: sekcje.filter((s) => s.pozycje.length),
    liczba: pozycje.length,
    zrodlo: info.menu_zrodlo,
    sprawdzono: info.menu_sprawdzono,
    bezCen: pozycje.every((p) => p.ceny === "[]"),
    stareCeny: !!info.menu_sprawdzono && Date.now() - Date.parse(info.menu_sprawdzono) > ROK_MS,
  };
}

/** Strefy dostawy lokalu (miejscowość → cena, minimum); null, gdy lokal ich nie podał. */
export async function pobierzDostawe(lokalId: number): Promise<Dostawa | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("menu");

  const strefy = (
    db
      .prepare("SELECT nazwa, miejsca, cena_gr, min_gr FROM strefy_dostawy WHERE lokal_id = ? ORDER BY kolejnosc")
      .all(lokalId) as { nazwa: string; miejsca: string; cena_gr: number | null; min_gr: number | null }[]
  ).map((s) => ({ nazwa: s.nazwa, miejsca: JSON.parse(s.miejsca) as string[], cenaGr: s.cena_gr, minGr: s.min_gr }));
  if (!strefy.length) return null;

  const info = db
    .prepare("SELECT dostawa_zrodlo, dostawa_sprawdzono, dostawa_uwagi FROM lokale WHERE id = ?")
    .get(lokalId) as { dostawa_zrodlo: string | null; dostawa_sprawdzono: string | null; dostawa_uwagi: string | null };
  return { strefy, zrodlo: info.dostawa_zrodlo, sprawdzono: info.dostawa_sprawdzono, uwagi: info.dostawa_uwagi };
}

export type Danie = { id: number; lokalId: number; sekcja: string; nazwa: string; opis: string | null; ceny: Cena[] };

/**
 * Dania ze wszystkich lokali pasujące do frazy (nazwa, opis albo sekcja; bez polskich znaków),
 * np. „burger” → wszystkie burgery z cenami. Do wyszukiwarki dań i stron fraz.
 */
export async function szukajDan(fraza: string): Promise<Danie[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("menu");

  // Szukamy od początku słowa: „lody” nie trafi w „młody”. Kolumna szukaj ma same słowa oddzielone spacją.
  const f = bezPolskich(fraza).replace(/[^a-z0-9]+/g, " ").trim();
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
