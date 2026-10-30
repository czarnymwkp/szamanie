// Dane startowe z repozytorium (dane/baza-startowa.json): katalog lokali, menu, strefy dostawy, miejscowości,
// ręczne poprawki. Trafiają do bazy, gdy nie ma w niej żadnego lokalu — świeży serwer, CI, nowy komputer.
// Bez kont, sesji, zgłoszeń, promocji i pakietów: repozytorium jest publiczne, a to dane z panelu i z umów.
// Plik odświeża `npm run baza:eksport` z lokalnej bazy.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const PLIK_DANYCH = "dane/baza-startowa.json";

// kolejność wstawiania: najpierw tabele, do których odwołują się klucze obce
export const TABELE_STARTOWE = ["miejscowosci", "lokale", "zdjecia", "poprawki", "menu_sekcje", "menu", "strefy_dostawy"];

/** Wstawia dane startowe do pustej bazy. Zwraca liczbę lokali albo 0, gdy w bazie już są lokale lub brak pliku. */
export function wczytajDaneStartowe(db, sciezka = PLIK_DANYCH) {
  if (db.prepare("SELECT 1 FROM lokale LIMIT 1").get()) return 0;
  let plik;
  try {
    // turbopackIgnore: plik czytany w czasie działania (w obrazie Dockera leży w /app/dane), nie przy buildzie
    plik = readFileSync(resolve(/* turbopackIgnore: true */ sciezka), "utf8");
  } catch {
    return 0;
  }
  const { tabele } = JSON.parse(plik);

  db.exec("BEGIN IMMEDIATE");
  try {
    // inny proces (worker buildu) mógł wstawić dane, zanim dostaliśmy blokadę
    if (db.prepare("SELECT 1 FROM lokale LIMIT 1").get()) {
      db.exec("ROLLBACK");
      return 0;
    }
    for (const nazwa of TABELE_STARTOWE) {
      const tabela = tabele[nazwa];
      if (!tabela?.wiersze.length) continue;
      const kolumny = tabela.kolumny.map((k) => `"${k}"`).join(", ");
      const wstaw = db.prepare(`INSERT INTO ${nazwa} (${kolumny}) VALUES (${tabela.kolumny.map(() => "?").join(", ")})`);
      for (const wiersz of tabela.wiersze) wstaw.run(...wiersz);
    }
    db.exec("COMMIT");
  } catch (blad) {
    db.exec("ROLLBACK");
    throw blad;
  }
  return tabele.lokale?.wiersze.length ?? 0;
}
