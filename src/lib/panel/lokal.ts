import "server-only";
import { db } from "../db";
import type { CechaDania } from "../menu";
import { bezPolskich } from "../slug.mjs";

// Odczyt i zapis danych lokalu z panelu właściciela. Dane lokalu idą do tabeli poprawki (jak `npm run popraw`),
// więc import z OSM ich nie nadpisuje; menu i promocje mają własne tabele. Uprawnienia sprawdza wywołujący.

// ——— Dane lokalu ———

export const POLA_TEKSTOWE = ["nazwa", "telefon", "email", "www", "facebook", "instagram", "opis", "godziny"] as const;
export const POLA_TAK_NIE = ["dostawa", "na_wynos", "zwierzeta", "wozek", "wege", "wegan"] as const;

type PoleTekstowe = (typeof POLA_TEKSTOWE)[number];
type PoleTakNie = (typeof POLA_TAK_NIE)[number];
export type DaneLokalu = Record<PoleTekstowe, string | null> & Record<PoleTakNie, boolean>;

export const DLUGOSCI: Record<PoleTekstowe, number> = {
  nazwa: 80,
  telefon: 40,
  email: 120,
  www: 200,
  facebook: 200,
  instagram: 200,
  opis: 600,
  godziny: 300,
};

type Wiersz = Record<PoleTekstowe, string | null> & { dostawa: number; na_wynos: number; cechy: string };

function poprawkiLokalu(lokalId: number) {
  const wynik: Record<string, unknown> = {};
  for (const p of db.prepare("SELECT pole, wartosc FROM poprawki WHERE lokal_id = ?").all(lokalId) as {
    pole: string;
    wartosc: string;
  }[]) {
    wynik[p.pole] = JSON.parse(p.wartosc);
  }
  return wynik;
}

/** Aktualne dane lokalu tak, jak widzi je strona: z bazy (OSM) z nałożonymi poprawkami. */
export function daneLokalu(lokalId: number): DaneLokalu {
  const w = db
    .prepare(
      `SELECT nazwa, telefon, email, www, facebook, instagram, opis, godziny, dostawa, na_wynos, cechy
       FROM lokale WHERE id = ?`,
    )
    .get(lokalId) as Wiersz;
  const cechy = JSON.parse(w.cechy) as Record<string, unknown>;
  const p = poprawkiLokalu(lokalId);
  const dane = {} as DaneLokalu;
  for (const pole of POLA_TEKSTOWE) dane[pole] = (pole in p ? p[pole] : w[pole]) as string | null;
  dane.dostawa = "dostawa" in p ? !!p.dostawa : w.dostawa === 1;
  dane.na_wynos = "na_wynos" in p ? !!p.na_wynos : w.na_wynos === 1;
  for (const pole of ["zwierzeta", "wozek", "wege", "wegan"] as const) {
    dane[pole] = pole in p ? !!p[pole] : !!cechy[pole];
  }
  return dane;
}

/** Zapisuje jako poprawki tylko pola, które się zmieniły. Pusty tekst = usunięcie (np. nieaktualnej strony www). */
export function zapiszDaneLokalu(lokalId: number, nowe: DaneLokalu, autor: string) {
  const obecne = daneLokalu(lokalId);
  const zapisz = db.prepare(
    `INSERT INTO poprawki (lokal_id, pole, wartosc, autor) VALUES (?, ?, ?, ?)
     ON CONFLICT(lokal_id, pole) DO UPDATE SET wartosc = excluded.wartosc, autor = excluded.autor,
       utworzono = datetime('now')`,
  );
  let zmian = 0;
  db.exec("BEGIN");
  try {
    for (const pole of [...POLA_TEKSTOWE, ...POLA_TAK_NIE]) {
      if (nowe[pole] === obecne[pole]) continue;
      zapisz.run(lokalId, pole, JSON.stringify(nowe[pole]), autor);
      zmian++;
    }
    db.exec("COMMIT");
  } catch (blad) {
    db.exec("ROLLBACK");
    throw blad;
  }
  return zmian;
}

// ——— Menu ———

export const CECHY_DAN: CechaDania[] = ["wege", "ostre", "polecane", "sezonowe"];

/** Menu w postaci dla edytora: ceny jako tekst („27,50”), żeby pole formularza pokazywało to, co wpisał lokal. */
export type CenaEdycja = { wariant: string; cena: string };
export type DanieEdycja = { id: number | null; nazwa: string; opis: string; ceny: CenaEdycja[]; cechy: CechaDania[] };
export type SekcjaEdycja = { nazwa: string; opis: string; dania: DanieEdycja[] };

const naTekst = (gr: number) => (gr % 100 ? (gr / 100).toFixed(2).replace(".", ",") : String(gr / 100));

export function menuDoEdycji(lokalId: number): SekcjaEdycja[] {
  const sekcje = (
    db.prepare("SELECT nazwa, opis FROM menu_sekcje WHERE lokal_id = ? ORDER BY kolejnosc").all(lokalId) as {
      nazwa: string;
      opis: string | null;
    }[]
  ).map((s): SekcjaEdycja => ({ nazwa: s.nazwa, opis: s.opis ?? "", dania: [] }));
  const poNazwie = new Map(sekcje.map((s) => [s.nazwa, s]));
  for (const d of db
    .prepare("SELECT id, sekcja, nazwa, opis, ceny, cechy FROM menu WHERE lokal_id = ? ORDER BY kolejnosc")
    .all(lokalId) as { id: number; sekcja: string; nazwa: string; opis: string | null; ceny: string; cechy: string }[]) {
    let sekcja = poNazwie.get(d.sekcja);
    if (!sekcja) {
      sekcja = { nazwa: d.sekcja, opis: "", dania: [] };
      sekcje.push(sekcja);
      poNazwie.set(d.sekcja, sekcja);
    }
    sekcja.dania.push({
      id: d.id,
      nazwa: d.nazwa,
      opis: d.opis ?? "",
      ceny: (JSON.parse(d.ceny) as { wariant: string | null; gr: number }[]).map((c) => ({
        wariant: c.wariant ?? "",
        cena: naTekst(c.gr),
      })),
      cechy: JSON.parse(d.cechy),
    });
  }
  return sekcje;
}

/** „29,90” albo „29.90 zł” → 2990 groszy; null, gdy to nie jest cena. */
export function grosze(tekst: string): number | null {
  const t = tekst.replace(/zł/gi, "").replace(/\s/g, "").replace(",", ".");
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(Number(t) * 100);
}

export const LIMITY_MENU = { sekcji: 60, dan: 600, cen: 6, nazwa: 120, opis: 500, sekcja: 80, wariant: 40 };

type Cena = { wariant: string | null; gr: number };
type DanieDoZapisu = { id: number | null; nazwa: string; opis: string | null; ceny: Cena[]; cechy: CechaDania[] };
type SekcjaDoZapisu = { nazwa: string; opis: string | null; dania: DanieDoZapisu[] };

const tekst = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Sprawdza menu z edytora (dane z przeglądarki — nie ufamy im) i zamienia ceny na grosze. */
export function sprawdzMenu(dane: unknown): { menu: SekcjaDoZapisu[] } | { blad: string } {
  if (!Array.isArray(dane)) return { blad: "Nieprawidłowe dane menu." };
  if (dane.length > LIMITY_MENU.sekcji) return { blad: `Najwyżej ${LIMITY_MENU.sekcji} działów.` };
  const nazwySekcji = new Set<string>();
  const menu: SekcjaDoZapisu[] = [];
  let dan = 0;
  for (const s of dane as Record<string, unknown>[]) {
    const nazwa = tekst(s?.nazwa, LIMITY_MENU.sekcja);
    if (!nazwa) return { blad: "Każdy dział musi mieć nazwę." };
    const klucz = nazwa.toLowerCase();
    if (nazwySekcji.has(klucz)) return { blad: `Dwa działy nazywają się „${nazwa}”. Zmień nazwę jednego z nich.` };
    nazwySekcji.add(klucz);
    if (!Array.isArray(s.dania)) return { blad: "Nieprawidłowe dane menu." };
    const dania: DanieDoZapisu[] = [];
    for (const d of s.dania as Record<string, unknown>[]) {
      const nazwaDania = tekst(d?.nazwa, LIMITY_MENU.nazwa);
      if (!nazwaDania) return { blad: `W dziale „${nazwa}” jest danie bez nazwy.` };
      if (!Array.isArray(d.ceny) || d.ceny.length > LIMITY_MENU.cen) return { blad: `„${nazwaDania}”: za dużo cen.` };
      const ceny: Cena[] = [];
      for (const c of d.ceny as Record<string, unknown>[]) {
        const cena = tekst(c?.cena, 20);
        const wariant = tekst(c?.wariant, LIMITY_MENU.wariant) || null;
        if (!cena && !wariant) continue;
        const gr = grosze(cena);
        if (gr === null) return { blad: `„${nazwaDania}”: cena „${cena}” nie wygląda na kwotę (np. 27 albo 27,50).` };
        ceny.push({ wariant, gr });
      }
      if (ceny.length > 1 && ceny.some((c) => !c.wariant)) {
        return { blad: `„${nazwaDania}”: przy kilku cenach podaj wariant każdej (np. 32 cm, 45 cm).` };
      }
      const cechy = Array.isArray(d.cechy) ? CECHY_DAN.filter((c) => (d.cechy as unknown[]).includes(c)) : [];
      const id = typeof d.id === "number" && Number.isInteger(d.id) ? d.id : null;
      dania.push({ id, nazwa: nazwaDania, opis: tekst(d.opis, LIMITY_MENU.opis) || null, ceny, cechy });
      if (++dan > LIMITY_MENU.dan) return { blad: `Najwyżej ${LIMITY_MENU.dan} dań.` };
    }
    menu.push({ nazwa, opis: tekst(s.opis, 200) || null, dania });
  }
  return { menu };
}

/** Tak jak scripts/menu.mjs: same słowa bez polskich znaków — wyszukiwarka dopasowuje początki słów. */
const doSzukania = (...czesci: (string | null)[]) =>
  bezPolskich(czesci.filter(Boolean).join(" ")).replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Zapisuje całe menu lokalu. Dania z id zostają tymi samymi wierszami (lista zamówienia klienta ich nie gubi),
 * nowe dostają wiersze, usunięte znikają. Każda zmiana ceny trafia do historii cen.
 */
export function zapiszMenuLokalu(lokalId: number, menu: SekcjaDoZapisu[]) {
  const stare = new Map(
    (
      db.prepare("SELECT id, nazwa, ceny FROM menu WHERE lokal_id = ?").all(lokalId) as {
        id: number;
        nazwa: string;
        ceny: string;
      }[]
    ).map((d) => [d.id, { ...d }]),
  );
  const { menu_sprawdzono: sprawdzono } = db.prepare("SELECT menu_sprawdzono FROM lokale WHERE id = ?").get(lokalId) as {
    menu_sprawdzono: string | null;
  };
  const maHistorie = db.prepare("SELECT 1 FROM historia_cen WHERE lokal_id = ? AND nazwa = ? LIMIT 1");
  const historia = db.prepare("INSERT INTO historia_cen (lokal_id, sekcja, nazwa, ceny, od) VALUES (?, ?, ?, ?, ?)");
  const zmien = db.prepare(
    `UPDATE menu SET sekcja = ?, nazwa = ?, opis = ?, ceny = ?, cechy = ?, kolejnosc = ?, szukaj = ?
     WHERE id = ? AND lokal_id = ?`,
  );
  const dodaj = db.prepare(
    `INSERT INTO menu (lokal_id, sekcja, nazwa, opis, ceny, cechy, kolejnosc, szukaj) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const teraz = new Date().toISOString();

  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM menu_sekcje WHERE lokal_id = ?").run(lokalId);
    const zostaja = new Set<number>();
    let kolejnosc = 0;
    menu.forEach((s, i) => {
      db.prepare("INSERT INTO menu_sekcje (lokal_id, nazwa, opis, kolejnosc) VALUES (?, ?, ?, ?)").run(
        lokalId,
        s.nazwa,
        s.opis,
        i,
      );
      for (const d of s.dania) {
        const ceny = JSON.stringify(d.ceny);
        const pola = [s.nazwa, d.nazwa, d.opis, ceny, JSON.stringify(d.cechy), kolejnosc++, doSzukania(d.nazwa, d.opis, s.nazwa)] as const;
        const stary = d.id !== null ? stare.get(d.id) : undefined;
        if (stary && !zostaja.has(stary.id)) {
          zmien.run(...pola, stary.id, lokalId);
          zostaja.add(stary.id);
        } else {
          dodaj.run(lokalId, ...pola);
        }
        if (stary?.ceny === ceny) continue;
        // pierwsza zmiana ceny dania: zapisujemy też cenę sprzed zmiany, od kiedy menu było sprawdzone
        if (stary && !maHistorie.get(lokalId, stary.nazwa)) {
          historia.run(lokalId, s.nazwa, stary.nazwa, stary.ceny, sprawdzono ?? teraz.slice(0, 10));
        }
        historia.run(lokalId, s.nazwa, d.nazwa, ceny, teraz);
      }
    });
    for (const id of stare.keys()) {
      if (!zostaja.has(id)) db.prepare("DELETE FROM menu WHERE id = ? AND lokal_id = ?").run(id, lokalId);
    }
    db.prepare("UPDATE lokale SET menu_zrodlo = 'panel', menu_sprawdzono = date('now', 'localtime') WHERE id = ?").run(
      lokalId,
    );
    db.exec("COMMIT");
  } catch (blad) {
    db.exec("ROLLBACK");
    throw blad;
  }
}

// ——— Promocje ———

export type PromocjaEdycja = {
  id: number;
  tytul: string;
  opis: string | null;
  danie: string | null;
  wariant: string | null;
  cenaGr: number | null;
  odDnia: string | null;
  doDnia: string | null;
  dni: number[];
  odGodz: string | null;
  doGodz: string | null;
  aktywna: boolean;
};

type WierszPromocji = Omit<PromocjaEdycja, "cenaGr" | "odDnia" | "doDnia" | "dni" | "odGodz" | "doGodz" | "aktywna"> & {
  cena_gr: number | null;
  od_dnia: string | null;
  do_dnia: string | null;
  dni: string;
  od_godz: string | null;
  do_godz: string | null;
  aktywna: number;
};

export function promocjeDoEdycji(lokalId: number): PromocjaEdycja[] {
  return (
    db
      .prepare(
        `SELECT id, tytul, opis, danie, wariant, cena_gr, od_dnia, do_dnia, dni, od_godz, do_godz, aktywna
         FROM promocje WHERE lokal_id = ? AND usunieto IS NULL ORDER BY kolejnosc, id`,
      )
      .all(lokalId) as WierszPromocji[]
  ).map((p) => ({
    id: p.id,
    tytul: p.tytul,
    opis: p.opis,
    danie: p.danie,
    wariant: p.wariant,
    cenaGr: p.cena_gr,
    odDnia: p.od_dnia,
    doDnia: p.do_dnia,
    dni: JSON.parse(p.dni),
    odGodz: p.od_godz,
    doGodz: p.do_godz,
    aktywna: p.aktywna === 1,
  }));
}

/** Dania z cenami do wyboru w promocji: nazwa → warianty z ceną regularną. */
export function cenyDan(lokalId: number) {
  return (
    db.prepare("SELECT nazwa, ceny FROM menu WHERE lokal_id = ? ORDER BY kolejnosc").all(lokalId) as {
      nazwa: string;
      ceny: string;
    }[]
  )
    .map((d) => ({ nazwa: d.nazwa, ceny: JSON.parse(d.ceny) as Cena[] }))
    .filter((d) => d.ceny.length);
}

export function zapiszPromocje(lokalId: number, p: Omit<PromocjaEdycja, "id"> & { id: number | null }) {
  const pola = [
    p.tytul,
    p.opis,
    p.danie,
    p.wariant,
    p.cenaGr,
    p.odDnia,
    p.doDnia,
    JSON.stringify(p.dni),
    p.odGodz,
    p.doGodz,
    p.aktywna ? 1 : 0,
  ] as const;
  if (p.id === null) {
    db.prepare(
      `INSERT INTO promocje (tytul, opis, danie, wariant, cena_gr, od_dnia, do_dnia, dni, od_godz, do_godz, aktywna,
         lokal_id, kolejnosc)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(kolejnosc), 0) + 1 FROM promocje WHERE lokal_id = ?))`,
    ).run(...pola, lokalId, lokalId);
  } else {
    db.prepare(
      `UPDATE promocje SET tytul = ?, opis = ?, danie = ?, wariant = ?, cena_gr = ?, od_dnia = ?, do_dnia = ?, dni = ?,
         od_godz = ?, do_godz = ?, aktywna = ?
       WHERE id = ? AND lokal_id = ? AND usunieto IS NULL`,
    ).run(...pola, p.id, lokalId);
  }
}

/** Usunięta promocja znika ze strony i panelu, ale zostaje w bazie — jej cena liczy się do najniższej z 30 dni. */
export function usunPromocje(lokalId: number, id: number) {
  db.prepare("UPDATE promocje SET usunieto = datetime('now'), aktywna = 0 WHERE id = ? AND lokal_id = ?").run(id, lokalId);
}

// ——— Dostawa ———

export type StrefaEdycja = { nazwa: string; miejsca: string; cena: string; minimum: string };

export function dostawaDoEdycji(lokalId: number) {
  const strefy = (
    db
      .prepare("SELECT nazwa, miejsca, cena_gr, min_gr FROM strefy_dostawy WHERE lokal_id = ? ORDER BY kolejnosc")
      .all(lokalId) as { nazwa: string; miejsca: string; cena_gr: number | null; min_gr: number | null }[]
  ).map(
    (s): StrefaEdycja => ({
      nazwa: s.nazwa,
      miejsca: (JSON.parse(s.miejsca) as string[]).join(", "),
      cena: s.cena_gr === null ? "" : naTekst(s.cena_gr),
      minimum: s.min_gr === null ? "" : naTekst(s.min_gr),
    }),
  );
  const { dostawa_uwagi: uwagi } = db.prepare("SELECT dostawa_uwagi FROM lokale WHERE id = ?").get(lokalId) as {
    dostawa_uwagi: string | null;
  };
  return { strefy, uwagi: uwagi ?? "" };
}

export function nazwyMiejscowosci() {
  return (db.prepare("SELECT nazwa FROM miejscowosci ORDER BY nazwa").all() as { nazwa: string }[]).map((m) => m.nazwa);
}

/** Sprawdza strefy z formularza: miejscowości muszą być z naszej listy (po nich klient szuka „dowozi do mnie”). */
export function sprawdzStrefy(dane: unknown): { strefy: { nazwa: string; miejsca: string[]; cena: number | null; min: number | null }[] } | { blad: string } {
  if (!Array.isArray(dane) || dane.length > 60) return { blad: "Nieprawidłowe strefy dostawy." };
  const znane = new Map(nazwyMiejscowosci().map((n) => [n.toLowerCase(), n]));
  const strefy = [];
  for (const s of dane as Record<string, unknown>[]) {
    const nazwa = tekst(s?.nazwa, 80);
    const lista = tekst(s?.miejsca, 400)
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (!nazwa && !lista.length) continue;
    const miejsca: string[] = [];
    for (const m of lista) {
      const znana = znane.get(m.toLowerCase());
      if (!znana) return { blad: `Nie znamy miejscowości „${m}”. Wybierz ją z podpowiedzi albo usuń.` };
      miejsca.push(znana);
    }
    if (!miejsca.length && nazwa && znane.has(nazwa.toLowerCase())) miejsca.push(znane.get(nazwa.toLowerCase())!);
    const cenaTekst = tekst(s.cena, 20);
    const minTekst = tekst(s.minimum, 20);
    const cena = cenaTekst ? grosze(cenaTekst) : null;
    const min = minTekst ? grosze(minTekst) : null;
    if ((cenaTekst && cena === null) || (minTekst && min === null)) {
      return { blad: `Strefa „${nazwa || miejsca.join(", ")}”: kwoty wpisz jako liczby, np. 5 albo 4,50.` };
    }
    strefy.push({ nazwa: nazwa || miejsca.join(", "), miejsca, cena, min });
  }
  return { strefy };
}

export function zapiszDostawe(
  lokalId: number,
  strefy: { nazwa: string; miejsca: string[]; cena: number | null; min: number | null }[],
  uwagi: string | null,
) {
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM strefy_dostawy WHERE lokal_id = ?").run(lokalId);
    const dodaj = db.prepare(
      "INSERT INTO strefy_dostawy (lokal_id, nazwa, miejsca, cena_gr, min_gr, kolejnosc) VALUES (?, ?, ?, ?, ?, ?)",
    );
    strefy.forEach((s, i) => dodaj.run(lokalId, s.nazwa, JSON.stringify(s.miejsca), s.cena, s.min, i));
    db.prepare(
      `UPDATE lokale SET dostawa_zrodlo = 'panel', dostawa_sprawdzono = date('now', 'localtime'), dostawa_uwagi = ?
       WHERE id = ?`,
    ).run(uwagi, lokalId);
    db.exec("COMMIT");
  } catch (blad) {
    db.exec("ROLLBACK");
    throw blad;
  }
}
