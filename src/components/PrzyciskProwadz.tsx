"use client";

import type { MouseEvent, ReactNode } from "react";
import { linkNawigacji } from "@/lib/nazwy";

type Props = {
  lokal: { nazwa: string; lat: number; lon: number };
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

/**
 * „Prowadź do lokalu”. Na Androidzie otwiera systemowy wybór aplikacji nawigacyjnej (Google Maps, Waze,
 * Yanosik) przez link geo:, także wewnątrz aplikacji z Google Play. Gdzie indziej — trasa w Mapach Google.
 */
export default function PrzyciskProwadz({ lokal, className, children, ...reszta }: Props) {
  const prowadz = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!/Android/i.test(navigator.userAgent)) return;
    e.preventDefault();
    const etykieta = encodeURIComponent(lokal.nazwa);
    window.location.href = `geo:${lokal.lat},${lokal.lon}?q=${lokal.lat},${lokal.lon}(${etykieta})`;
  };

  return (
    <a
      href={linkNawigacji(lokal)}
      target="_blank"
      rel="noopener"
      onClick={prowadz}
      className={className}
      aria-label={reszta["aria-label"]}
    >
      {children}
    </a>
  );
}
