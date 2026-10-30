// Dane startowe z repozytorium (dane/baza-startowa.json): katalog lokali, menu, strefy dostawy, miejscowości,
// ręczne poprawki. Trafiają do bazy, gdy nie ma w niej żadnego lokalu — świeży serwer, CI, nowy komputer.
// Do bazy, w której lokale już są (serwer), dochodzą lokale z pliku, których w niej brakuje, nowsze poprawki
// admina (`npm run popraw`) i ukrycie zamkniętych lokali. Zmian z panelu plik nie nadpisuje.
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
 * Wstawia dane startowe do pustej bazy, a bazę z lokalami uzupełnia z pliku (nowe lokale, poprawki, ukrycia).
 * Zwraca liczbę zmian (0, gdy nic nie doszło albo nie ma pliku).
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
    let opis;
    if (db.prepare("SELECT 1 FROM lokale LIMIT 1").get()) {
      const [lokale, poprawki, menu, ukryte] = [dosiejNoweLokale, uzupelnijPoprawki, zsynchronizujMenu, ukryjZamkniete].map(
        (f) => f(db, tabele),
      );
      opis = { "nowe lokale": lokale, poprawki, "pozycje menu i stref": menu, "ukryte lokale": ukryte };
    } else {
      opis = { lokale: wstawWszystko(db, tabele) };
    }
    db.exec("COMMIT");
    const zmiany = Object.values(opis).reduce((a, b) => a + b, 0);
    if (zmiany) {
      const lista = Object.entries(opis).filter(([, n]) => n).map(([co, n]) => `${co}: ${n}`);
      console.log(`Dane startowe z ${sciezka} — ${lista.join(", ")}`);
    }
    return zmiany;
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

/**
 * Poprawki admina z pliku (autor „admin”, czyli `npm run popraw`) dla lokali, które już są w bazie: brakująca
 * dochodzi, a starsza poprawka admina ustępuje nowszej z pliku. Poprawek z panelu (autor „konto:…”) plik nie
 * rusza — zmiana od lokalu wygrywa. Cofnięcie poprawki (`popraw … usun`) na serwer nie przechodzi.
 */
function uzupelnijPoprawki(db, tabele) {
  const { lokale, poprawki } = tabele;
  if (!poprawki?.wiersze.length || !lokale?.wiersze.length) return 0;
  const kol = (tabela, nazwa) => tabela.kolumny.indexOf(nazwa);
  const slugZPliku = new Map(lokale.wiersze.map((w) => [w[kol(lokale, "id")], w[kol(lokale, "slug")]]));
  const idWBazie = new Map(db.prepare("SELECT slug, id FROM lokale").all().map((w) => [w.slug, w.id]));
  const obecna = db.prepare("SELECT wartosc, autor, utworzono FROM poprawki WHERE lokal_id = ? AND pole = ?");
  const zapisz = db.prepare(
    `INSERT INTO poprawki (lokal_id, pole, wartosc, autor, utworzono) VALUES (?, ?, ?, 'admin', ?)
     ON CONFLICT(lokal_id, pole) DO UPDATE
       SET wartosc = excluded.wartosc, autor = 'admin', utworzono = excluded.utworzono`,
  );
  const [iLokal, iPole, iWartosc, iAutor, iKiedy] = ["lokal_id", "pole", "wartosc", "autor", "utworzono"].map((n) =>
    kol(poprawki, n),
  );
  let zmiany = 0;
  for (const w of poprawki.wiersze) {
    const id = idWBazie.get(slugZPliku.get(w[iLokal]));
    if (w[iAutor] !== "admin" || id === undefined) continue;
    const jest = obecna.get(id, w[iPole]);
    if (jest && (jest.autor !== "admin" || jest.wartosc === w[iWartosc] || jest.utworzono >= w[iKiedy])) continue;
    zapisz.run(id, w[iPole], w[iWartosc], w[iKiedy]);
    zmiany++;
  }
  return zmiany;
}

/**
 * Menu i strefy dostawy przepisane z kart lokali (dane/lokale/*.txt) są na serwerze takie jak w pliku: lokal bez menu
 * je dostaje, a menu inne niż w pliku (karta przepisana na nowo albo uzupełniona) zostaje zastąpione. Menu albo
 * dostawa prowadzone w panelu (źródło „panel”) i lokale, których menu w pliku nie ma, zostają nietknięte.
 */
const GRUPY_LOKALU = [
  { tabele: ["menu_sekcje", "menu"], zrodlo: "menu_zrodlo", pola: ["menu_zrodlo", "menu_sprawdzono"] },
  { tabele: ["strefy_dostawy"], zrodlo: "dostawa_zrodlo", pola: ["dostawa_zrodlo", "dostawa_sprawdzono", "dostawa_uwagi"] },
];

function zsynchronizujMenu(db, tabele) {
  // Tylko na serwerze (SZAMANIE_SERWER=1 w obrazie Dockera). Lokalnie to baza jest źródłem pliku: menu z `npm run menu`
  // musi dotrwać do `npm run baza:eksport`, a nie zostać cofnięte do starszej wersji z pliku przy otwarciu bazy.
  if (process.env.SZAMANIE_SERWER !== "1") return 0;
  const { lokale } = tabele;
  if (!lokale?.wiersze.length) return 0;
  const kol = (tabela, nazwa) => tabela.kolumny.indexOf(nazwa);
  const lokalWBazie = db.prepare("SELECT id, menu_zrodlo, dostawa_zrodlo FROM lokale WHERE slug = ?");

  // kolumny porównywane i przepisywane: z pliku i z bazy naraz, bez własnego id wiersza i lokal_id
  const kolumny = Object.fromEntries(
    GRUPY_LOKALU.flatMap((g) => g.tabele).map((nazwa) => {
      const wBazie = new Set(db.prepare(`PRAGMA table_info(${nazwa})`).all().map((k) => k.name));
      return [nazwa, (tabele[nazwa]?.kolumny ?? []).filter((k) => wBazie.has(k) && k !== "id" && k !== "lokal_id")];
    }),
  );
  const zPliku = (nazwa, idPliku) => {
    const t = tabele[nazwa];
    if (!t?.wiersze.length) return [];
    const iLokal = kol(t, "lokal_id");
    return t.wiersze.filter((w) => w[iLokal] === idPliku);
  };
  // odcisk: wiersze jako tekst, posortowane (kolejność trzyma kolumna „kolejnosc”)
  const odciskPliku = (nazwa, wiersze) =>
    wiersze.map((w) => JSON.stringify(kolumny[nazwa].map((k) => w[kol(tabele[nazwa], k)]))).sort();
  const odciskBazy = (nazwa, id) =>
    db
      .prepare(`SELECT ${kolumny[nazwa].map((k) => `"${k}"`).join(", ")} FROM ${nazwa} WHERE lokal_id = ?`)
      .all(id)
      .map((w) => JSON.stringify(kolumny[nazwa].map((k) => w[k])))
      .sort();

  let zmiany = 0;
  for (const wLokal of lokale.wiersze) {
    const lokal = lokalWBazie.get(wLokal[kol(lokale, "slug")]);
    if (!lokal) continue;
    for (const grupa of GRUPY_LOKALU) {
      if (lokal[grupa.zrodlo] === "panel") continue;
      const wiersze = Object.fromEntries(grupa.tabele.map((n) => [n, zPliku(n, wLokal[kol(lokale, "id")])]));
      if (!Object.values(wiersze).some((w) => w.length)) continue;
      const takieSame = grupa.tabele.every(
        (n) => JSON.stringify(odciskPliku(n, wiersze[n])) === JSON.stringify(odciskBazy(n, lokal.id)),
      );
      if (takieSame) continue;
      for (const n of grupa.tabele) {
        db.prepare(`DELETE FROM ${n} WHERE lokal_id = ?`).run(lokal.id);
        const wstaw = wstawiacz(db, n, tabele[n].kolumny, { bez: ["id"] });
        for (const w of wiersze[n]) wstaw(w, { lokal_id: lokal.id });
        zmiany += wiersze[n].length;
      }
      // skąd menu i kiedy sprawdzone (napis „Ceny sprawdzone …”)
      const pola = grupa.pola.filter((p) => kol(lokale, p) >= 0);
      db.prepare(`UPDATE lokale SET ${pola.map((p) => `${p} = ?`).join(", ")} WHERE id = ?`).run(
        ...pola.map((p) => wLokal[kol(lokale, p)]),
        lokal.id,
      );
    }
  }
  return zmiany;
}

/** Lokal ukryty w pliku (zamknięty) znika też z bazy. Odkrycie zostaje ręczne — panel nie ukrywa lokali. */
function ukryjZamkniete(db, tabele) {
  const lokale = tabele.lokale;
  if (!lokale?.wiersze.length) return 0;
  const [iSlug, iUkryty] = [lokale.kolumny.indexOf("slug"), lokale.kolumny.indexOf("ukryty")];
  const ukryj = db.prepare("UPDATE lokale SET ukryty = 1 WHERE slug = ? AND ukryty = 0");
  return lokale.wiersze.filter((w) => w[iUkryty]).reduce((n, w) => n + Number(ukryj.run(w[iSlug]).changes), 0);
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
