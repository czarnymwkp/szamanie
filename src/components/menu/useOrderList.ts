"use client";

import { useSyncExternalStore } from "react";

/**
 * One item on the order list. gr = null when the venue does not publish a price. kto = the name of the person the item
 * came from in a „Zamawiamy razem” link (groupOrder.ts); without it — mine.
 */
export type ListItem = {
  klucz: string;
  nazwa: string;
  wariant: string | null;
  gr: number | null;
  ilosc: number;
  kto?: string;
};
/** strefa = delivery zone name or PICKUP; null = not chosen yet. */
export type OrderList = { pozycje: ListItem[]; uwagi: string; strefa: string | null };

export const PICKUP = "odbior";
const EMPTY: OrderList = { pozycje: [], uwagi: "", strefa: null };

// The list lives in the browser (no account, no server): separately for each venue, in localStorage. When localStorage
// is unavailable (private mode), the list works until the tab is closed.
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
  // the same list open in another tab
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
  /** kto: whose item it is (from „Zamawiamy razem”); without it — mine. */
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
    // the counter next to a dish in the menu shows only my portions — other people's are changed on the list
    ilosc: (itemKey: string) => list.pozycje.find((x) => x.klucz === itemKey && !x.kto)?.ilosc ?? 0,
    dodaj: add,
    zmienIlosc: changeQuantity,
    ustawUwagi: (notes: string) => change({ uwagi: notes }),
    ustawStrefe: (zone: string | null) => change({ strefa: zone }),
    wyczysc: () => change({ pozycje: [], uwagi: "" }),
    /**
     * A list from a „Zamawiamy razem” link. Items under my name come back as mine; when the link does not know me, my
     * current items are added to it (added before someone sent the link).
     */
    przyjmijRazem: (items: ListItem[], notes: string, myName: string) => {
      const fromLink = items.map((p) => (myName && p.kto === myName ? { ...p, kto: undefined } : p));
      const mine = fromLink.some((p) => !p.kto) ? [] : read(slug).pozycje.filter((p) => !p.kto);
      change({ pozycje: [...fromLink, ...mine], uwagi: notes || read(slug).uwagi });
    },
  };
}

export type VenueOrderList = ReturnType<typeof useOrderList>;
