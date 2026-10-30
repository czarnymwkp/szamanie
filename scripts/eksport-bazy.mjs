// Zapisuje katalog z lokalnej bazy do dane/baza-startowa.json (dane startowe w repozytorium, patrz
// src/lib/db/dane-startowe.mjs). Jeden wiersz tabeli = jedna linia pliku, więc zmiany dobrze widać w git diff.
// Użycie: npm run baza:eksport
import { writeFileSync } from "node:fs";
import { PLIK_DANYCH, TABELE_STARTOWE } from "../src/lib/db/dane-startowe.mjs";
import { openDatabase } from "../src/lib/db/otworz.mjs";

const db = openDatabase();
const { user_version: wersja } = db.prepare("PRAGMA user_version").get();

const czesci = TABELE_STARTOWE.map((nazwa) => {
  const kolumny = db.prepare(`PRAGMA table_info(${nazwa})`).all().map((k) => k.name);
  const wiersze = db.prepare(`SELECT * FROM ${nazwa} ORDER BY rowid`).all();
  console.log(`${nazwa.padEnd(15)} ${wiersze.length}`);
  const linie = wiersze.map((w) => `        ${JSON.stringify(kolumny.map((k) => w[k]))}`).join(",\n");
  return `    ${JSON.stringify(nazwa)}: {\n      "kolumny": ${JSON.stringify(kolumny)},\n      "wiersze": [\n${linie}\n      ]\n    }`;
});

writeFileSync(PLIK_DANYCH, `{\n  "wersja": ${wersja},\n  "tabele": {\n${czesci.join(",\n")}\n  }\n}\n`);
console.log(`Zapisano ${PLIK_DANYCH}`);
