// „Zamawiamy razem”: lista do zamówienia wędruje między telefonami w linku (kod QR albo udostępnienie).
// Wszystko siedzi w części adresu po „#”, której przeglądarka nie wysyła na serwer — bez kont i bez zapisu u nas.
// W linku są tylko imiona, klucze dań i ilości; nazwy i ceny telefon odbiorcy bierze z menu na stronie lokalu.
import type { PozycjaListy } from "./useLista";

export const ZNACZNIK = "#razem=";

type Paczka = { o: string[]; p: [number, string, number][]; u?: string };

const doBase64 = (tekst: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(tekst)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const zBase64 = (tekst: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(tekst.replace(/-/g, "+").replace(/_/g, "/")), (z) => z.charCodeAt(0)));

/** Część linku po „#razem=”: pozycje innych z ich imionami, moje (bez `kto`) pod moim imieniem. */
export function zakoduj(pozycje: PozycjaListy[], uwagi: string, mojeImie: string): string {
  const osoby: string[] = [];
  const indeks = (kto: string) => (osoby.includes(kto) ? osoby.indexOf(kto) : osoby.push(kto) - 1);
  const paczka: Paczka = { o: osoby, p: pozycje.map((p) => [indeks(p.kto ?? mojeImie), p.klucz, p.ilosc]) };
  if (uwagi) paczka.u = uwagi;
  return doBase64(JSON.stringify(paczka));
}

/** Pozycje z linku (kto = imię osoby) albo null, gdy link jest uszkodzony. */
export function odkoduj(
  kod: string,
  danie: (klucz: string) => Omit<PozycjaListy, "ilosc" | "kto"> | undefined,
): { pozycje: PozycjaListy[]; uwagi: string } | null {
  try {
    const { o, p, u } = JSON.parse(zBase64(kod)) as Paczka;
    const pozycje = p.flatMap(([osoba, klucz, ilosc]) => {
      const d = danie(klucz);
      // danie, którego już nie ma w menu (lokal zmienił kartę), po prostu pomijamy
      return d && o[osoba] && ilosc > 0 ? [{ ...d, ilosc, kto: o[osoba].slice(0, 30) }] : [];
    });
    return { pozycje, uwagi: typeof u === "string" ? u.slice(0, 500) : "" };
  } catch {
    return null;
  }
}
