"use client";

import { useMemo, useSyncExternalStore } from "react";

// Ulubione lokale (slugi) zapamiętane w przeglądarce. Bez konta — tylko na tym urządzeniu.
const KLUCZ = "szamanie:ulubione";
const sluchacze = new Set<() => void>();

function czytaj() {
  try {
    return localStorage.getItem(KLUCZ) ?? "[]";
  } catch {
    return "[]";
  }
}

function subskrybuj(zmiana: () => void) {
  sluchacze.add(zmiana);
  window.addEventListener("storage", zmiana);
  return () => {
    sluchacze.delete(zmiana);
    window.removeEventListener("storage", zmiana);
  };
}

export function useUlubione() {
  const zapisane = useSyncExternalStore(subskrybuj, czytaj, () => "[]");
  const ulubione = useMemo(() => {
    try {
      return new Set(JSON.parse(zapisane) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [zapisane]);

  const przelacz = (slug: string) => {
    const nowe = new Set(ulubione);
    if (nowe.has(slug)) nowe.delete(slug);
    else nowe.add(slug);
    try {
      localStorage.setItem(KLUCZ, JSON.stringify([...nowe]));
    } catch {
      // przeglądarka bez dostępu do pamięci — ulubione nie zostaną zapamiętane
    }
    sluchacze.forEach((s) => s());
  };

  return { ulubione, przelacz };
}
