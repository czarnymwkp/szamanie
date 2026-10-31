// Seed data from the repository (dane/baza-startowa.json): the venue catalog, menus, delivery zones, towns and manual
// corrections. They are loaded when the database has no venues — a fresh server, CI, a new computer. A database that
// already has venues (the server) gets the venues from the file it is missing, newer admin corrections (`npm run
// override`) and the hiding of closed venues. Changes from the panel are never overwritten by the file. No accounts,
// sessions, claims, promotions or packages: the repository is public, and those are panel and contract data. The file
// is refreshed from the local database with `npm run seed:export`.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const SEED_FILE = "dane/baza-startowa.json";

// insertion order: tables referenced by foreign keys first
export const SEED_TABLES = ["miejscowosci", "lokale", "zdjecia", "poprawki", "menu_sekcje", "menu", "strefy_dostawy"];

// tables with a lokal_id column: a new venue's rows go to the server together with it
const VENUE_TABLES = ["zdjecia", "poprawki", "menu_sekcje", "menu", "strefy_dostawy"];

/**
 * Inserts the seed data into an empty database, and updates a database with venues from the file (new venues,
 * corrections, hidden venues). Returns the number of changes (0 when nothing was added or there is no file).
 */
export function loadSeedData(db, path = SEED_FILE) {
  let file;
  try {
    // turbopackIgnore: the file is read at runtime (in the Docker image it lives in /app/dane), not during the build
    file = readFileSync(resolve(/* turbopackIgnore: true */ path), "utf8");
  } catch {
    return 0;
  }
  const { tabele } = JSON.parse(file);

  db.exec("BEGIN IMMEDIATE");
  try {
    // checked only while holding the lock: another process (a build worker) may have inserted the data before us
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
 * Venues from the file that are not in the database (by neither slug nor osm_id), with their photos, corrections, menus
 * and delivery zones, plus missing towns. Existing venues are left alone, so panel changes on the server stay. This is
 * how a venue added locally (npm run add-venues, OSM import) reaches the server after `npm run seed:export` and a
 * deployment.
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

  // the id from the file when it is free on the server; when taken — a new id and lokal_id rewritten in the venue's
  // tables
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
    // row ids (menu, zones, photos) are assigned by the database, so they do not collide with rows from the panel
    const insert = inserter(db, name, table.kolumny, { bez: ["id"] });
    for (const row of table.wiersze) {
      if (newIds.has(row[iVenue])) insert(row, { lokal_id: newIds.get(row[iVenue]) });
    }
  }
  return newOnes.length;
}

/**
 * Admin corrections from the file (author „admin”, i.e. `npm run override`) for venues already in the database: a
 * missing one is added, and an older admin correction gives way to a newer one from the file. Corrections from the
 * panel (author „konto:…”) are not touched by the file — the venue's change wins. Removing a correction (`override …
 * usun`) does not propagate to the server.
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
 * Menus and delivery zones transcribed from venue menu cards (dane/lokale/*.txt) are on the server exactly as in the
 * file: a venue without a menu gets it, and a menu that differs from the file (a card transcribed again or completed)
 * is replaced. Menus or delivery run in the panel (source „panel”) and venues whose menu is not in the file are left
 * untouched.
 */
const VENUE_TABLE_GROUPS = [
  { tabele: ["menu_sekcje", "menu"], zrodlo: "menu_zrodlo", pola: ["menu_zrodlo", "menu_sprawdzono"] },
  { tabele: ["strefy_dostawy"], zrodlo: "dostawa_zrodlo", pola: ["dostawa_zrodlo", "dostawa_sprawdzono", "dostawa_uwagi"] },
];

function syncMenus(db, tables) {
  // Only on the server (SZAMANIE_SERWER=1 in the Docker image). Locally the database is the source of the file: a menu
  // from `npm run menu` must survive until `npm run seed:export`, not be reverted to an older version from the file
  // when the database is opened.
  if (process.env.SZAMANIE_SERWER !== "1") return 0;
  const { lokale } = tables;
  if (!lokale?.wiersze.length) return 0;
  const col = (table, name) => table.kolumny.indexOf(name);
  const venueInDb = db.prepare("SELECT id, menu_zrodlo, dostawa_zrodlo FROM lokale WHERE slug = ?");

  // columns compared and copied: present in both the file and the database, without the row's own id and lokal_id
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
  // fingerprint: rows as text, sorted (the „kolejnosc” column keeps the order)
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
      // where the menu comes from and when it was checked (the „Ceny sprawdzone …” note)
      const fields = group.pola.filter((p) => col(lokale, p) >= 0);
      db.prepare(`UPDATE lokale SET ${fields.map((p) => `${p} = ?`).join(", ")} WHERE id = ?`).run(
        ...fields.map((p) => venueRow[col(lokale, p)]),
        venue.id,
      );
    }
  }
  return changes;
}

/**
 * A venue hidden in the file (closed) disappears from the database too. Unhiding stays manual — the panel does not hide
 * venues.
 */
function hideClosed(db, tables) {
  const venues = tables.lokale;
  if (!venues?.wiersze.length) return 0;
  const [iSlug, iUkryty] = [venues.kolumny.indexOf("slug"), venues.kolumny.indexOf("ukryty")];
  const hide = db.prepare("UPDATE lokale SET ukryty = 1 WHERE slug = ? AND ukryty = 0");
  return venues.wiersze.filter((w) => w[iUkryty]).reduce((n, w) => n + Number(hide.run(w[iSlug]).changes), 0);
}

/**
 * INSERT with the file's columns that exist in the table (the file and the database can come from different schema
 * versions).
 */
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
