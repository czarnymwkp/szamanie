import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { loadSeedData } from "./seed.mjs";
import { MIGRATIONS, SCHEMA } from "./schema.mjs";

/**
 * Opens the SQLite database, creates missing tables and runs pending migrations. An empty database (no venues) is filled with seed data from the repository.
 * Path: the SZAMANIE_DB variable or data/szamanie.db relative to the project directory.
 * @returns {DatabaseSync}
 */
export function openDatabase(path = process.env.SZAMANIE_DB ?? "data/szamanie.db") {
  // turbopackIgnore: the database path is known only at runtime and must not be traced during the build
  const full = resolve(/* turbopackIgnore: true */ path);
  mkdirSync(dirname(full), { recursive: true });
  const db = new DatabaseSync(full);
  // busy_timeout first: switching a fresh copy of the database to WAL needs an exclusive lock, and during the build
  // several processes open the database at once — without waiting they get „database is locked”.
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
