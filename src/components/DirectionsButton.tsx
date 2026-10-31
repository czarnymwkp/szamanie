"use client";

import type { MouseEvent, ReactNode } from "react";
import { directionsUrl } from "@/lib/format";

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
export default function DirectionsButton({ lokal, className, children, ...reszta }: Props) {
  const navigate = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!/Android/i.test(navigator.userAgent)) return;
    e.preventDefault();
    const label = encodeURIComponent(lokal.nazwa);
    window.location.href = `geo:${lokal.lat},${lokal.lon}?q=${lokal.lat},${lokal.lon}(${label})`;
  };

  return (
    <a
      href={directionsUrl(lokal)}
      target="_blank"
      rel="noopener"
      onClick={navigate}
      className={className}
      aria-label={reszta["aria-label"]}
    >
      {children}
    </a>
  );
}
