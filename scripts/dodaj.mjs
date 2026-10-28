// Dodaje lokale, których nie ma w OpenStreetMap (np. w Urzędowie OSM ma tylko punkt bez nazwy), z pliku
// dane/lokale-spoza-osm.txt. Lokal dostaje osm_id = NULL i reczna_edycja = 1, więc import z OSM go nie rusza.
// Ponowne uruchomienie aktualizuje lokale z pliku (po slugu), niczego nie kasuje.
// Użycie: npm run dodaj
//
// Format pliku (puste linie i linie od „# ” są pomijane), lokal za lokalem:
//   == Mały Bar PIZZA ==
//   typ: fast_food                    restaurant, fast_food, cafe, pub, bar, ice_cream
//   kuchnie: pizza, kebab, burger     jak w OSM (cuisine)
//   gmina: gm. Urzędów                jak w bazie: „Kraśnik” (miasto) albo „gm. …”
//   miejscowość: Urzędów
//   adres: Rynek 9
//   współrzędne: 50.99334, 22.14287
//   telefon / www / facebook / e-mail / menu: …
//   godziny: Tu-Su 10:00-23:00        format opening_hours z OSM
//   dostawa: tak / na wynos: tak
//   opis: …
//   źródło: https://…                 skąd są dane (tylko do wglądu, nie trafia do bazy)
import { readFileSync } from "node:fs";
import { openDatabase } from "../src/lib/db/otworz.mjs";
import { slugify } from "../src/lib/slug.mjs";

const PLIK = "dane/lokale-spoza-osm.txt";
const TYPY = new Set(["restaurant", "fast_food", "cafe", "pub", "bar", "ice_cream", "food_court"]);
const KLUCZE = {
  typ: "typ",
  kuchnie: "kuchnie",
  gmina: "gmina",
  miejscowość: "miejscowosc",
  adres: "adres",
  współrzędne: "wspolrzedne",
  telefon: "telefon",
  www: "www",
  facebook: "facebook",
  "e-mail": "email",
  menu: "menu_url",
  godziny: "godziny",
  dostawa: "dostawa",
  "na wynos": "na_wynos",
  opis: "opis",
  źródło: null,
};

function wczytaj() {
  const lokale = [];
  let lokal = null;
  readFileSync(PLIK, "utf8")
    .split(/\r?\n/)
    .forEach((surowa, i) => {
      const linia = surowa.trim();
      if (!linia || linia.startsWith("# ")) return;
      const naglowek = linia.match(/^==\s*(.+?)\s*==$/);
      if (naglowek) {
        lokal = { nazwa: naglowek[1], linia: i + 1 };
        lokale.push(lokal);
        return;
      }
      const m = linia.match(/^([^:]+):\s*(.*)$/);
      if (!lokal || !m || !(m[1].toLowerCase() in KLUCZE)) throw new Error(`${PLIK}:${i + 1}: nie rozumiem „${linia}”`);
      const klucz = KLUCZE[m[1].toLowerCase()];
      if (klucz) lokal[klucz] = m[2].trim();
    });
  return lokale;
}

function sprawdz(l) {
  const gdzie = `${PLIK}:${l.linia} (${l.nazwa})`;
  if (!TYPY.has(l.typ)) throw new Error(`${gdzie}: typ musi być jednym z: ${[...TYPY].join(", ")}`);
  const [lat, lon] = (l.wspolrzedne ?? "").split(",").map(Number);
  if (!(lat > 49 && lat < 55 && lon > 14 && lon < 25)) throw new Error(`${gdzie}: brak albo złe współrzędne`);
  if (!l.gmina || !l.miejscowosc) throw new Error(`${gdzie}: potrzebne gmina i miejscowość`);
  const takNie = (t) => (/^tak$/i.test(t ?? "") ? 1 : 0);
  return {
    slug: slugify(`${l.nazwa} ${l.miejscowosc}`),
    nazwa: l.nazwa,
    typ: l.typ,
    kuchnie: JSON.stringify((l.kuchnie ?? "").split(",").map((k) => k.trim()).filter(Boolean)),
    lat,
    lon,
    gmina: l.gmina,
    miejscowosc: l.miejscowosc,
    adres: l.adres ?? null,
    telefon: l.telefon ?? null,
    www: l.www ?? null,
    facebook: l.facebook ?? null,
    email: l.email ?? null,
    menu_url: l.menu_url ?? null,
    godziny: l.godziny ?? null,
    dostawa: takNie(l.dostawa),
    na_wynos: takNie(l.na_wynos),
    opis: l.opis ?? null,
  };
}

const lokale = wczytaj().map(sprawdz);
const db = openDatabase();
const istniejacy = db.prepare("SELECT id, osm_id FROM lokale WHERE slug = ?");
const POLA = Object.keys(lokale[0] ?? {}).filter((p) => p !== "slug");
const wstaw = db.prepare(
  `INSERT INTO lokale (slug, ${POLA.join(", ")}, osm_id, reczna_edycja)
   VALUES (@slug, ${POLA.map((p) => "@" + p).join(", ")}, NULL, 1)`,
);
const zmien = db.prepare(
  `UPDATE lokale SET ${POLA.map((p) => `${p} = @${p}`).join(", ")}, zaktualizowano = datetime('now') WHERE slug = @slug`,
);

for (const l of lokale) {
  const jest = istniejacy.get(l.slug);
  if (jest?.osm_id) {
    console.warn(`${l.slug}: ten lokal jest już w OSM (${jest.osm_id}) — popraw go przez „npm run popraw”. Pomijam.`);
  } else if (jest) {
    zmien.run(l);
    console.log(`${l.slug}: zaktualizowano.`);
  } else {
    wstaw.run(l);
    console.log(`${l.slug}: dodano.`);
  }
}
