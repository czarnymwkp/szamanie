import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import type { TerminPromocji } from "./terminPromocji";

// Promocje lokalu na jego stronie (dodaje je właściciel w panelu). Przy obniżce ceny dania prawo (dyrektywa
// Omnibus, art. 6a ustawy o informowaniu o cenach) wymaga podania najniższej ceny z 30 dni przed obniżką.
// Liczymy ją z historii cen z menu (tabela historia_cen; bez historii cena z menu obowiązywała cały ten czas)
// i z wcześniejszych promocji tego dania (także usuniętych — dlatego usunięcie tylko je ukrywa).

export type Promocja = TerminPromocji & {
  id: number;
  tytul: string;
  opis: string | null;
  danie: string | null;
  wariant: string | null;
  cenaGr: number | null;
  cenaRegularnaGr: number | null;
  najnizsza30Gr: number | null;
};

const DZIEN_MS = 24 * 60 * 60 * 1000;

type CenyZmenu = { wariant: string | null; gr: number }[];
type Wpis = { ceny: CenyZmenu; od: number };
type InnaPromocja = { gr: number; od: number; do: number };

const cenaWariantu = (ceny: CenyZmenu, wariant: string | null) =>
  ceny.find((c) => c.wariant === wariant) ?? (wariant ? undefined : ceny[0]);

/**
 * Najniższa cena w ciągu 30 dni przed `start`: z historii cen menu (wpisy po dacie, każdy obowiązuje do następnego)
 * i z innych promocji tego dania, które trwały w tym czasie. Bez żadnej ceny w oknie — cena obecna.
 */
export function najnizszaZ30Dni(
  historia: Wpis[],
  inne: InnaPromocja[],
  wariant: string | null,
  start: number,
  obecnaGr: number | null,
) {
  const okno = start - 30 * DZIEN_MS;
  const ceny: number[] = [];
  historia.forEach((w, i) => {
    const koniec = historia[i + 1]?.od ?? Infinity;
    if (w.od >= start || koniec <= okno) return;
    const cena = cenaWariantu(w.ceny, wariant);
    if (cena) ceny.push(cena.gr);
  });
  for (const p of inne) if (p.od < start && p.do > okno) ceny.push(p.gr);
  if (!ceny.length) return obecnaGr;
  return Math.min(...ceny);
}

type WierszPromocji = {
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

const zSqlite = (data: string) => Date.parse(`${data.replace(" ", "T")}Z`);
const poczatek = (p: WierszPromocji) => (p.od_dnia ? Date.parse(p.od_dnia) : zSqlite(p.utworzono));
const koniec = (p: WierszPromocji) =>
  Math.min(p.do_dnia ? Date.parse(p.do_dnia) + DZIEN_MS : Infinity, p.usunieto ? zSqlite(p.usunieto) : Infinity);

export async function pobierzPromocje(lokalId: number): Promise<Promocja[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("promocje");

  const dzis = new Date().toISOString().slice(0, 10);
  const wszystkie = db
    .prepare(
      `SELECT id, tytul, opis, danie, wariant, cena_gr, od_dnia, do_dnia, dni, od_godz, do_godz, utworzono, usunieto, aktywna
       FROM promocje WHERE lokal_id = ? ORDER BY kolejnosc, id`,
    )
    .all(lokalId) as (WierszPromocji & { aktywna: number })[];
  const widoczne = wszystkie.filter((p) => p.aktywna === 1 && !p.usunieto && (!p.do_dnia || p.do_dnia >= dzis));

  return widoczne.map((p) => {
    let cenaRegularnaGr: number | null = null;
    let najnizsza30Gr: number | null = null;
    if (p.danie && p.cena_gr !== null) {
      const danie = db.prepare("SELECT ceny FROM menu WHERE lokal_id = ? AND nazwa = ? LIMIT 1").get(lokalId, p.danie) as
        | { ceny: string }
        | undefined;
      cenaRegularnaGr = danie ? (cenaWariantu(JSON.parse(danie.ceny), p.wariant)?.gr ?? null) : null;
      const historia = (
        db.prepare("SELECT ceny, od FROM historia_cen WHERE lokal_id = ? AND nazwa = ? ORDER BY od").all(lokalId, p.danie) as {
          ceny: string;
          od: string;
        }[]
      ).map((w) => ({ ceny: JSON.parse(w.ceny) as CenyZmenu, od: Date.parse(w.od) }));
      const inne = wszystkie
        .filter((q) => q.id !== p.id && q.danie === p.danie && q.wariant === p.wariant && q.cena_gr !== null)
        .map((q) => ({ gr: q.cena_gr as number, od: poczatek(q), do: koniec(q) }));
      najnizsza30Gr = najnizszaZ30Dni(historia, inne, p.wariant, poczatek(p), cenaRegularnaGr);
    }
    return {
      id: p.id,
      tytul: p.tytul,
      opis: p.opis,
      danie: p.danie,
      wariant: p.wariant,
      cenaGr: p.cena_gr,
      cenaRegularnaGr,
      najnizsza30Gr,
      odDnia: p.od_dnia,
      doDnia: p.do_dnia,
      dni: JSON.parse(p.dni),
      odGodz: p.od_godz,
      doGodz: p.do_godz,
    };
  });
}
