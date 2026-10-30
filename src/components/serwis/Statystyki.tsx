"use client";

import Script from "next/script";
import { useEffect } from "react";
import { UMAMI_ID, UMAMI_SRC } from "@/lib/konfiguracja";

declare global {
  interface Window {
    umami?: { track: (zdarzenie: string, dane?: Record<string, string>) => void };
  }
}

/**
 * Statystyki odwiedzin (Umami, bez ciasteczek) tylko na stronach serwisu, bez panelu. Do tego kliknięcia w telefon
 * i dojazd z każdej strony — jedno nasłuchiwanie zamiast znaczników przy każdym przycisku; telefon mówi, który lokal.
 */
export default function Statystyki() {
  useEffect(() => {
    if (!UMAMI_ID) return;
    const klik = (e: MouseEvent) => {
      const href = (e.target as Element).closest?.("a[href]")?.getAttribute("href") ?? "";
      const zdarzenie = href.startsWith("tel:") ? "Zadzwoń" : href.includes("google.com/maps") ? "Dojazd" : null;
      if (!zdarzenie) return;
      const dane: Record<string, string> = { strona: location.pathname };
      if (zdarzenie === "Zadzwoń") dane.telefon = href.slice(4);
      window.umami?.track(zdarzenie, dane);
    };
    document.addEventListener("click", klik, true);
    return () => document.removeEventListener("click", klik, true);
  }, []);

  if (!UMAMI_ID || !UMAMI_SRC) return null;
  return <Script src={UMAMI_SRC} data-website-id={UMAMI_ID} strategy="afterInteractive" />;
}
