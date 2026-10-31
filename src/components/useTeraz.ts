"use client";

import { useSyncExternalStore } from "react";

// Aktualny czas z dokładnością do minuty, tylko w przeglądarce.
// Na serwerze (i przy pierwszym renderze) zwraca null, bo strona jest generowana z wyprzedzeniem
// i „teraz” serwera nie jest „teraz” użytkownika.
const minute = () => Math.floor(Date.now() / 60_000);

function subscribe(change: () => void) {
  const id = setInterval(change, 15_000);
  return () => clearInterval(id);
}

export function useNow(): Date | null {
  const m = useSyncExternalStore(subscribe, minute, () => null);
  return m === null ? null : new Date(m * 60_000);
}
