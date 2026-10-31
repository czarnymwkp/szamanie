import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { loadSeedData } from "./dane-startowe.mjs";
import { MIGRATIONS, SCHEMA } from "./schemat.mjs";

/**
 * Otwiera bazę SQLite, zakłada brakujące tabele i wykonuje zaległe migracje. Pustą bazę (bez lokali) wypełnia
 * danymi startowymi z repozytorium.
 * Ścieżka: zmienna SZAMANIE_DB albo data/szamanie.db względem katalogu projektu.
 * @returns {DatabaseSync}
 */
export function openDatabase(path = process.env.SZAMANIE_DB ?? "data/szamanie.db") {
  // turbopackIgnore: ścieżka bazy jest znana dopiero w czasie działania, nie wolno jej śledzić przy buildzie
  const full = resolve(/* turbopackIgnore: true */ path);
  mkdirSync(dirname(full), { recursive: true });
  const db = new DatabaseSync(full);
  // busy_timeout najpierw: przełączenie świeżej kopii bazy na WAL wymaga wyłącznej blokady, a przy buildzie
  // bazę otwiera naraz kilka procesów — bez czekania dostają „database is locked”.
  db.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);

  const { user_version: wersja } = db.prepare("PRAGMA user_version").get();
  for (let i = wersja; i < MIGRATIONS.length; i++) {
    db.exec("BEGIN");
    try {
      db.exec(MIGRATIONS[i]);
      db.exec(`PRAGMA user_version = ${i + 1}`);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  loadSeedData(db);
  return db;
}
