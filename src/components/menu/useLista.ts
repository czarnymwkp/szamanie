"use client";

import { useSyncExternalStore } from "react";

/**
 * Jedna pozycja na liście do zamówienia. gr = null, gdy lokal nie podał ceny.
 * kto = imię osoby, od której pozycja przyszła w linku „Zamawiamy razem” (razem.ts); bez niego — moja.
 */
export type ListItem = {
  klucz: string;
  nazwa: string;
  wariant: string | null;
  gr: number | null;
  ilosc: number;
  kto?: string;
};
/** strefa = nazwa strefy dostawy albo ODBIOR; null = jeszcze nie wybrano. */
export type OrderList = { pozycje: ListItem[]; uwagi: string; strefa: string | null };

export const PICKUP = "odbior";
const EMPTY: OrderList = { pozycje: [], uwagi: "", strefa: null };

// Lista żyje w przeglądarce (bez konta i bez serwera): osobno dla każdego lokalu, w localStorage.
// Gdy localStorage jest niedostępny (tryb prywatny), lista działa do zamknięcia karty.
const key = (slug: string) => `szamanie:lista:${slug}`;
const state = new Map<string, OrderList>();
const listeners = new Set<() => void>();

function fromStorage(slug: string): OrderList {
  try {
    const saved = localStorage.getItem(key(slug));
    if (saved) return { ...EMPTY, ...JSON.parse(saved) };
  } catch {}
  return EMPTY;
}

function read(slug: string): OrderList {
  if (!state.has(slug)) state.set(slug, fromStorage(slug));
  return state.get(slug)!;
}

function save(slug: string, list: OrderList) {
  state.set(slug, list);
  try {
    if (list.pozycje.length || list.uwagi) localStorage.setItem(key(slug), JSON.stringify(list));
    else localStorage.removeItem(key(slug));
  } catch {}
  listeners.forEach((s) => s());
}

function subscribe(change: () => void) {
  listeners.add(change);
  // ta sama lista otwarta w innej karcie
  const fromOtherTab = (e: StorageEvent) => {
    if (e.key?.startsWith("szamanie:lista:")) {
      state.delete(e.key.slice("szamanie:lista:".length));
      change();
    }
  };
  window.addEventListener("storage", fromOtherTab);
  return () => {
    listeners.delete(change);
    window.removeEventListener("storage", fromOtherTab);
  };
}

export function itemKey(id: number, variant: string | null) {
  return variant ? `${id}:${variant}` : String(id);
}

export function useOrderList(slug: string) {
  const list = useSyncExternalStore(subscribe, () => read(slug), () => EMPTY);
  const change = (newOne: Partial<OrderList>) => save(slug, { ...read(slug), ...newOne });

  const add = (p: Omit<ListItem, "ilosc">) => {
    const items = read(slug).pozycje;
    const exists = items.find((x) => x.klucz === p.klucz && !x.kto);
    change({
      pozycje: exists
        ? items.map((x) => (x === exists ? { ...x, ilosc: x.ilosc + 1 } : x))
        : [...items, { ...p, ilosc: 1 }],
    });
  };
  /** kto: czyja pozycja (z „Zamawiamy razem”); bez niego — moja. */
  const changeQuantity = (itemKey: string, o: number, who?: string) =>
    change({
      pozycje: read(slug)
        .pozycje.map((x) => (x.klucz === itemKey && x.kto === who ? { ...x, ilosc: x.ilosc + o } : x))
        .filter((x) => x.ilosc > 0),
    });

  const count = list.pozycje.reduce((s, p) => s + p.ilosc, 0);
  const sumGr = list.pozycje.reduce((s, p) => s + (p.gr ?? 0) * p.ilosc, 0);
  return {
    lista: list,
    liczba: count,
    sumaGr: sumGr,
    bezCeny: list.pozycje.some((p) => p.gr === null),
    // licznik przy daniu w menu pokazuje tylko moje sztuki — cudze zmienia się na liście
    ilosc: (itemKey: string) => list.pozycje.find((x) => x.klucz === itemKey && !x.kto)?.ilosc ?? 0,
    dodaj: add,
    zmienIlosc: changeQuantity,
    ustawUwagi: (notes: string) => change({ uwagi: notes }),
    ustawStrefe: (zone: string | null) => change({ strefa: zone }),
    wyczysc: () => change({ pozycje: [], uwagi: "" }),
    /**
     * Lista z linku „Zamawiamy razem”. Pozycje pod moim imieniem wracają jako moje; gdy link mnie nie zna,
     * dochodzą do niego moje dotychczasowe pozycje (dopisane, zanim ktoś przysłał link).
     */
    przyjmijRazem: (items: ListItem[], notes: string, myName: string) => {
      const fromLink = items.map((p) => (myName && p.kto === myName ? { ...p, kto: undefined } : p));
      const mine = fromLink.some((p) => !p.kto) ? [] : read(slug).pozycje.filter((p) => !p.kto);
      change({ pozycje: [...fromLink, ...mine], uwagi: notes || read(slug).uwagi });
    },
  };
}

export type VenueOrderList = ReturnType<typeof useOrderList>;
