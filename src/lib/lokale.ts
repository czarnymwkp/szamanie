import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { cuisinesFromName } from "./nazwy";
import { dishKey, type DishKey } from "./zdjeciaDan";
import { dishesForPhoto, assignPhotos, type VenuePhoto } from "./zdjeciaLokali";

export type Venue = {
  id: number;
  slug: string;
  nazwa: string;
  typ: string;
  kuchnie: string[];
  lat: number;
  lon: number;
  gmina: string | null;
  miejscowosc: string | null;
  adres: string | null;
  telefon: string | null;
  www: string | null;
  facebook: string | null;
  godziny: string | null;
  dostawa: boolean;
  naWynos: boolean;
  email: string | null;
  instagram: string | null;
  menuUrl: string | null;
  cechy: Features;
  opis: string | null;
  szablon: string; // wygląd podstrony lokalu (src/components/szablony)
  // płatne pakiety aktywne dzisiaj
  promowany: boolean;
  galeria: boolean;
  promocja: string | null; // tytuł pierwszej trwającej promocji (z panelu lokalu) — na karcie na liście
  zdjecie?: VenuePhoto | null; // zdjęcie poglądowe na kartę, każdy lokal inne (lib/zdjeciaLokali.ts)
};

/** Udogodnienia z OSM (scripts/import-osm.mjs → cechy), poprawek (npm run popraw) i menu (dania wege). */
export type Features = {
  ogrodek?: boolean;
  wozek?: "yes" | "limited";
  zwierzeta?: boolean; // można wejść z psem
  karta?: boolean;
  wifi?: boolean;
  wege?: boolean;
  wegan?: boolean;
  klimatyzacja?: boolean;
  tylkoNaWynos?: boolean;
};

export type Town = { nazwa: string; typ: string; lat: number; lon: number };

type Row = Omit<Venue, "kuchnie" | "dostawa" | "naWynos" | "promowany" | "galeria" | "menuUrl" | "cechy"> & {
  kuchnie: string;
  dostawa: number;
  na_wynos: number;
  menu_url: string | null;
  cechy: string;
  promowany: number;
  galeria: number;
};

// Udogodnienia, które da się ustawić poprawką: `npm run popraw -- <slug> zwierzeta tak` („nie” usuwa).
const FEATURES_FROM_OVERRIDES = ["zwierzeta", "wozek", "wege", "wegan"] as const;
// Tyle dań wege w menu (bez napojów i dodatków) wystarcza, żeby lokal dostał „Opcje wegetariańskie”.
const VEG_DISHES = 3;

function venueFeatures(features: string, overrides: Record<string, unknown>, vegFromMenu: boolean): Features {
  const c = JSON.parse(features) as Features;
  if (vegFromMenu) c.wege = true;
  for (const k of FEATURES_FROM_OVERRIDES) {
    if (!(k in overrides)) continue;
    if (!overrides[k]) delete c[k];
    else if (k === "wozek") c.wozek = "yes";
    else c[k] = true;
  }
  return c;
}

// Data lokalna w formacie RRRR-MM-DD, tak jak w tabeli pakiety.
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Wszystkie widoczne lokale: najpierw promowane (pakiet „top”), potem alfabetycznie.
 * Wynik jest w cache i odświeża się co minutę, więc zmiany w bazie widać po chwili.
 */
export async function getVenues(): Promise<Venue[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("lokale");

  const isActive = (kind: string) =>
    `EXISTS (SELECT 1 FROM pakiety p WHERE p.lokal_id = l.id AND p.rodzaj = '${kind}'
             AND @dzis BETWEEN p.od_dnia AND p.do_dnia)`;
  const rows = db
    .prepare(
      `SELECT l.id, l.slug, l.nazwa, l.typ, l.kuchnie, l.lat, l.lon, l.gmina, l.miejscowosc, l.adres,
              l.telefon, l.www, l.facebook, l.instagram, l.email, l.menu_url, l.cechy,
              l.godziny, l.dostawa, l.na_wynos, l.opis, l.szablon,
              ${isActive("top")} AS promowany, ${isActive("galeria")} AS galeria,
              (SELECT p.tytul FROM promocje p WHERE p.lokal_id = l.id AND p.aktywna = 1 AND p.usunieto IS NULL
                 AND (p.od_dnia IS NULL OR p.od_dnia <= @dzis) AND (p.do_dnia IS NULL OR p.do_dnia >= @dzis)
               ORDER BY p.kolejnosc, p.id LIMIT 1) AS promocja
       FROM lokale l WHERE l.ukryty = 0`,
    )
    .all({ dzis: today() }) as Row[];

  // Ręczne poprawki (tabela poprawki) wygrywają z danymi z OSM.
  const overrides = new Map<number, Record<string, unknown>>();
  for (const p of db.prepare("SELECT lokal_id, pole, wartosc FROM poprawki").all() as {
    lokal_id: number;
    pole: string;
    wartosc: string;
  }[]) {
    overrides.set(p.lokal_id, { ...overrides.get(p.lokal_id), [p.pole]: JSON.parse(p.wartosc) });
  }

  // Kuchnie z menu: lokal z pizzą w karcie trafia do kategorii „Pizza” (sos czy dodatek do pizzy się nie liczy).
  const fromMenu = new Map<number, Set<string>>();
  for (const d of db.prepare("SELECT lokal_id, sekcja, nazwa FROM menu").all() as {
    lokal_id: number;
    sekcja: string;
    nazwa: string;
  }[]) {
    const text = `${d.sekcja} ${d.nazwa}`;
    if (/dodat|\bsos|\bdip/i.test(text)) continue;
    for (const k of cuisinesFromName(text)) fromMenu.set(d.lokal_id, (fromMenu.get(d.lokal_id) ?? new Set()).add(k));
  }
  const vegFromMenu = new Set(
    (
      db
        .prepare(
          `SELECT lokal_id FROM menu
           WHERE cechy LIKE '%"wege"%' AND sekcja NOT LIKE '%napoj%' AND sekcja NOT LIKE '%dodat%'
           GROUP BY lokal_id HAVING COUNT(*) >= ?`,
        )
        .all(VEG_DISHES) as { lokal_id: number }[]
    ).map((m) => m.lokal_id),
  );
  // Lokal, który podał strefy dostawy, dowozi — nawet jeśli w OSM tego nie ma.
  const withZones = new Set(
    (db.prepare("SELECT DISTINCT lokal_id FROM strefy_dostawy").all() as { lokal_id: number }[]).map((s) => s.lokal_id),
  );

  // Dania z menu do wyboru zdjęcia poglądowego lokalu (np. lokal z karbonarą w karcie może dostać karbonarę).
  const menuKeys = new Map<number, DishKey[]>();
  for (const d of db.prepare("SELECT lokal_id, sekcja, nazwa, opis FROM menu ORDER BY lokal_id, kolejnosc").all() as {
    lokal_id: number;
    sekcja: string;
    nazwa: string;
    opis: string | null;
  }[]) {
    const k = dishKey(d.sekcja, d.nazwa, d.opis);
    if (k) menuKeys.set(d.lokal_id, [...(menuKeys.get(d.lokal_id) ?? []), k]);
  }

  const list = rows
    .map((row) => {
      const p = overrides.get(row.id) ?? {};
      const { kuchnie: kuchniePoprawione, dostawa, na_wynos: naWynosPoprawione, ...reszta } = p;
      // udogodnienia z poprawek trafiają do cech, nie jako osobne pola lokalu
      const fields = Object.fromEntries(
        Object.entries(reszta).filter(([k]) => !(FEATURES_FROM_OVERRIDES as readonly string[]).includes(k)),
      );
      return {
        ...row,
        ...fields,
        cechy: JSON.stringify(venueFeatures(row.cechy, p, vegFromMenu.has(row.id))),
        kuchnie: kuchniePoprawione ? JSON.stringify(kuchniePoprawione) : row.kuchnie,
        dostawa: dostawa === undefined ? row.dostawa : Number(dostawa),
        na_wynos: naWynosPoprawione === undefined ? row.na_wynos : Number(naWynosPoprawione),
      } as Row;
    })
    .map(({ na_wynos, menu_url, ...w }) => ({
      ...w,
      menuUrl: menu_url,
      cechy: JSON.parse(w.cechy) as Features,
      kuchnie: [
        ...new Set([...(JSON.parse(w.kuchnie) as string[]), ...cuisinesFromName(w.nazwa), ...(fromMenu.get(w.id) ?? [])]),
      ],
      dostawa: w.dostawa === 1 || withZones.has(w.id),
      naWynos: na_wynos === 1,
      promowany: w.promowany === 1,
      galeria: w.galeria === 1,
    }))
    .sort((a, b) => Number(b.promowany) - Number(a.promowany) || a.nazwa.localeCompare(b.nazwa, "pl"));

  const photos = assignPhotos(
    list,
    new Map([...menuKeys].map(([id, klucze]) => [id, dishesForPhoto(klucze)])),
  );
  return list.map((l) => ({ ...l, zdjecie: photos.get(l.id) ?? null }));
}

/** Miejscowości powiatu (miasta i wsie), Kraśnik pierwszy — do wyboru „blisko …” bez GPS. */
export async function getTowns(): Promise<Town[]> {
  "use cache";
  cacheLife("days");
  // node:sqlite zwraca obiekty bez prototypu — React nie przekaże ich do komponentu klienta, więc kopiujemy.
  const rows = (db.prepare("SELECT nazwa, typ, lat, lon FROM miejscowosci").all() as Town[]).map((m) => ({
    ...m,
  }));
  return rows.sort(
    (a, b) => Number(b.typ === "town") - Number(a.typ === "town") || a.nazwa.localeCompare(b.nazwa, "pl"),
  );
}

export async function getVenue(slug: string): Promise<Venue | null> {
  const venues = await getVenues();
  return venues.find((l) => l.slug === slug) ?? null;
}
