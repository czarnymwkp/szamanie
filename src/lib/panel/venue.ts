import "server-only";
import { db } from "../db";
import type { DishFeature } from "../menu";
import { stripPolish } from "../slug.mjs";

// Odczyt i zapis danych lokalu z panelu właściciela. Dane lokalu idą do tabeli poprawki (jak `npm run popraw`),
// więc import z OSM ich nie nadpisuje; menu i promocje mają własne tabele. Uprawnienia sprawdza wywołujący.

// ——— Dane lokalu ———

export const TEXT_FIELDS = ["nazwa", "telefon", "email", "www", "facebook", "instagram", "opis", "godziny"] as const;
export const YES_NO_FIELDS = ["dostawa", "na_wynos", "zwierzeta", "wozek", "wege", "wegan"] as const;

type TextField = (typeof TEXT_FIELDS)[number];
type YesNoField = (typeof YES_NO_FIELDS)[number];
export type VenueData = Record<TextField, string | null> & Record<YesNoField, boolean>;

export const LENGTHS: Record<TextField, number> = {
  nazwa: 80,
  telefon: 40,
  email: 120,
  www: 200,
  facebook: 200,
  instagram: 200,
  opis: 600,
  godziny: 300,
};

type Row = Record<TextField, string | null> & { dostawa: number; na_wynos: number; cechy: string };

function venueOverrides(venueId: number) {
  const result: Record<string, unknown> = {};
  for (const p of db.prepare("SELECT pole, wartosc FROM poprawki WHERE lokal_id = ?").all(venueId) as {
    pole: string;
    wartosc: string;
  }[]) {
    result[p.pole] = JSON.parse(p.wartosc);
  }
  return result;
}

/** Aktualne dane lokalu tak, jak widzi je strona: z bazy (OSM) z nałożonymi poprawkami. */
export function venueData(venueId: number): VenueData {
  const w = db
    .prepare(
      `SELECT nazwa, telefon, email, www, facebook, instagram, opis, godziny, dostawa, na_wynos, cechy
       FROM lokale WHERE id = ?`,
    )
    .get(venueId) as Row;
  const features = JSON.parse(w.cechy) as Record<string, unknown>;
  const p = venueOverrides(venueId);
  const date = {} as VenueData;
  for (const field of TEXT_FIELDS) date[field] = (field in p ? p[field] : w[field]) as string | null;
  date.dostawa = "dostawa" in p ? !!p.dostawa : w.dostawa === 1;
  date.na_wynos = "na_wynos" in p ? !!p.na_wynos : w.na_wynos === 1;
  for (const field of ["zwierzeta", "wozek", "wege", "wegan"] as const) {
    date[field] = field in p ? !!p[field] : !!features[field];
  }
  return date;
}

/** Zapisuje jako poprawki tylko pola, które się zmieniły. Pusty tekst = usunięcie (np. nieaktualnej strony www). */
export function saveVenueDetails(venueId: number, newOnes: VenueData, author: string) {
  const currentOnes = venueData(venueId);
  const save = db.prepare(
    `INSERT INTO poprawki (lokal_id, pole, wartosc, autor) VALUES (?, ?, ?, ?)
     ON CONFLICT(lokal_id, pole) DO UPDATE SET wartosc = excluded.wartosc, autor = excluded.autor,
       utworzono = datetime('now')`,
  );
  let changes = 0;
  db.exec("BEGIN");
  try {
    for (const field of [...TEXT_FIELDS, ...YES_NO_FIELDS]) {
      if (newOnes[field] === currentOnes[field]) continue;
      save.run(venueId, field, JSON.stringify(newOnes[field]), author);
      changes++;
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return changes;
}

// ——— Menu ———

export const DISH_FEATURES: DishFeature[] = ["wege", "ostre", "polecane", "sezonowe"];

/** Menu w postaci dla edytora: ceny jako tekst („27,50”), żeby pole formularza pokazywało to, co wpisał lokal. */
export type PriceDraft = { wariant: string; cena: string };
export type DishDraft = { id: number | null; nazwa: string; opis: string; ceny: PriceDraft[]; cechy: DishFeature[] };
export type SectionDraft = { nazwa: string; opis: string; dania: DishDraft[] };

const toText = (gr: number) => (gr % 100 ? (gr / 100).toFixed(2).replace(".", ",") : String(gr / 100));

export function menuDraft(venueId: number): SectionDraft[] {
  const sections = (
    db.prepare("SELECT nazwa, opis FROM menu_sekcje WHERE lokal_id = ? ORDER BY kolejnosc").all(venueId) as {
      nazwa: string;
      opis: string | null;
    }[]
  ).map((s): SectionDraft => ({ nazwa: s.nazwa, opis: s.opis ?? "", dania: [] }));
  const byName = new Map(sections.map((s) => [s.nazwa, s]));
  for (const d of db
    .prepare("SELECT id, sekcja, nazwa, opis, ceny, cechy FROM menu WHERE lokal_id = ? ORDER BY kolejnosc")
    .all(venueId) as { id: number; sekcja: string; nazwa: string; opis: string | null; ceny: string; cechy: string }[]) {
    let section = byName.get(d.sekcja);
    if (!section) {
      section = { nazwa: d.sekcja, opis: "", dania: [] };
      sections.push(section);
      byName.set(d.sekcja, section);
    }
    section.dania.push({
      id: d.id,
      nazwa: d.nazwa,
      opis: d.opis ?? "",
      ceny: (JSON.parse(d.ceny) as { wariant: string | null; gr: number }[]).map((c) => ({
        wariant: c.wariant ?? "",
        cena: toText(c.gr),
      })),
      cechy: JSON.parse(d.cechy),
    });
  }
  return sections;
}

/** „29,90” albo „29.90 zł” → 2990 groszy; null, gdy to nie jest cena. */
export function toGrosze(text: string): number | null {
  const t = text.replace(/zł/gi, "").replace(/\s/g, "").replace(",", ".");
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(Number(t) * 100);
}

export const MENU_LIMITS = { sekcji: 60, dan: 600, cen: 6, nazwa: 120, opis: 500, sekcja: 80, wariant: 40 };

type Price = { wariant: string | null; gr: number };
type DishToSave = { id: number | null; nazwa: string; opis: string | null; ceny: Price[]; cechy: DishFeature[] };
type SectionToSave = { nazwa: string; opis: string | null; dania: DishToSave[] };

const textValue = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Sprawdza menu z edytora (dane z przeglądarki — nie ufamy im) i zamienia ceny na grosze. */
export function validateMenu(date: unknown): { menu: SectionToSave[] } | { blad: string } {
  if (!Array.isArray(date)) return { blad: "Nieprawidłowe dane menu." };
  if (date.length > MENU_LIMITS.sekcji) return { blad: `Najwyżej ${MENU_LIMITS.sekcji} działów.` };
  const sectionNames = new Set<string>();
  const menu: SectionToSave[] = [];
  let dishCount = 0;
  for (const s of date as Record<string, unknown>[]) {
    const name = textValue(s?.nazwa, MENU_LIMITS.sekcja);
    if (!name) return { blad: "Każdy dział musi mieć nazwę." };
    const key = name.toLowerCase();
    if (sectionNames.has(key)) return { blad: `Dwa działy nazywają się „${name}”. Zmień nazwę jednego z nich.` };
    sectionNames.add(key);
    if (!Array.isArray(s.dania)) return { blad: "Nieprawidłowe dane menu." };
    const dishes: DishToSave[] = [];
    for (const d of s.dania as Record<string, unknown>[]) {
      const dishName = textValue(d?.nazwa, MENU_LIMITS.nazwa);
      if (!dishName) return { blad: `W dziale „${name}” jest danie bez nazwy.` };
      if (!Array.isArray(d.ceny) || d.ceny.length > MENU_LIMITS.cen) return { blad: `„${dishName}”: za dużo cen.` };
      const prices: Price[] = [];
      for (const c of d.ceny as Record<string, unknown>[]) {
        const price = textValue(c?.cena, 20);
        const variant = textValue(c?.wariant, MENU_LIMITS.wariant) || null;
        if (!price && !variant) continue;
        const gr = toGrosze(price);
        if (gr === null) return { blad: `„${dishName}”: cena „${price}” nie wygląda na kwotę (np. 27 albo 27,50).` };
        prices.push({ wariant: variant, gr });
      }
      if (prices.length > 1 && prices.some((c) => !c.wariant)) {
        return { blad: `„${dishName}”: przy kilku cenach podaj wariant każdej (np. 32 cm, 45 cm).` };
      }
      const features = Array.isArray(d.cechy) ? DISH_FEATURES.filter((c) => (d.cechy as unknown[]).includes(c)) : [];
      const id = typeof d.id === "number" && Number.isInteger(d.id) ? d.id : null;
      dishes.push({ id, nazwa: dishName, opis: textValue(d.opis, MENU_LIMITS.opis) || null, ceny: prices, cechy: features });
      if (++dishCount > MENU_LIMITS.dan) return { blad: `Najwyżej ${MENU_LIMITS.dan} dań.` };
    }
    menu.push({ nazwa: name, opis: textValue(s.opis, 200) || null, dania: dishes });
  }
  return { menu };
}

/** Tak jak scripts/menu.mjs: same słowa bez polskich znaków — wyszukiwarka dopasowuje początki słów. */
const searchText = (...parts: (string | null)[]) =>
  stripPolish(parts.filter(Boolean).join(" ")).replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Zapisuje całe menu lokalu. Dania z id zostają tymi samymi wierszami (lista zamówienia klienta ich nie gubi),
 * nowe dostają wiersze, usunięte znikają. Każda zmiana ceny trafia do historii cen.
 */
export function saveVenueMenu(venueId: number, menu: SectionToSave[]) {
  const old = new Map(
    (
      db.prepare("SELECT id, nazwa, ceny FROM menu WHERE lokal_id = ?").all(venueId) as {
        id: number;
        nazwa: string;
        ceny: string;
      }[]
    ).map((d) => [d.id, { ...d }]),
  );
  const { menu_sprawdzono: sprawdzono } = db.prepare("SELECT menu_sprawdzono FROM lokale WHERE id = ?").get(venueId) as {
    menu_sprawdzono: string | null;
  };
  const hasHistory = db.prepare("SELECT 1 FROM historia_cen WHERE lokal_id = ? AND nazwa = ? LIMIT 1");
  const history = db.prepare("INSERT INTO historia_cen (lokal_id, sekcja, nazwa, ceny, od) VALUES (?, ?, ?, ?, ?)");
  const change = db.prepare(
    `UPDATE menu SET sekcja = ?, nazwa = ?, opis = ?, ceny = ?, cechy = ?, kolejnosc = ?, szukaj = ?
     WHERE id = ? AND lokal_id = ?`,
  );
  const add = db.prepare(
    `INSERT INTO menu (lokal_id, sekcja, nazwa, opis, ceny, cechy, kolejnosc, szukaj) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const now = new Date().toISOString();

  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM menu_sekcje WHERE lokal_id = ?").run(venueId);
    const kept = new Set<number>();
    let order = 0;
    menu.forEach((s, i) => {
      db.prepare("INSERT INTO menu_sekcje (lokal_id, nazwa, opis, kolejnosc) VALUES (?, ?, ?, ?)").run(
        venueId,
        s.nazwa,
        s.opis,
        i,
      );
      for (const d of s.dania) {
        const prices = JSON.stringify(d.ceny);
        const fields = [s.nazwa, d.nazwa, d.opis, prices, JSON.stringify(d.cechy), order++, searchText(d.nazwa, d.opis, s.nazwa)] as const;
        const oldOne = d.id !== null ? old.get(d.id) : undefined;
        if (oldOne && !kept.has(oldOne.id)) {
          change.run(...fields, oldOne.id, venueId);
          kept.add(oldOne.id);
        } else {
          add.run(venueId, ...fields);
        }
        if (oldOne?.ceny === prices) continue;
        // pierwsza zmiana ceny dania: zapisujemy też cenę sprzed zmiany, od kiedy menu było sprawdzone
        if (oldOne && !hasHistory.get(venueId, oldOne.nazwa)) {
          history.run(venueId, s.nazwa, oldOne.nazwa, oldOne.ceny, sprawdzono ?? now.slice(0, 10));
        }
        history.run(venueId, s.nazwa, d.nazwa, prices, now);
      }
    });
    for (const id of old.keys()) {
      if (!kept.has(id)) db.prepare("DELETE FROM menu WHERE id = ? AND lokal_id = ?").run(id, venueId);
    }
    db.prepare("UPDATE lokale SET menu_zrodlo = 'panel', menu_sprawdzono = date('now', 'localtime') WHERE id = ?").run(
      venueId,
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

// ——— Promocje ———

export type PromotionDraft = {
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

type PromotionRow = Omit<PromotionDraft, "cenaGr" | "odDnia" | "doDnia" | "dni" | "odGodz" | "doGodz" | "aktywna"> & {
  cena_gr: number | null;
  od_dnia: string | null;
  do_dnia: string | null;
  dni: string;
  od_godz: string | null;
  do_godz: string | null;
  aktywna: number;
};

export function promotionsDraft(venueId: number): PromotionDraft[] {
  return (
    db
      .prepare(
        `SELECT id, tytul, opis, danie, wariant, cena_gr, od_dnia, do_dnia, dni, od_godz, do_godz, aktywna
         FROM promocje WHERE lokal_id = ? AND usunieto IS NULL ORDER BY kolejnosc, id`,
      )
      .all(venueId) as PromotionRow[]
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
export function dishPrices(venueId: number) {
  return (
    db.prepare("SELECT nazwa, ceny FROM menu WHERE lokal_id = ? ORDER BY kolejnosc").all(venueId) as {
      nazwa: string;
      ceny: string;
    }[]
  )
    .map((d) => ({ nazwa: d.nazwa, ceny: JSON.parse(d.ceny) as Price[] }))
    .filter((d) => d.ceny.length);
}

export function savePromotion(venueId: number, p: Omit<PromotionDraft, "id"> & { id: number | null }) {
  const fields = [
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
    ).run(...fields, venueId, venueId);
  } else {
    db.prepare(
      `UPDATE promocje SET tytul = ?, opis = ?, danie = ?, wariant = ?, cena_gr = ?, od_dnia = ?, do_dnia = ?, dni = ?,
         od_godz = ?, do_godz = ?, aktywna = ?
       WHERE id = ? AND lokal_id = ? AND usunieto IS NULL`,
    ).run(...fields, p.id, venueId);
  }
}

/** Usunięta promocja znika ze strony i panelu, ale zostaje w bazie — jej cena liczy się do najniższej z 30 dni. */
export function deletePromotion(venueId: number, id: number) {
  db.prepare("UPDATE promocje SET usunieto = datetime('now'), aktywna = 0 WHERE id = ? AND lokal_id = ?").run(id, venueId);
}

// ——— Dostawa ———

export type ZoneDraft = { nazwa: string; miejsca: string; cena: string; minimum: string };

export function deliveryDraft(venueId: number) {
  const zones = (
    db
      .prepare("SELECT nazwa, miejsca, cena_gr, min_gr FROM strefy_dostawy WHERE lokal_id = ? ORDER BY kolejnosc")
      .all(venueId) as { nazwa: string; miejsca: string; cena_gr: number | null; min_gr: number | null }[]
  ).map(
    (s): ZoneDraft => ({
      nazwa: s.nazwa,
      miejsca: (JSON.parse(s.miejsca) as string[]).join(", "),
      cena: s.cena_gr === null ? "" : toText(s.cena_gr),
      minimum: s.min_gr === null ? "" : toText(s.min_gr),
    }),
  );
  const { dostawa_uwagi: uwagi } = db.prepare("SELECT dostawa_uwagi FROM lokale WHERE id = ?").get(venueId) as {
    dostawa_uwagi: string | null;
  };
  return { strefy: zones, uwagi: uwagi ?? "" };
}

export function townNames() {
  return (db.prepare("SELECT nazwa FROM miejscowosci ORDER BY nazwa").all() as { nazwa: string }[]).map((m) => m.nazwa);
}

/** Sprawdza strefy z formularza: miejscowości muszą być z naszej listy (po nich klient szuka „dowozi do mnie”). */
export function validateZones(date: unknown): { strefy: { nazwa: string; miejsca: string[]; cena: number | null; min: number | null }[] } | { blad: string } {
  if (!Array.isArray(date) || date.length > 60) return { blad: "Nieprawidłowe strefy dostawy." };
  const knownOnes = new Map(townNames().map((n) => [n.toLowerCase(), n]));
  const zones = [];
  for (const s of date as Record<string, unknown>[]) {
    const name = textValue(s?.nazwa, 80);
    const list = textValue(s?.miejsca, 400)
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (!name && !list.length) continue;
    const places: string[] = [];
    for (const m of list) {
      const known = knownOnes.get(m.toLowerCase());
      if (!known) return { blad: `Nie znamy miejscowości „${m}”. Wybierz ją z podpowiedzi albo usuń.` };
      places.push(known);
    }
    if (!places.length && name && knownOnes.has(name.toLowerCase())) places.push(knownOnes.get(name.toLowerCase())!);
    const priceText = textValue(s.cena, 20);
    const minText = textValue(s.minimum, 20);
    const price = priceText ? toGrosze(priceText) : null;
    const min = minText ? toGrosze(minText) : null;
    if ((priceText && price === null) || (minText && min === null)) {
      return { blad: `Strefa „${name || places.join(", ")}”: kwoty wpisz jako liczby, np. 5 albo 4,50.` };
    }
    zones.push({ nazwa: name || places.join(", "), miejsca: places, cena: price, min });
  }
  return { strefy: zones };
}

export function saveDelivery(
  venueId: number,
  zones: { nazwa: string; miejsca: string[]; cena: number | null; min: number | null }[],
  notes: string | null,
) {
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM strefy_dostawy WHERE lokal_id = ?").run(venueId);
    const add = db.prepare(
      "INSERT INTO strefy_dostawy (lokal_id, nazwa, miejsca, cena_gr, min_gr, kolejnosc) VALUES (?, ?, ?, ?, ?, ?)",
    );
    zones.forEach((s, i) => add.run(venueId, s.nazwa, JSON.stringify(s.miejsca), s.cena, s.min, i));
    db.prepare(
      `UPDATE lokale SET dostawa_zrodlo = 'panel', dostawa_sprawdzono = date('now', 'localtime'), dostawa_uwagi = ?
       WHERE id = ?`,
    ).run(notes, venueId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
