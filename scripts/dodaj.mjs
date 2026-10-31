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

const FILE = "dane/lokale-spoza-osm.txt";
const TYPES = new Set(["restaurant", "fast_food", "cafe", "pub", "bar", "ice_cream", "food_court"]);
const KEYS = {
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

function load() {
  const venues = [];
  let venue = null;
  readFileSync(FILE, "utf8")
    .split(/\r?\n/)
    .forEach((raw, i) => {
      const line = raw.trim();
      if (!line || line.startsWith("# ")) return;
      const heading = line.match(/^==\s*(.+?)\s*==$/);
      if (heading) {
        venue = { nazwa: heading[1], linia: i + 1 };
        venues.push(venue);
        return;
      }
      const m = line.match(/^([^:]+):\s*(.*)$/);
      if (!venue || !m || !(m[1].toLowerCase() in KEYS)) throw new Error(`${FILE}:${i + 1}: nie rozumiem „${line}”`);
      const key = KEYS[m[1].toLowerCase()];
      if (key) venue[key] = m[2].trim();
    });
  return venues;
}

function check(l) {
  const where = `${FILE}:${l.linia} (${l.nazwa})`;
  if (!TYPES.has(l.typ)) throw new Error(`${where}: typ musi być jednym z: ${[...TYPES].join(", ")}`);
  const [lat, lon] = (l.wspolrzedne ?? "").split(",").map(Number);
  if (!(lat > 49 && lat < 55 && lon > 14 && lon < 25)) throw new Error(`${where}: brak albo złe współrzędne`);
  if (!l.gmina || !l.miejscowosc) throw new Error(`${where}: potrzebne gmina i miejscowość`);
  const yesNo = (t) => (/^tak$/i.test(t ?? "") ? 1 : 0);
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
    dostawa: yesNo(l.dostawa),
    na_wynos: yesNo(l.na_wynos),
    opis: l.opis ?? null,
  };
}

const venueRows = load().map(check);
const db = openDatabase();
const existingOne = db.prepare("SELECT id, osm_id FROM lokale WHERE slug = ?");
const FIELDS = Object.keys(venueRows[0] ?? {}).filter((p) => p !== "slug");
const insert = db.prepare(
  `INSERT INTO lokale (slug, ${FIELDS.join(", ")}, osm_id, reczna_edycja)
   VALUES (@slug, ${FIELDS.map((p) => "@" + p).join(", ")}, NULL, 1)`,
);
const change = db.prepare(
  `UPDATE lokale SET ${FIELDS.map((p) => `${p} = @${p}`).join(", ")}, zaktualizowano = datetime('now') WHERE slug = @slug`,
);

for (const l of venueRows) {
  const exists = existingOne.get(l.slug);
  if (exists?.osm_id) {
    console.warn(`${l.slug}: ten lokal jest już w OSM (${exists.osm_id}) — popraw go przez „npm run popraw”. Pomijam.`);
  } else if (exists) {
    change.run(l);
    console.log(`${l.slug}: zaktualizowano.`);
  } else {
    insert.run(l);
    console.log(`${l.slug}: dodano.`);
  }
}
