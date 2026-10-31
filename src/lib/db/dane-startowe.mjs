// Dane startowe z repozytorium (dane/baza-startowa.json): katalog lokali, menu, strefy dostawy, miejscowości,
// ręczne poprawki. Trafiają do bazy, gdy nie ma w niej żadnego lokalu — świeży serwer, CI, nowy komputer.
// Do bazy, w której lokale już są (serwer), dochodzą lokale z pliku, których w niej brakuje, nowsze poprawki
// admina (`npm run popraw`) i ukrycie zamkniętych lokali. Zmian z panelu plik nie nadpisuje.
// Bez kont, sesji, zgłoszeń, promocji i pakietów: repozytorium jest publiczne, a to dane z panelu i z umów.
// Plik odświeża `npm run baza:eksport` z lokalnej bazy.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const SEED_FILE = "dane/baza-startowa.json";

// kolejność wstawiania: najpierw tabele, do których odwołują się klucze obce
export const SEED_TABLES = ["miejscowosci", "lokale", "zdjecia", "poprawki", "menu_sekcje", "menu", "strefy_dostawy"];

// tabele z kolumną lokal_id: wiersze nowego lokalu idą na serwer razem z nim
const VENUE_TABLES = ["zdjecia", "poprawki", "menu_sekcje", "menu", "strefy_dostawy"];

/**
 * Wstawia dane startowe do pustej bazy, a bazę z lokalami uzupełnia z pliku (nowe lokale, poprawki, ukrycia).
 * Zwraca liczbę zmian (0, gdy nic nie doszło albo nie ma pliku).
 */
export function loadSeedData(db, path = SEED_FILE) {
  let file;
  try {
    // turbopackIgnore: plik czytany w czasie działania (w obrazie Dockera leży w /app/dane), nie przy buildzie
    file = readFileSync(resolve(/* turbopackIgnore: true */ path), "utf8");
  } catch {
    return 0;
  }
  const { tabele } = JSON.parse(file);

  db.exec("BEGIN IMMEDIATE");
  try {
    // sprawdzane dopiero z blokadą: inny proces (worker buildu) mógł wstawić dane przed nami
    let description;
    if (db.prepare("SELECT 1 FROM lokale LIMIT 1").get()) {
      const [lokale, poprawki, menu, ukryte] = [seedNewVenues, syncOverrides, syncMenus, hideClosed].map(
        (f) => f(db, tabele),
      );
      description = { "nowe lokale": lokale, poprawki, "pozycje menu i stref": menu, "ukryte lokale": ukryte };
    } else {
      description = { lokale: insertAll(db, tabele) };
    }
    db.exec("COMMIT");
    const changes = Object.values(description).reduce((a, b) => a + b, 0);
    if (changes) {
      const list = Object.entries(description).filter(([, n]) => n).map(([co, n]) => `${co}: ${n}`);
      console.log(`Dane startowe z ${path} — ${list.join(", ")}`);
    }
    return changes;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function insertAll(db, tables) {
  for (const name of SEED_TABLES) {
    const table = tables[name];
    if (!table?.wiersze.length) continue;
    const insert = inserter(db, name, table.kolumny);
    for (const row of table.wiersze) insert(row);
  }
  return tables.lokale?.wiersze.length ?? 0;
}

/**
 * Lokale z pliku, których nie ma w bazie (ani po slug, ani po osm_id), z ich zdjęciami, poprawkami, menu i strefami
 * dostawy, plus brakujące miejscowości. Istniejących lokali nie rusza, więc zmiany z panelu na serwerze zostają.
 * Tak lokal dodany lokalnie (npm run dodaj, import OSM) po `npm run baza:eksport` i wdrożeniu trafia też na serwer.
 */
function seedNewVenues(db, tables) {
  const venues = tables.lokale;
  if (!venues?.wiersze.length) return 0;
  const col = (name) => venues.kolumny.indexOf(name);
  const [iId, iSlug, iOsm] = [col("id"), col("slug"), col("osm_id")];
  const slugs = new Set(db.prepare("SELECT slug FROM lokale").all().map((w) => w.slug));
  const osmIds = new Set(db.prepare("SELECT osm_id FROM lokale WHERE osm_id IS NOT NULL").all().map((w) => w.osm_id));
  const newOnes = venues.wiersze.filter((w) => !slugs.has(w[iSlug]) && !(w[iOsm] && osmIds.has(w[iOsm])));
  if (!newOnes.length) return 0;

  if (tables.miejscowosci?.wiersze.length) {
    const insert = inserter(db, "miejscowosci", tables.miejscowosci.kolumny, { lubPomin: true });
    for (const row of tables.miejscowosci.wiersze) insert(row);
  }

  // id z pliku, gdy na serwerze wolne; zajęte — nowe id i przepisanie lokal_id w tabelach lokalu
  const withId = inserter(db, "lokale", venues.kolumny);
  const withoutId = inserter(db, "lokale", venues.kolumny, { bez: ["id"] });
  const taken = db.prepare("SELECT 1 FROM lokale WHERE id = ?");
  const newIds = new Map();
  for (const row of newOnes) {
    const id = taken.get(row[iId]) ? Number(withoutId(row).lastInsertRowid) : (withId(row), row[iId]);
    newIds.set(row[iId], id);
  }

  for (const name of VENUE_TABLES) {
    const table = tables[name];
    if (!table?.wiersze.length) continue;
    const iVenue = table.kolumny.indexOf("lokal_id");
    // własne id wierszy (menu, strefy, zdjęcia) nadaje baza, żeby nie zderzyć się z wierszami z panelu
    const insert = inserter(db, name, table.kolumny, { bez: ["id"] });
    for (const row of table.wiersze) {
      if (newIds.has(row[iVenue])) insert(row, { lokal_id: newIds.get(row[iVenue]) });
    }
  }
  return newOnes.length;
}

/**
 * Poprawki admina z pliku (autor „admin”, czyli `npm run popraw`) dla lokali, które już są w bazie: brakująca
 * dochodzi, a starsza poprawka admina ustępuje nowszej z pliku. Poprawek z panelu (autor „konto:…”) plik nie
 * rusza — zmiana od lokalu wygrywa. Cofnięcie poprawki (`popraw … usun`) na serwer nie przechodzi.
 */
function syncOverrides(db, tables) {
  const { lokale, poprawki } = tables;
  if (!poprawki?.wiersze.length || !lokale?.wiersze.length) return 0;
  const col = (table, name) => table.kolumny.indexOf(name);
  const slugFromFile = new Map(lokale.wiersze.map((w) => [w[col(lokale, "id")], w[col(lokale, "slug")]]));
  const idInDb = new Map(db.prepare("SELECT slug, id FROM lokale").all().map((w) => [w.slug, w.id]));
  const current = db.prepare("SELECT wartosc, autor, utworzono FROM poprawki WHERE lokal_id = ? AND pole = ?");
  const save = db.prepare(
    `INSERT INTO poprawki (lokal_id, pole, wartosc, autor, utworzono) VALUES (?, ?, ?, 'admin', ?)
     ON CONFLICT(lokal_id, pole) DO UPDATE
       SET wartosc = excluded.wartosc, autor = 'admin', utworzono = excluded.utworzono`,
  );
  const [iLokal, iPole, iWartosc, iAutor, iKiedy] = ["lokal_id", "pole", "wartosc", "autor", "utworzono"].map((n) =>
    col(poprawki, n),
  );
  let changes = 0;
  for (const w of poprawki.wiersze) {
    const id = idInDb.get(slugFromFile.get(w[iLokal]));
    if (w[iAutor] !== "admin" || id === undefined) continue;
    const exists = current.get(id, w[iPole]);
    if (exists && (exists.autor !== "admin" || exists.wartosc === w[iWartosc] || exists.utworzono >= w[iKiedy])) continue;
    save.run(id, w[iPole], w[iWartosc], w[iKiedy]);
    changes++;
  }
  return changes;
}

/**
 * Menu i strefy dostawy przepisane z kart lokali (dane/lokale/*.txt) są na serwerze takie jak w pliku: lokal bez menu
 * je dostaje, a menu inne niż w pliku (karta przepisana na nowo albo uzupełniona) zostaje zastąpione. Menu albo
 * dostawa prowadzone w panelu (źródło „panel”) i lokale, których menu w pliku nie ma, zostają nietknięte.
 */
const VENUE_TABLE_GROUPS = [
  { tabele: ["menu_sekcje", "menu"], zrodlo: "menu_zrodlo", pola: ["menu_zrodlo", "menu_sprawdzono"] },
  { tabele: ["strefy_dostawy"], zrodlo: "dostawa_zrodlo", pola: ["dostawa_zrodlo", "dostawa_sprawdzono", "dostawa_uwagi"] },
];

function syncMenus(db, tables) {
  // Tylko na serwerze (SZAMANIE_SERWER=1 w obrazie Dockera). Lokalnie to baza jest źródłem pliku: menu z `npm run menu`
  // musi dotrwać do `npm run baza:eksport`, a nie zostać cofnięte do starszej wersji z pliku przy otwarciu bazy.
  if (process.env.SZAMANIE_SERWER !== "1") return 0;
  const { lokale } = tables;
  if (!lokale?.wiersze.length) return 0;
  const col = (table, name) => table.kolumny.indexOf(name);
  const venueInDb = db.prepare("SELECT id, menu_zrodlo, dostawa_zrodlo FROM lokale WHERE slug = ?");

  // kolumny porównywane i przepisywane: z pliku i z bazy naraz, bez własnego id wiersza i lokal_id
  const columns = Object.fromEntries(
    VENUE_TABLE_GROUPS.flatMap((g) => g.tabele).map((name) => {
      const inDb = new Set(db.prepare(`PRAGMA table_info(${name})`).all().map((k) => k.name));
      return [name, (tables[name]?.kolumny ?? []).filter((k) => inDb.has(k) && k !== "id" && k !== "lokal_id")];
    }),
  );
  const fromFile = (name, fileId) => {
    const t = tables[name];
    if (!t?.wiersze.length) return [];
    const iVenue = col(t, "lokal_id");
    return t.wiersze.filter((w) => w[iVenue] === fileId);
  };
  // odcisk: wiersze jako tekst, posortowane (kolejność trzyma kolumna „kolejnosc”)
  const fileFingerprint = (name, rows) =>
    rows.map((w) => JSON.stringify(columns[name].map((k) => w[col(tables[name], k)]))).sort();
  const dbFingerprint = (name, id) =>
    db
      .prepare(`SELECT ${columns[name].map((k) => `"${k}"`).join(", ")} FROM ${name} WHERE lokal_id = ?`)
      .all(id)
      .map((w) => JSON.stringify(columns[name].map((k) => w[k])))
      .sort();

  let changes = 0;
  for (const venueRow of lokale.wiersze) {
    const venue = venueInDb.get(venueRow[col(lokale, "slug")]);
    if (!venue) continue;
    for (const group of VENUE_TABLE_GROUPS) {
      if (venue[group.zrodlo] === "panel") continue;
      const rows = Object.fromEntries(group.tabele.map((n) => [n, fromFile(n, venueRow[col(lokale, "id")])]));
      if (!Object.values(rows).some((w) => w.length)) continue;
      const same = group.tabele.every(
        (n) => JSON.stringify(fileFingerprint(n, rows[n])) === JSON.stringify(dbFingerprint(n, venue.id)),
      );
      if (same) continue;
      for (const n of group.tabele) {
        db.prepare(`DELETE FROM ${n} WHERE lokal_id = ?`).run(venue.id);
        const insert = inserter(db, n, tables[n].kolumny, { bez: ["id"] });
        for (const w of rows[n]) insert(w, { lokal_id: venue.id });
        changes += rows[n].length;
      }
      // skąd menu i kiedy sprawdzone (napis „Ceny sprawdzone …”)
      const fields = group.pola.filter((p) => col(lokale, p) >= 0);
      db.prepare(`UPDATE lokale SET ${fields.map((p) => `${p} = ?`).join(", ")} WHERE id = ?`).run(
        ...fields.map((p) => venueRow[col(lokale, p)]),
        venue.id,
      );
    }
  }
  return changes;
}

/** Lokal ukryty w pliku (zamknięty) znika też z bazy. Odkrycie zostaje ręczne — panel nie ukrywa lokali. */
function hideClosed(db, tables) {
  const venues = tables.lokale;
  if (!venues?.wiersze.length) return 0;
  const [iSlug, iUkryty] = [venues.kolumny.indexOf("slug"), venues.kolumny.indexOf("ukryty")];
  const hide = db.prepare("UPDATE lokale SET ukryty = 1 WHERE slug = ? AND ukryty = 0");
  return venues.wiersze.filter((w) => w[iUkryty]).reduce((n, w) => n + Number(hide.run(w[iSlug]).changes), 0);
}

/** INSERT z kolumnami z pliku, które są w tabeli (plik i baza mogą być z różnych wersji schematu). */
function inserter(db, name, columns, { bez = [], lubPomin = false } = {}) {
  const inDb = new Set(db.prepare(`PRAGMA table_info(${name})`).all().map((k) => k.name));
  const used = columns.flatMap((k, i) => (inDb.has(k) && !bez.includes(k) ? [i] : []));
  const query = db.prepare(
    `INSERT ${lubPomin ? "OR IGNORE " : ""}INTO ${name} (${used.map((i) => `"${columns[i]}"`).join(", ")}) ` +
      `VALUES (${used.map(() => "?").join(", ")})`,
  );
  return (row, overrides = {}) =>
    query.run(...used.map((i) => (columns[i] in overrides ? overrides[columns[i]] : row[i])));
}
