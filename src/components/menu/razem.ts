// „Zamawiamy razem”: lista do zamówienia wędruje między telefonami w linku (kod QR albo udostępnienie).
// Wszystko siedzi w części adresu po „#”, której przeglądarka nie wysyła na serwer — bez kont i bez zapisu u nas.
// W linku są imiona, nazwy dań z wariantem i ilości; ceny telefon odbiorcy bierze z menu na stronie lokalu.
// Po nazwie, nie po numerze pozycji: menu wczytane na nowo (plik karty, synchronizacja na serwerze) dostaje nowe
// numery, a dania dodane do listy wcześniej muszą dalej dojść do odbiorcy.
import type { PozycjaListy } from "./useLista";

export const ZNACZNIK = "#razem=";

type Danie = Omit<PozycjaListy, "ilosc" | "kto">;
// v2: [osoba, nazwa, wariant (0 = bez wariantu), ilość]; dawne linki: [osoba, klucz pozycji, ilość]
type Paczka = { v?: 2; o: string[]; p: ([number, string, string | 0, number] | [number, string, number])[]; u?: string };

const doBase64 = (tekst: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(tekst)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const zBase64 = (tekst: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(tekst.replace(/-/g, "+").replace(/_/g, "/")), (z) => z.charCodeAt(0)));

const poNazwie = (nazwa: string, wariant: string | null) => `${nazwa.toLowerCase()}|${wariant ?? ""}`;

/** Część linku po „#razem=”: pozycje innych z ich imionami, moje (bez `kto`) pod moim imieniem. */
export function zakoduj(pozycje: PozycjaListy[], uwagi: string, mojeImie: string): string {
  const osoby: string[] = [];
  const indeks = (kto: string) => (osoby.includes(kto) ? osoby.indexOf(kto) : osoby.push(kto) - 1);
  const paczka: Paczka = {
    v: 2,
    o: osoby,
    p: pozycje.map((p) => [indeks(p.kto ?? mojeImie), p.nazwa, p.wariant ?? 0, p.ilosc]),
  };
  if (uwagi) paczka.u = uwagi;
  return doBase64(JSON.stringify(paczka));
}

/** Pozycje z linku (kto = imię osoby) albo null, gdy link jest uszkodzony. `dania`: menu lokalu po kluczach pozycji. */
export function odkoduj(kod: string, dania: Map<string, Danie>): { pozycje: PozycjaListy[]; uwagi: string } | null {
  try {
    const { v, o, p, u } = JSON.parse(zBase64(kod)) as Paczka;
    const wgNazwy = new Map([...dania.values()].map((d) => [poNazwie(d.nazwa, d.wariant), d]));
    const pozycje = p.flatMap((w) => {
      const osoba = w[0];
      const [d, ilosc] =
        v === 2 && w.length === 4
          ? [wgNazwy.get(poNazwie(w[1], w[2] || null)), w[3]]
          : [dania.get(w[1]), w[2] as number];
      // danie, którego już nie ma w menu (lokal zmienił kartę), po prostu pomijamy
      return d && o[osoba] && ilosc > 0 ? [{ ...d, ilosc, kto: o[osoba].slice(0, 30) }] : [];
    });
    return { pozycje, uwagi: typeof u === "string" ? u.slice(0, 500) : "" };
  } catch {
    return null;
  }
}
