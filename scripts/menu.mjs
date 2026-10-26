// Wczytuje menu z cenami i strefy dostawy z plików dane/lokale/<slug>.txt do bazy (dopóki lokale nie mają panelu).
// Plik zastępuje w całości menu (blok == MENU ==) i strefy dostawy (blok == DOSTAWA ==) danego lokalu;
// bloku, którego w pliku nie ma, nie ruszamy.
// Użycie: npm run menu                 wszystkie pliki
//         npm run menu -- si-krasnik   jeden lokal
//         npm run menu -- si-krasnik --wymus   także gdy lokal zmienia menu w panelu (nadpisze jego zmiany)
//
// Format pliku (puste linie i linie od „# ” są pomijane):
//   źródło: https://…               skąd jest menu (adres strony, „zdjęcie karty”, „telefon”)
//   sprawdzono: 2026-10-25          kiedy ceny były aktualne
//   == DOSTAWA ==
//   źródło: … / sprawdzono: … / uwagi: …
//   Nazwa strefy [= Miejscowość, Miejscowość] | cena zł („?” = nie podają) | minimalne zamówienie zł
//   == MENU ==
//   ## Sekcja [| opis sekcji]
//   Nazwa | opis | cena („27”, „29,90” albo „32 cm: 27; 45 cm: 37”) | cechy: wege, ostre, polecane, sezonowe
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { otworzBaze } from "../src/lib/db/otworz.mjs";
import { bezPolskich } from "../src/lib/slug.mjs";

const KATALOG = "dane/lokale";
const CECHY = new Set(["wege", "ostre", "polecane", "sezonowe"]);
const KLUCZE = { źródło: "zrodlo", sprawdzono: "sprawdzono", uwagi: "uwagi" };

const db = otworzBaze();
const znaneMiejsca = new Set(db.prepare("SELECT nazwa FROM miejscowosci").all().map((m) => m.nazwa));

/** „29,90” → 2990 groszy; pusty tekst albo „?” → null. */
function grosze(tekst, gdzie) {
  const t = tekst.replace(/zł/g, "").trim();
  if (!t || t === "?") return null;
  const liczba = Number(t.replace(",", "."));
  if (!Number.isFinite(liczba) || liczba < 0) throw new Error(`${gdzie}: zła cena „${tekst}”`);
  return Math.round(liczba * 100);
}

function ceny(tekst, gdzie) {
  if (!tekst.trim()) return [];
  return tekst.split(";").map((czesc) => {
    const dwukropek = czesc.lastIndexOf(":");
    const wariant = dwukropek === -1 ? null : czesc.slice(0, dwukropek).trim();
    const gr = grosze(dwukropek === -1 ? czesc : czesc.slice(dwukropek + 1), gdzie);
    if (gr === null) throw new Error(`${gdzie}: brak ceny w „${czesc.trim()}”`);
    return { wariant, gr };
  });
}

function czytaj(plik) {
  const wynik = { menu: null, dostawa: null, info: {}, ostrzezenia: [] };
  let blok = wynik.info;
  let sekcja = null;
  readFileSync(plik, "utf8")
    .split(/\r?\n/)
    .forEach((surowa, i) => {
      const linia = surowa.trim();
      const gdzie = `${basename(plik)}:${i + 1}`;
      if (!linia || /^#(?!#)/.test(linia)) return;

      if (linia === "== MENU ==") {
        wynik.menu = { info: {}, sekcje: [], pozycje: [] };
        blok = wynik.menu.info;
        return;
      }
      if (linia === "== DOSTAWA ==") {
        wynik.dostawa = { info: {}, strefy: [] };
        blok = wynik.dostawa.info;
        return;
      }
      const klucz = /^(źródło|sprawdzono|uwagi):\s*(.+)$/.exec(linia);
      if (klucz) {
        blok[KLUCZE[klucz[1]]] = klucz[2].trim();
        return;
      }

      if (wynik.menu && blok === wynik.menu.info) {
        if (linia.startsWith("## ")) {
          const [nazwa, opis] = linia.slice(3).split("|").map((s) => s.trim());
          sekcja = nazwa;
          wynik.menu.sekcje.push({ nazwa, opis: opis || null });
          return;
        }
        if (!sekcja) throw new Error(`${gdzie}: pozycja menu przed pierwszą sekcją (## Nazwa)`);
        const [nazwa, opis = "", cena = "", cechy = ""] = linia.split("|").map((s) => s.trim());
        const listaCech = cechy ? cechy.split(",").map((c) => c.trim()) : [];
        for (const c of listaCech) if (!CECHY.has(c)) throw new Error(`${gdzie}: nieznana cecha „${c}”`);
        wynik.menu.pozycje.push({ sekcja, nazwa, opis: opis || null, ceny: ceny(cena, gdzie), cechy: listaCech });
        return;
      }

      if (wynik.dostawa && blok === wynik.dostawa.info) {
        const [strefa, cena = "", minimum = ""] = linia.split("|").map((s) => s.trim());
        const [nazwa, lista] = strefa.split("=").map((s) => s.trim());
        const miejsca = lista
          ? lista.split(",").map((m) => m.trim())
          : znaneMiejsca.has(nazwa)
            ? [nazwa]
            : [];
        for (const m of miejsca) {
          if (!znaneMiejsca.has(m)) wynik.ostrzezenia.push(`${gdzie}: miejscowości „${m}” nie ma w bazie`);
        }
        if (!miejsca.length) wynik.ostrzezenia.push(`${gdzie}: strefa „${nazwa}” bez miejscowości z bazy`);
        wynik.dostawa.strefy.push({ nazwa, miejsca, cena: grosze(cena, gdzie), min: grosze(minimum, gdzie) });
        return;
      }
      throw new Error(`${gdzie}: nie wiem, co to za linia (brak == MENU == albo == DOSTAWA ==?)`);
    });
  return wynik;
}

const wybrany = process.argv[2];
// Menu zmienione przez lokal w panelu jest ważniejsze niż plik — nadpisujemy je tylko na wyraźne życzenie.
const wymus = process.argv.includes("--wymus");
const pliki = readdirSync(KATALOG)
  .filter((p) => p.endsWith(".txt"))
  .filter((p) => !wybrany || wybrany.startsWith("--") || p === `${wybrany}.txt`);
if (!pliki.length) {
  console.error(wybrany ? `Nie ma pliku ${KATALOG}/${wybrany}.txt` : `Brak plików w ${KATALOG}/`);
  process.exit(1);
}

const lokalPoSlugu = db.prepare("SELECT id, nazwa FROM lokale WHERE slug = ?");
const zapytania = {
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

let bledy = 0;
for (const plik of pliki) {
  const slug = basename(plik, ".txt");
  const lokal = lokalPoSlugu.get(slug);
  if (!lokal) {
    console.error(`✗ ${plik}: nie ma lokalu o slugu „${slug}”`);
    bledy++;
    continue;
  }
  let dane;
  try {
    dane = czytaj(join(KATALOG, plik));
  } catch (blad) {
    console.error(`✗ ${blad.message}`);
    bledy++;
    continue;
  }

  const zPanelu = db.prepare("SELECT menu_zrodlo FROM lokale WHERE id = ?").get(lokal.id).menu_zrodlo === "panel";
  if (dane.menu && zPanelu && !wymus) {
    console.error(`✗ ${lokal.nazwa}: menu edytuje lokal w panelu — pomijam (nadpisanie: npm run menu -- ${slug} --wymus)`);
    bledy++;
    continue;
  }

  db.exec("BEGIN");
  try {
    if (dane.menu) {
      zapytania.usunMenu.run(lokal.id);
      zapytania.usunSekcje.run(lokal.id);
      dane.menu.sekcje.forEach((s, i) => zapytania.sekcja.run(lokal.id, s.nazwa, s.opis, i));
      dane.menu.pozycje.forEach((p, i) =>
        zapytania.pozycja.run(
          lokal.id,
          p.sekcja,
          p.nazwa,
          p.opis,
          JSON.stringify(p.ceny),
          JSON.stringify(p.cechy),
          i,
          // same słowa oddzielone spacją — wyszukiwarka dopasowuje początki słów („lody” ≠ „młody”)
          bezPolskich([p.nazwa, p.opis ?? "", p.sekcja].join(" ")).replace(/[^a-z0-9]+/g, " ").trim(),
        ),
      );
      const info = { ...dane.info, ...dane.menu.info };
      zapytania.infoMenu.run(info.zrodlo ?? null, info.sprawdzono ?? null, lokal.id);
    }
    if (dane.dostawa) {
      zapytania.usunStrefy.run(lokal.id);
      dane.dostawa.strefy.forEach((s, i) =>
        zapytania.strefa.run(lokal.id, s.nazwa, JSON.stringify(s.miejsca), s.cena, s.min, i),
      );
      const { zrodlo = null, sprawdzono = null, uwagi = null } = dane.dostawa.info;
      zapytania.infoDostawy.run(zrodlo, sprawdzono, uwagi, lokal.id);
    }
    db.exec("COMMIT");
  } catch (blad) {
    db.exec("ROLLBACK");
    throw blad;
  }

  const czesci = [
    dane.menu && `${dane.menu.pozycje.length} pozycji menu w ${dane.menu.sekcje.length} sekcjach`,
    dane.dostawa && `${dane.dostawa.strefy.length} stref dostawy`,
  ].filter(Boolean);
  console.log(`✓ ${lokal.nazwa}: ${czesci.join(", ") || "nic do wczytania"}`);
  for (const o of dane.ostrzezenia) console.log(`  ! ${o}`);
}
console.log(bledy ? `Błędy: ${bledy}.` : "Strona pokaże zmiany w ciągu ok. minuty.");
process.exit(bledy ? 1 : 0);
