"use client";

import { useMemo } from "react";
import { statusDescription, parseHours, openingStatus } from "@/lib/godziny";
import { useNow } from "./useTeraz";

export default function OpeningStatus({
  godziny,
  className = "",
  ciemne = false,
}: {
  godziny: string | null;
  className?: string;
  ciemne?: boolean; // jaśniejsze kolory na ciemnym tle
}) {
  const now = useNow();
  const week = useMemo(() => parseHours(godziny), [godziny]);
  if (!week) return null;
  // Zanim przeglądarka poda godzinę, trzymamy miejsce, żeby lista nie skakała.
  if (!now) return <p className={`invisible ${className}`} aria-hidden>Otwarte</p>;

  const status = openingStatus(week, now);
  const color = status.otwarte
    ? ciemne
      ? "text-[#4ade80]"
      : "text-otwarte"
    : ciemne
      ? "text-[#fca5a5]"
      : "text-zamkniete";
  const dot = ciemne ? "bg-[#4ade80]" : "bg-otwarte";
  return (
    <p className={`flex items-center gap-2 font-extrabold ${color} ${className}`}>
      {status.otwarte && (
        <span className="relative flex size-2.5 shrink-0" aria-hidden>
          <span className={`absolute inline-flex size-full animate-puls rounded-full ${dot}`} />
          <span className={`relative inline-flex size-2.5 rounded-full ${dot}`} />
        </span>
      )}
      {statusDescription(status, now)}
    </p>
  );
}
