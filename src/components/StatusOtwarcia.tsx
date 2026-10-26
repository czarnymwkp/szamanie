"use client";

import { useMemo } from "react";
import { opisStatusu, parsujGodziny, statusOtwarcia } from "@/lib/godziny";
import { useTeraz } from "./useTeraz";

export default function StatusOtwarcia({
  godziny,
  className = "",
  ciemne = false,
}: {
  godziny: string | null;
  className?: string;
  ciemne?: boolean; // jaśniejsze kolory na ciemnym tle
}) {
  const teraz = useTeraz();
  const tydzien = useMemo(() => parsujGodziny(godziny), [godziny]);
  if (!tydzien) return null;
  // Zanim przeglądarka poda godzinę, trzymamy miejsce, żeby lista nie skakała.
  if (!teraz) return <p className={`invisible ${className}`} aria-hidden>Otwarte</p>;

  const status = statusOtwarcia(tydzien, teraz);
  const kolor = status.otwarte
    ? ciemne
      ? "text-[#4ade80]"
      : "text-otwarte"
    : ciemne
      ? "text-[#fca5a5]"
      : "text-zamkniete";
  const kropka = ciemne ? "bg-[#4ade80]" : "bg-otwarte";
  return (
    <p className={`flex items-center gap-2 font-extrabold ${kolor} ${className}`}>
      {status.otwarte && (
        <span className="relative flex size-2.5 shrink-0" aria-hidden>
          <span className={`absolute inline-flex size-full animate-puls rounded-full ${kropka}`} />
          <span className={`relative inline-flex size-2.5 rounded-full ${kropka}`} />
        </span>
      )}
      {opisStatusu(status, teraz)}
    </p>
  );
}
