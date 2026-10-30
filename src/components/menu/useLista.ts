"use client";

import { useSyncExternalStore } from "react";

/**
 * Jedna pozycja na liście do zamówienia. gr = null, gdy lokal nie podał ceny.
 * kto = imię osoby, od której pozycja przyszła w linku „Zamawiamy razem” (razem.ts); bez niego — moja.
 */
export type PozycjaListy = {
  klucz: string;
  nazwa: string;
  wariant: string | null;
  gr: number | null;
  ilosc: number;
  kto?: string;
};
/** strefa = nazwa strefy dostawy albo ODBIOR; null = jeszcze nie wybrano. */
export type Lista = { pozycje: PozycjaListy[]; uwagi: string; strefa: string | null };

export const ODBIOR = "odbior";
const PUSTA: Lista = { pozycje: [], uwagi: "", strefa: null };

// Lista żyje w przeglądarce (bez konta i bez serwera): osobno dla każdego lokalu, w localStorage.
// Gdy localStorage jest niedostępny (tryb prywatny), lista działa do zamknięcia karty.
const klucz = (slug: string) => `szamanie:lista:${slug}`;
const stan = new Map<string, Lista>();
const sluchacze = new Set<() => void>();

function zPamieci(slug: string): Lista {
  try {
    const zapisana = localStorage.getItem(klucz(slug));
    if (zapisana) return { ...PUSTA, ...JSON.parse(zapisana) };
  } catch {}
  return PUSTA;
}

function czytaj(slug: string): Lista {
  if (!stan.has(slug)) stan.set(slug, zPamieci(slug));
  return stan.get(slug)!;
}

function zapisz(slug: string, lista: Lista) {
  stan.set(slug, lista);
  try {
    if (lista.pozycje.length || lista.uwagi) localStorage.setItem(klucz(slug), JSON.stringify(lista));
    else localStorage.removeItem(klucz(slug));
  } catch {}
  sluchacze.forEach((s) => s());
}

function subskrybuj(zmiana: () => void) {
  sluchacze.add(zmiana);
  // ta sama lista otwarta w innej karcie
  const zInnejKarty = (e: StorageEvent) => {
    if (e.key?.startsWith("szamanie:lista:")) {
      stan.delete(e.key.slice("szamanie:lista:".length));
      zmiana();
    }
  };
  window.addEventListener("storage", zInnejKarty);
  return () => {
    sluchacze.delete(zmiana);
    window.removeEventListener("storage", zInnejKarty);
  };
}

export function kluczPozycji(id: number, wariant: string | null) {
  return wariant ? `${id}:${wariant}` : String(id);
}

export function useLista(slug: string) {
  const lista = useSyncExternalStore(subskrybuj, () => czytaj(slug), () => PUSTA);
  const zmien = (nowa: Partial<Lista>) => zapisz(slug, { ...czytaj(slug), ...nowa });

  const dodaj = (p: Omit<PozycjaListy, "ilosc">) => {
    const pozycje = czytaj(slug).pozycje;
    const jest = pozycje.find((x) => x.klucz === p.klucz && !x.kto);
    zmien({
      pozycje: jest
        ? pozycje.map((x) => (x === jest ? { ...x, ilosc: x.ilosc + 1 } : x))
        : [...pozycje, { ...p, ilosc: 1 }],
    });
  };
  /** kto: czyja pozycja (z „Zamawiamy razem”); bez niego — moja. */
  const zmienIlosc = (kluczPoz: string, o: number, kto?: string) =>
    zmien({
      pozycje: czytaj(slug)
        .pozycje.map((x) => (x.klucz === kluczPoz && x.kto === kto ? { ...x, ilosc: x.ilosc + o } : x))
        .filter((x) => x.ilosc > 0),
    });

  const liczba = lista.pozycje.reduce((s, p) => s + p.ilosc, 0);
  const sumaGr = lista.pozycje.reduce((s, p) => s + (p.gr ?? 0) * p.ilosc, 0);
  return {
    lista,
    liczba,
    sumaGr,
    bezCeny: lista.pozycje.some((p) => p.gr === null),
    // licznik przy daniu w menu pokazuje tylko moje sztuki — cudze zmienia się na liście
    ilosc: (kluczPoz: string) => lista.pozycje.find((x) => x.klucz === kluczPoz && !x.kto)?.ilosc ?? 0,
    dodaj,
    zmienIlosc,
    ustawUwagi: (uwagi: string) => zmien({ uwagi }),
    ustawStrefe: (strefa: string | null) => zmien({ strefa }),
    wyczysc: () => zmien({ pozycje: [], uwagi: "" }),
    /**
     * Lista z linku „Zamawiamy razem”. Pozycje pod moim imieniem wracają jako moje; gdy link mnie nie zna,
     * dochodzą do niego moje dotychczasowe pozycje (dopisane, zanim ktoś przysłał link).
     */
    przyjmijRazem: (pozycje: PozycjaListy[], uwagi: string, mojeImie: string) => {
      const zLinku = pozycje.map((p) => (mojeImie && p.kto === mojeImie ? { ...p, kto: undefined } : p));
      const moje = zLinku.some((p) => !p.kto) ? [] : czytaj(slug).pozycje.filter((p) => !p.kto);
      zmien({ pozycje: [...zLinku, ...moje], uwagi: uwagi || czytaj(slug).uwagi });
    },
  };
}

export type ListaLokalu = ReturnType<typeof useLista>;
