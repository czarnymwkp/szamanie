"use client";

import { useSyncExternalStore } from "react";

// Aktualny czas z dokładnością do minuty, tylko w przeglądarce.
// Na serwerze (i przy pierwszym renderze) zwraca null, bo strona jest generowana z wyprzedzeniem
// i „teraz” serwera nie jest „teraz” użytkownika.
const minuta = () => Math.floor(Date.now() / 60_000);

function subskrybuj(zmiana: () => void) {
  const id = setInterval(zmiana, 15_000);
  return () => clearInterval(id);
}

export function useTeraz(): Date | null {
  const m = useSyncExternalStore(subskrybuj, minuta, () => null);
  return m === null ? null : new Date(m * 60_000);
}
