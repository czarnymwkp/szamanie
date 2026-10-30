// Dane startowe z repozytorium (dane/baza-startowa.json): katalog lokali, menu, strefy dostawy, miejscowości,
// ręczne poprawki. Trafiają do bazy, gdy nie ma w niej żadnego lokalu — świeży serwer, CI, nowy komputer.
// Do bazy, w której lokale już są (serwer), dochodzą tylko lokale z pliku, których w niej brakuje.
// Bez kont, sesji, zgłoszeń, promocji i pakietów: repozytorium jest publiczne, a to dane z panelu i z umów.
// Plik odświeża `npm run baza:eksport` z lokalnej bazy.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const PLIK_DANYCH = "dane/baza-startowa.json";

// kolejność wstawiania: najpierw tabele, do których odwołują się klucze obce
export const TABELE_STARTOWE = ["miejscowosci", "lokale", "zdjecia", "poprawki", "menu_sekcje", "menu", "strefy_dostawy"];

// tabele z kolumną lokal_id: wiersze nowego lokalu idą na serwer razem z nim
const TABELE_LOKALU = ["zdjecia", "poprawki", "menu_sekcje", "menu", "strefy_dostawy"];

/**
 * Wstawia dane startowe do pustej bazy, a do bazy z lokalami dopisuje lokale z pliku, których w niej brakuje.
 * Zwraca liczbę wstawionych lokali (0, gdy nic nie doszło albo nie ma pliku).
 */
export function wczytajDaneStartowe(db, sciezka = PLIK_DANYCH) {
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
    // sprawdzane dopiero z blokadą: inny proces (worker buildu) mógł wstawić dane przed nami
    const wstawione = db.prepare("SELECT 1 FROM lokale LIMIT 1").get()
      ? dosiejNoweLokale(db, tabele)
      : wstawWszystko(db, tabele);
    db.exec("COMMIT");
    if (wstawione) console.log(`Dane startowe: wstawiono ${wstawione} lokali z ${sciezka}`);
    return wstawione;
  } catch (blad) {
    db.exec("ROLLBACK");
    throw blad;
  }
}

function wstawWszystko(db, tabele) {
  for (const nazwa of TABELE_STARTOWE) {
    const tabela = tabele[nazwa];
    if (!tabela?.wiersze.length) continue;
    const wstaw = wstawiacz(db, nazwa, tabela.kolumny);
    for (const wiersz of tabela.wiersze) wstaw(wiersz);
  }
  return tabele.lokale?.wiersze.length ?? 0;
}

/**
 * Lokale z pliku, których nie ma w bazie (ani po slug, ani po osm_id), z ich zdjęciami, poprawkami, menu i strefami
 * dostawy, plus brakujące miejscowości. Istniejących lokali nie rusza, więc zmiany z panelu na serwerze zostają.
 * Tak lokal dodany lokalnie (npm run dodaj, import OSM) po `npm run baza:eksport` i wdrożeniu trafia też na serwer.
 */
function dosiejNoweLokale(db, tabele) {
  const lokale = tabele.lokale;
  if (!lokale?.wiersze.length) return 0;
  const kol = (nazwa) => lokale.kolumny.indexOf(nazwa);
  const [iId, iSlug, iOsm] = [kol("id"), kol("slug"), kol("osm_id")];
  const slugi = new Set(db.prepare("SELECT slug FROM lokale").all().map((w) => w.slug));
  const osmy = new Set(db.prepare("SELECT osm_id FROM lokale WHERE osm_id IS NOT NULL").all().map((w) => w.osm_id));
  const nowe = lokale.wiersze.filter((w) => !slugi.has(w[iSlug]) && !(w[iOsm] && osmy.has(w[iOsm])));
  if (!nowe.length) return 0;

  if (tabele.miejscowosci?.wiersze.length) {
    const wstaw = wstawiacz(db, "miejscowosci", tabele.miejscowosci.kolumny, { lubPomin: true });
    for (const wiersz of tabele.miejscowosci.wiersze) wstaw(wiersz);
  }

  // id z pliku, gdy na serwerze wolne; zajęte — nowe id i przepisanie lokal_id w tabelach lokalu
  const zId = wstawiacz(db, "lokale", lokale.kolumny);
  const bezId = wstawiacz(db, "lokale", lokale.kolumny, { bez: ["id"] });
  const zajete = db.prepare("SELECT 1 FROM lokale WHERE id = ?");
  const noweId = new Map();
  for (const wiersz of nowe) {
    const id = zajete.get(wiersz[iId]) ? Number(bezId(wiersz).lastInsertRowid) : (zId(wiersz), wiersz[iId]);
    noweId.set(wiersz[iId], id);
  }

  for (const nazwa of TABELE_LOKALU) {
    const tabela = tabele[nazwa];
    if (!tabela?.wiersze.length) continue;
    const iLokal = tabela.kolumny.indexOf("lokal_id");
    // własne id wierszy (menu, strefy, zdjęcia) nadaje baza, żeby nie zderzyć się z wierszami z panelu
    const wstaw = wstawiacz(db, nazwa, tabela.kolumny, { bez: ["id"] });
    for (const wiersz of tabela.wiersze) {
      if (noweId.has(wiersz[iLokal])) wstaw(wiersz, { lokal_id: noweId.get(wiersz[iLokal]) });
    }
  }
  return nowe.length;
}

/** INSERT z kolumnami z pliku, które są w tabeli (plik i baza mogą być z różnych wersji schematu). */
function wstawiacz(db, nazwa, kolumny, { bez = [], lubPomin = false } = {}) {
  const wBazie = new Set(db.prepare(`PRAGMA table_info(${nazwa})`).all().map((k) => k.name));
  const uzyte = kolumny.flatMap((k, i) => (wBazie.has(k) && !bez.includes(k) ? [i] : []));
  const zapytanie = db.prepare(
    `INSERT ${lubPomin ? "OR IGNORE " : ""}INTO ${nazwa} (${uzyte.map((i) => `"${kolumny[i]}"`).join(", ")}) ` +
      `VALUES (${uzyte.map(() => "?").join(", ")})`,
  );
  return (wiersz, zamiast = {}) =>
    zapytanie.run(...uzyte.map((i) => (kolumny[i] in zamiast ? zamiast[kolumny[i]] : wiersz[i])));
}
