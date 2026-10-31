import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import type { PromotionSchedule } from "./terminPromocji";

// Promocje lokalu na jego stronie (dodaje je właściciel w panelu). Przy obniżce ceny dania prawo (dyrektywa
// Omnibus, art. 6a ustawy o informowaniu o cenach) wymaga podania najniższej ceny z 30 dni przed obniżką.
// Liczymy ją z historii cen z menu (tabela historia_cen; bez historii cena z menu obowiązywała cały ten czas)
// i z wcześniejszych promocji tego dania (także usuniętych — dlatego usunięcie tylko je ukrywa).

export type Promotion = PromotionSchedule & {
  id: number;
  tytul: string;
  opis: string | null;
  danie: string | null;
  wariant: string | null;
  cenaGr: number | null;
  cenaRegularnaGr: number | null;
  najnizsza30Gr: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

type MenuPrices = { wariant: string | null; gr: number }[];
type Entry = { ceny: MenuPrices; od: number };
type OtherPromotion = { gr: number; od: number; do: number };

const variantPrice = (prices: MenuPrices, variant: string | null) =>
  prices.find((c) => c.wariant === variant) ?? (variant ? undefined : prices[0]);

/**
 * Najniższa cena w ciągu 30 dni przed `start`: z historii cen menu (wpisy po dacie, każdy obowiązuje do następnego)
 * i z innych promocji tego dania, które trwały w tym czasie. Bez żadnej ceny w oknie — cena obecna.
 */
export function lowestIn30Days(
  history: Entry[],
  others: OtherPromotion[],
  variant: string | null,
  start: number,
  currentGr: number | null,
) {
  const dialog = start - 30 * DAY_MS;
  const prices: number[] = [];
  history.forEach((w, i) => {
    const end = history[i + 1]?.od ?? Infinity;
    if (w.od >= start || end <= dialog) return;
    const price = variantPrice(w.ceny, variant);
    if (price) prices.push(price.gr);
  });
  for (const p of others) if (p.od < start && p.do > dialog) prices.push(p.gr);
  if (!prices.length) return currentGr;
  return Math.min(...prices);
}

type PromotionRow = {
  id: number;
  tytul: string;
  opis: string | null;
  danie: string | null;
  wariant: string | null;
  cena_gr: number | null;
  od_dnia: string | null;
  do_dnia: string | null;
  dni: string;
  od_godz: string | null;
  do_godz: string | null;
  utworzono: string;
  usunieto: string | null;
};

const fromSqlite = (date: string) => Date.parse(`${date.replace(" ", "T")}Z`);
const rangeStart = (p: PromotionRow) => (p.od_dnia ? Date.parse(p.od_dnia) : fromSqlite(p.utworzono));
const rangeEnd = (p: PromotionRow) =>
  Math.min(p.do_dnia ? Date.parse(p.do_dnia) + DAY_MS : Infinity, p.usunieto ? fromSqlite(p.usunieto) : Infinity);

export async function getPromotions(venueId: number): Promise<Promotion[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("promocje");

  const today = new Date().toISOString().slice(0, 10);
  const all = db
    .prepare(
      `SELECT id, tytul, opis, danie, wariant, cena_gr, od_dnia, do_dnia, dni, od_godz, do_godz, utworzono, usunieto, aktywna
       FROM promocje WHERE lokal_id = ? ORDER BY kolejnosc, id`,
    )
    .all(venueId) as (PromotionRow & { aktywna: number })[];
  const visible = all.filter((p) => p.aktywna === 1 && !p.usunieto && (!p.do_dnia || p.do_dnia >= today));

  return visible.map((p) => {
    let regularPriceGr: number | null = null;
    let lowest30Gr: number | null = null;
    if (p.danie && p.cena_gr !== null) {
      const dish = db.prepare("SELECT ceny FROM menu WHERE lokal_id = ? AND nazwa = ? LIMIT 1").get(venueId, p.danie) as
        | { ceny: string }
        | undefined;
      regularPriceGr = dish ? (variantPrice(JSON.parse(dish.ceny), p.wariant)?.gr ?? null) : null;
      const history = (
        db.prepare("SELECT ceny, od FROM historia_cen WHERE lokal_id = ? AND nazwa = ? ORDER BY od").all(venueId, p.danie) as {
          ceny: string;
          od: string;
        }[]
      ).map((w) => ({ ceny: JSON.parse(w.ceny) as MenuPrices, od: Date.parse(w.od) }));
      const others = all
        .filter((q) => q.id !== p.id && q.danie === p.danie && q.wariant === p.wariant && q.cena_gr !== null)
        .map((q) => ({ gr: q.cena_gr as number, od: rangeStart(q), do: rangeEnd(q) }));
      lowest30Gr = lowestIn30Days(history, others, p.wariant, rangeStart(p), regularPriceGr);
    }
    return {
      id: p.id,
      tytul: p.tytul,
      opis: p.opis,
      danie: p.danie,
      wariant: p.wariant,
      cenaGr: p.cena_gr,
      cenaRegularnaGr: regularPriceGr,
      najnizsza30Gr: lowest30Gr,
      odDnia: p.od_dnia,
      doDnia: p.do_dnia,
      dni: JSON.parse(p.dni),
      odGodz: p.od_godz,
      doGodz: p.do_godz,
    };
  });
}
