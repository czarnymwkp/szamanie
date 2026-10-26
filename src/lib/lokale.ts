import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { kuchnieZNazwy } from "./nazwy";

export type Lokal = {
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
  cechy: Cechy;
  opis: string | null;
  szablon: string; // wygląd podstrony lokalu (src/components/szablony)
  // płatne pakiety aktywne dzisiaj
  promowany: boolean;
  galeria: boolean;
};

/** Udogodnienia z OSM (scripts/import-osm.mjs → cechy), poprawek (npm run popraw) i menu (dania wege). */
export type Cechy = {
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

export type Miejscowosc = { nazwa: string; typ: string; lat: number; lon: number };

type Wiersz = Omit<Lokal, "kuchnie" | "dostawa" | "naWynos" | "promowany" | "galeria" | "menuUrl" | "cechy"> & {
  kuchnie: string;
  dostawa: number;
  na_wynos: number;
  menu_url: string | null;
  cechy: string;
  promowany: number;
  galeria: number;
};

// Udogodnienia, które da się ustawić poprawką: `npm run popraw -- <slug> zwierzeta tak` („nie” usuwa).
const CECHY_Z_POPRAWEK = ["zwierzeta", "wozek", "wege", "wegan"] as const;
// Tyle dań wege w menu (bez napojów i dodatków) wystarcza, żeby lokal dostał „Opcje wegetariańskie”.
const DAN_WEGE = 3;

function cechyLokalu(cechy: string, poprawki: Record<string, unknown>, wegeZMenu: boolean): Cechy {
  const c = JSON.parse(cechy) as Cechy;
  if (wegeZMenu) c.wege = true;
  for (const k of CECHY_Z_POPRAWEK) {
    if (!(k in poprawki)) continue;
    if (!poprawki[k]) delete c[k];
    else if (k === "wozek") c.wozek = "yes";
    else c[k] = true;
  }
  return c;
}

// Data lokalna w formacie RRRR-MM-DD, tak jak w tabeli pakiety.
function dzisiaj() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Wszystkie widoczne lokale: najpierw promowane (pakiet „top”), potem alfabetycznie.
 * Wynik jest w cache i odświeża się co minutę, więc zmiany w bazie widać po chwili.
 */
export async function pobierzLokale(): Promise<Lokal[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("lokale");

  const aktywny = (rodzaj: string) =>
    `EXISTS (SELECT 1 FROM pakiety p WHERE p.lokal_id = l.id AND p.rodzaj = '${rodzaj}'
             AND @dzis BETWEEN p.od_dnia AND p.do_dnia)`;
  const wiersze = db
    .prepare(
      `SELECT l.id, l.slug, l.nazwa, l.typ, l.kuchnie, l.lat, l.lon, l.gmina, l.miejscowosc, l.adres,
              l.telefon, l.www, l.facebook, l.instagram, l.email, l.menu_url, l.cechy,
              l.godziny, l.dostawa, l.na_wynos, l.opis, l.szablon,
              ${aktywny("top")} AS promowany, ${aktywny("galeria")} AS galeria
       FROM lokale l WHERE l.ukryty = 0`,
    )
    .all({ dzis: dzisiaj() }) as Wiersz[];

  // Ręczne poprawki (tabela poprawki) wygrywają z danymi z OSM.
  const poprawki = new Map<number, Record<string, unknown>>();
  for (const p of db.prepare("SELECT lokal_id, pole, wartosc FROM poprawki").all() as {
    lokal_id: number;
    pole: string;
    wartosc: string;
  }[]) {
    poprawki.set(p.lokal_id, { ...poprawki.get(p.lokal_id), [p.pole]: JSON.parse(p.wartosc) });
  }

  // Kuchnie z menu: lokal z pizzą w karcie trafia do kategorii „Pizza” (sos czy dodatek do pizzy się nie liczy).
  const zMenu = new Map<number, Set<string>>();
  for (const d of db.prepare("SELECT lokal_id, sekcja, nazwa FROM menu").all() as {
    lokal_id: number;
    sekcja: string;
    nazwa: string;
  }[]) {
    const tekst = `${d.sekcja} ${d.nazwa}`;
    if (/dodat|\bsos|\bdip/i.test(tekst)) continue;
    for (const k of kuchnieZNazwy(tekst)) zMenu.set(d.lokal_id, (zMenu.get(d.lokal_id) ?? new Set()).add(k));
  }
  const wegeZMenu = new Set(
    (
      db
        .prepare(
          `SELECT lokal_id FROM menu
           WHERE cechy LIKE '%"wege"%' AND sekcja NOT LIKE '%napoj%' AND sekcja NOT LIKE '%dodat%'
           GROUP BY lokal_id HAVING COUNT(*) >= ?`,
        )
        .all(DAN_WEGE) as { lokal_id: number }[]
    ).map((m) => m.lokal_id),
  );
  // Lokal, który podał strefy dostawy, dowozi — nawet jeśli w OSM tego nie ma.
  const zeStrefami = new Set(
    (db.prepare("SELECT DISTINCT lokal_id FROM strefy_dostawy").all() as { lokal_id: number }[]).map((s) => s.lokal_id),
  );

  return wiersze
    .map((wiersz) => {
      const p = poprawki.get(wiersz.id) ?? {};
      const { kuchnie: kuchniePoprawione, dostawa, na_wynos: naWynosPoprawione, ...reszta } = p;
      // udogodnienia z poprawek trafiają do cech, nie jako osobne pola lokalu
      const pola = Object.fromEntries(
        Object.entries(reszta).filter(([k]) => !(CECHY_Z_POPRAWEK as readonly string[]).includes(k)),
      );
      return {
        ...wiersz,
        ...pola,
        cechy: JSON.stringify(cechyLokalu(wiersz.cechy, p, wegeZMenu.has(wiersz.id))),
        kuchnie: kuchniePoprawione ? JSON.stringify(kuchniePoprawione) : wiersz.kuchnie,
        dostawa: dostawa === undefined ? wiersz.dostawa : Number(dostawa),
        na_wynos: naWynosPoprawione === undefined ? wiersz.na_wynos : Number(naWynosPoprawione),
      } as Wiersz;
    })
    .map(({ na_wynos, menu_url, ...w }) => ({
      ...w,
      menuUrl: menu_url,
      cechy: JSON.parse(w.cechy) as Cechy,
      kuchnie: [
        ...new Set([...(JSON.parse(w.kuchnie) as string[]), ...kuchnieZNazwy(w.nazwa), ...(zMenu.get(w.id) ?? [])]),
      ],
      dostawa: w.dostawa === 1 || zeStrefami.has(w.id),
      naWynos: na_wynos === 1,
      promowany: w.promowany === 1,
      galeria: w.galeria === 1,
    }))
    .sort((a, b) => Number(b.promowany) - Number(a.promowany) || a.nazwa.localeCompare(b.nazwa, "pl"));
}

/** Miejscowości powiatu (miasta i wsie), Kraśnik pierwszy — do wyboru „blisko …” bez GPS. */
export async function pobierzMiejscowosci(): Promise<Miejscowosc[]> {
  "use cache";
  cacheLife("days");
  // node:sqlite zwraca obiekty bez prototypu — React nie przekaże ich do komponentu klienta, więc kopiujemy.
  const wiersze = (db.prepare("SELECT nazwa, typ, lat, lon FROM miejscowosci").all() as Miejscowosc[]).map((m) => ({
    ...m,
  }));
  return wiersze.sort(
    (a, b) => Number(b.typ === "town") - Number(a.typ === "town") || a.nazwa.localeCompare(b.nazwa, "pl"),
  );
}

export async function pobierzLokal(slug: string): Promise<Lokal | null> {
  const lokale = await pobierzLokale();
  return lokale.find((l) => l.slug === slug) ?? null;
}
