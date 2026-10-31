// „Zamawiamy razem”: lista do zamówienia wędruje między telefonami w linku (kod QR albo udostępnienie).
// Wszystko siedzi w części adresu po „#”, której przeglądarka nie wysyła na serwer — bez kont i bez zapisu u nas.
// W linku są imiona, nazwy dań z wariantem i ilości; ceny telefon odbiorcy bierze z menu na stronie lokalu.
// Po nazwie, nie po numerze pozycji: menu wczytane na nowo (plik karty, synchronizacja na serwerze) dostaje nowe
// numery, a dania dodane do listy wcześniej muszą dalej dojść do odbiorcy.
import type { ListItem } from "./useLista";

export const MARKER = "#razem=";

type Dish = Omit<ListItem, "ilosc" | "kto">;
// v2: [osoba, nazwa, wariant (0 = bez wariantu), ilość]; dawne linki: [osoba, klucz pozycji, ilość]
type Payload = { v?: 2; o: string[]; p: ([number, string, string | 0, number] | [number, string, number])[]; u?: string };

const toBase64 = (text: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(text)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64 = (text: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (z) => z.charCodeAt(0)));

const byName = (name: string, variant: string | null) => `${name.toLowerCase()}|${variant ?? ""}`;

/** Część linku po „#razem=”: pozycje innych z ich imionami, moje (bez `kto`) pod moim imieniem. */
export function encode(items: ListItem[], notes: string, myName: string): string {
  const people: string[] = [];
  const index = (who: string) => (people.includes(who) ? people.indexOf(who) : people.push(who) - 1);
  const payload: Payload = {
    v: 2,
    o: people,
    p: items.map((p) => [index(p.kto ?? myName), p.nazwa, p.wariant ?? 0, p.ilosc]),
  };
  if (notes) payload.u = notes;
  return toBase64(JSON.stringify(payload));
}

/** Pozycje z linku (kto = imię osoby) albo null, gdy link jest uszkodzony. `dania`: menu lokalu po kluczach pozycji. */
export function decode(code: string, dishes: Map<string, Dish>): { pozycje: ListItem[]; uwagi: string } | null {
  try {
    const { v, o, p, u } = JSON.parse(fromBase64(code)) as Payload;
    const byNameIndex = new Map([...dishes.values()].map((d) => [byName(d.nazwa, d.wariant), d]));
    const items = p.flatMap((w) => {
      const person = w[0];
      const [d, ilosc] =
        v === 2 && w.length === 4
          ? [byNameIndex.get(byName(w[1], w[2] || null)), w[3]]
          : [dishes.get(w[1]), w[2] as number];
      // danie, którego już nie ma w menu (lokal zmienił kartę), po prostu pomijamy
      return d && o[person] && ilosc > 0 ? [{ ...d, ilosc, kto: o[person].slice(0, 30) }] : [];
    });
    return { pozycje: items, uwagi: typeof u === "string" ? u.slice(0, 500) : "" };
  } catch {
    return null;
  }
}
