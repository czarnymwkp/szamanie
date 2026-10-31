"use client";

import Script from "next/script";
import { useEffect } from "react";
import { UMAMI_ID, UMAMI_SRC } from "@/lib/konfiguracja";

declare global {
  interface Window {
    umami?: { track: (event: string, date?: Record<string, string>) => void };
  }
}

/**
 * Statystyki odwiedzin (Umami, bez ciasteczek) tylko na stronach serwisu, bez panelu. Do tego kliknięcia w telefon
 * i dojazd z każdej strony — jedno nasłuchiwanie zamiast znaczników przy każdym przycisku; telefon mówi, który lokal.
 */
export default function Analytics() {
  useEffect(() => {
    if (!UMAMI_ID) return;
    const onToggle = (e: MouseEvent) => {
      const href = (e.target as Element).closest?.("a[href]")?.getAttribute("href") ?? "";
      const event = href.startsWith("tel:") ? "Zadzwoń" : href.includes("google.com/maps") ? "Dojazd" : null;
      if (!event) return;
      const date: Record<string, string> = { strona: location.pathname };
      if (event === "Zadzwoń") date.telefon = href.slice(4);
      window.umami?.track(event, date);
    };
    document.addEventListener("click", onToggle, true);
    return () => document.removeEventListener("click", onToggle, true);
  }, []);

  if (!UMAMI_ID || !UMAMI_SRC) return null;
  return <Script src={UMAMI_SRC} data-website-id={UMAMI_ID} strategy="afterInteractive" />;
}
