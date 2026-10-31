// Writes the catalog from the local database to dane/baza-startowa.json (seed data in the repository, see src/lib/db/seed.mjs). One table row = one line of the file, so changes are easy to read in git diff.
// Usage: npm run seed:export
import { writeFileSync } from "node:fs";
import { SEED_FILE, SEED_TABLES } from "../src/lib/db/seed.mjs";
import { openDatabase } from "../src/lib/db/open.mjs";

const db = openDatabase();
const { user_version: wersja } = db.prepare("PRAGMA user_version").get();

const parts = SEED_TABLES.map((name) => {
  const columns = db.prepare(`PRAGMA table_info(${name})`).all().map((k) => k.name);
  const rows = db.prepare(`SELECT * FROM ${name} ORDER BY rowid`).all();
  console.log(`${name.padEnd(15)} ${rows.length}`);
  const lines = rows.map((w) => `        ${JSON.stringify(columns.map((k) => w[k]))}`).join(",\n");
  return `    ${JSON.stringify(name)}: {\n      "kolumny": ${JSON.stringify(columns)},\n      "wiersze": [\n${lines}\n      ]\n    }`;
});

writeFileSync(SEED_FILE, `{\n  "wersja": ${wersja},\n  "tabele": {\n${parts.join(",\n")}\n  }\n}\n`);
console.log(`Zapisano ${SEED_FILE}`);
