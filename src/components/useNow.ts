"use client";

import { useSyncExternalStore } from "react";

// The current time to the minute, only in the browser. On the server (and on the first render) it returns null, because
// the page is generated ahead of time and the server's „now” is not the user's „now”.
const minute = () => Math.floor(Date.now() / 60_000);

function subscribe(change: () => void) {
  const id = setInterval(change, 15_000);
  return () => clearInterval(id);
}

export function useNow(): Date | null {
  const m = useSyncExternalStore(subscribe, minute, () => null);
  return m === null ? null : new Date(m * 60_000);
}
