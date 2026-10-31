// Loads menus with prices and delivery zones from dane/lokale/<slug>.txt into the database (until venues use the panel). A file replaces a venue's whole menu (the == MENU == block) and delivery zones (the == DOSTAWA == block); a block missing from the file is left alone.
// Usage: npm run menu                           all files
//        npm run menu -- si-krasnik             one venue
//        npm run menu -- si-krasnik --wymus     also when the venue edits its menu in the panel (overwrites its changes)
//
// File format (empty lines and lines starting with „# ” are skipped):
//   źródło: https://…               where the menu comes from (website, „zdjęcie karty”, „telefon”)
//   sprawdzono: 2026-10-25          when the prices were current
//   == DOSTAWA ==
//   źródło: … / sprawdzono: … / uwagi: …
//   Zone name [= Town, Town] | price zł („?” = not given) | minimum order zł
//   == MENU ==
//   ## Sekcja [| opis sekcji]
// Name | description | price („27”, „29,90” or „32 cm: 27; 45 cm: 37”) | features: wege, ostre, polecane, sezonowe
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { openDatabase } from "../src/lib/db/open.mjs";
import { stripPolish } from "../src/lib/slug.mjs";

const CATALOG = "dane/lokale";
const FEATURES = new Set(["wege", "ostre", "polecane", "sezonowe"]);
const KEYS = { źródło: "zrodlo", sprawdzono: "sprawdzono", uwagi: "uwagi" };

const db = openDatabase();
const knownPlaces = new Set(db.prepare("SELECT nazwa FROM miejscowosci").all().map((m) => m.nazwa));

/** „29,90” → 2990 grosze; empty text or „?” → null. */
function toGrosze(text, where) {
  const t = text.replace(/zł/g, "").trim();
  if (!t || t === "?") return null;
  const count = Number(t.replace(",", "."));
  if (!Number.isFinite(count) || count < 0) throw new Error(`${where}: zła cena „${text}”`);
  return Math.round(count * 100);
}

function prices(text, where) {
  if (!text.trim()) return [];
  return text.split(";").map((part) => {
    const colon = part.lastIndexOf(":");
    const variant = colon === -1 ? null : part.slice(0, colon).trim();
    const gr = toGrosze(colon === -1 ? part : part.slice(colon + 1), where);
    if (gr === null) throw new Error(`${where}: brak ceny w „${part.trim()}”`);
    return { wariant: variant, gr };
  });
}

function read(file) {
  const result = { menu: null, dostawa: null, info: {}, ostrzezenia: [] };
  let block = result.info;
  let section = null;
  readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((raw, i) => {
      const line = raw.trim();
      const where = `${basename(file)}:${i + 1}`;
      if (!line || /^#(?!#)/.test(line)) return;

      if (line === "== MENU ==") {
        result.menu = { info: {}, sekcje: [], pozycje: [] };
        block = result.menu.info;
        return;
      }
      if (line === "== DOSTAWA ==") {
        result.dostawa = { info: {}, strefy: [] };
        block = result.dostawa.info;
        return;
      }
      const key = /^(źródło|sprawdzono|uwagi):\s*(.+)$/.exec(line);
      if (key) {
        block[KEYS[key[1]]] = key[2].trim();
        return;
      }

      if (result.menu && block === result.menu.info) {
        if (line.startsWith("## ")) {
          const [nazwa, opis] = line.slice(3).split("|").map((s) => s.trim());
          section = nazwa;
          result.menu.sekcje.push({ nazwa, opis: opis || null });
          return;
        }
        if (!section) throw new Error(`${where}: pozycja menu przed pierwszą sekcją (## Nazwa)`);
        const [nazwa, opis = "", cena = "", cechy = ""] = line.split("|").map((s) => s.trim());
        const featureList = cechy ? cechy.split(",").map((c) => c.trim()) : [];
        for (const c of featureList) if (!FEATURES.has(c)) throw new Error(`${where}: nieznana cecha „${c}”`);
        result.menu.pozycje.push({ sekcja: section, nazwa, opis: opis || null, ceny: prices(cena, where), cechy: featureList });
        return;
      }

      if (result.dostawa && block === result.dostawa.info) {
        const [strefa, cena = "", minimum = ""] = line.split("|").map((s) => s.trim());
        const [nazwa, lista] = strefa.split("=").map((s) => s.trim());
        const places = lista
          ? lista.split(",").map((m) => m.trim())
          : knownPlaces.has(nazwa)
            ? [nazwa]
            : [];
        for (const m of places) {
          if (!knownPlaces.has(m)) result.ostrzezenia.push(`${where}: miejscowości „${m}” nie ma w bazie`);
        }
        if (!places.length) result.ostrzezenia.push(`${where}: strefa „${nazwa}” bez miejscowości z bazy`);
        result.dostawa.strefy.push({ nazwa, miejsca: places, cena: toGrosze(cena, where), min: toGrosze(minimum, where) });
        return;
      }
      throw new Error(`${where}: nie wiem, co to za linia (brak == MENU == albo == DOSTAWA ==?)`);
    });
  return result;
}

const selectedOne = process.argv[2];
// A menu changed by the venue in the panel beats the file — we overwrite it only when explicitly asked.
const force = process.argv.includes("--wymus");
const files = readdirSync(CATALOG)
  .filter((p) => p.endsWith(".txt"))
  .filter((p) => !selectedOne || selectedOne.startsWith("--") || p === `${selectedOne}.txt`);
if (!files.length) {
  console.error(selectedOne ? `Nie ma pliku ${CATALOG}/${selectedOne}.txt` : `Brak plików w ${CATALOG}/`);
  process.exit(1);
}

const venueBySlug = db.prepare("SELECT id, nazwa FROM lokale WHERE slug = ?");
const queries = {
  usunMenu: db.prepare("DELETE FROM menu WHERE lokal_id = ?"),
  usunSekcje: db.prepare("DELETE FROM menu_sekcje WHERE lokal_id = ?"),
  usunStrefy: db.prepare("DELETE FROM strefy_dostawy WHERE lokal_id = ?"),
  sekcja: db.prepare("INSERT INTO menu_sekcje (lokal_id, nazwa, opis, kolejnosc) VALUES (?, ?, ?, ?)"),
  pozycja: db.prepare(
    `INSERT INTO menu (lokal_id, sekcja, nazwa, opis, ceny, cechy, kolejnosc, szukaj)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ),
  strefa: db.prepare(
    "INSERT INTO strefy_dostawy (lokal_id, nazwa, miejsca, cena_gr, min_gr, kolejnosc) VALUES (?, ?, ?, ?, ?, ?)",
  ),
  infoMenu: db.prepare("UPDATE lokale SET menu_zrodlo = ?, menu_sprawdzono = ? WHERE id = ?"),
  infoDostawy: db.prepare(
    "UPDATE lokale SET dostawa_zrodlo = ?, dostawa_sprawdzono = ?, dostawa_uwagi = ? WHERE id = ?",
  ),
};

let errors = 0;
for (const file of files) {
  const slug = basename(file, ".txt");
  const venue = venueBySlug.get(slug);
  if (!venue) {
    console.error(`✗ ${file}: nie ma lokalu o slugu „${slug}”`);
    errors++;
    continue;
  }
  let date;
  try {
    date = read(join(CATALOG, file));
  } catch (error) {
    console.error(`✗ ${error.message}`);
    errors++;
    continue;
  }

  // menus and zones the venue edits in the panel stay (unless --wymus)
  const sources = db.prepare("SELECT menu_zrodlo, dostawa_zrodlo FROM lokale WHERE id = ?").get(venue.id);
  for (const [blok, zrodlo] of [["menu", sources.menu_zrodlo], ["dostawa", sources.dostawa_zrodlo]]) {
    if (date[blok] && zrodlo === "panel" && !force) {
      console.error(`! ${venue.nazwa}: ${blok} zmienia lokal w panelu — pomijam (nadpisanie: npm run menu -- ${slug} --wymus)`);
      date[blok] = null;
    }
  }

  db.exec("BEGIN");
  try {
    if (date.menu) {
      queries.usunMenu.run(venue.id);
      queries.usunSekcje.run(venue.id);
      date.menu.sekcje.forEach((s, i) => queries.sekcja.run(venue.id, s.nazwa, s.opis, i));
      date.menu.pozycje.forEach((p, i) =>
        queries.pozycja.run(
          venue.id,
          p.sekcja,
          p.nazwa,
          p.opis,
          JSON.stringify(p.ceny),
          JSON.stringify(p.cechy),
          i,
          // plain words separated by spaces — search matches word beginnings („lody” ≠ „młody”)
          stripPolish([p.nazwa, p.opis ?? "", p.sekcja].join(" ")).replace(/[^a-z0-9]+/g, " ").trim(),
        ),
      );
      const info = { ...date.info, ...date.menu.info };
      queries.infoMenu.run(info.zrodlo ?? null, info.sprawdzono ?? null, venue.id);
    }
    if (date.dostawa) {
      queries.usunStrefy.run(venue.id);
      date.dostawa.strefy.forEach((s, i) =>
        queries.strefa.run(venue.id, s.nazwa, JSON.stringify(s.miejsca), s.cena, s.min, i),
      );
      const { zrodlo = null, sprawdzono = null, uwagi = null } = date.dostawa.info;
      queries.infoDostawy.run(zrodlo, sprawdzono, uwagi, venue.id);
    }
    db.exec("COMMIT");
  } catch (failure) {
    db.exec("ROLLBACK");
    throw failure;
  }

  const parts = [
    date.menu && `${date.menu.pozycje.length} pozycji menu w ${date.menu.sekcje.length} sekcjach`,
    date.dostawa && `${date.dostawa.strefy.length} stref dostawy`,
  ].filter(Boolean);
  console.log(`✓ ${venue.nazwa}: ${parts.join(", ") || "nic do wczytania"}`);
  for (const o of date.ostrzezenia) console.log(`  ! ${o}`);
}
console.log(errors ? `Błędy: ${errors}.` : "Strona pokaże zmiany w ciągu ok. minuty.");
process.exit(errors ? 1 : 0);
