"use client";

import { Clock, Leaf, LoaderCircle, LocateFixed } from "lucide-react";
import { PROMIENIE, type Katalog } from "../useKatalog";

/**
 * Filtry listy lokali we wszystkich propozycjach: listek „Wege”, otwarte teraz, blisko mnie / miejscowość,
 * promień. Wygląd pigułek daje propozycja (`chip`), listek ma swój zielony stan włączenia.
 */
export default function FiltryM({
  k,
  chip,
  miejscowosci,
  className = "",
  wegeWlaczone = "border-[#15803d] bg-[#15803d] text-white",
}: {
  k: Katalog;
  chip: (aktywny: boolean) => string;
  miejscowosci: { nazwa: string }[];
  className?: string;
  wegeWlaczone?: string;
}) {
  const { pozycja } = k;
  return (
    <div className={className}>
      <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pt-1 pb-2 [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => k.setTylkoWege(!k.tylkoWege)}
          aria-pressed={k.tylkoWege}
          className={`${chip(false)} ${k.tylkoWege ? wegeWlaczone : ""}`}
        >
          <Leaf className={`size-4 ${k.tylkoWege ? "animate-kolysanie" : "text-[#15803d]"}`} aria-hidden />
          Wege
        </button>
        <button
          type="button"
          onClick={() => k.setTylkoOtwarte(!k.tylkoOtwarte)}
          aria-pressed={k.tylkoOtwarte}
          className={chip(k.tylkoOtwarte)}
        >
          <Clock className="size-4" aria-hidden /> Otwarte teraz
        </button>
        <button type="button" onClick={k.uzyjLokalizacji} aria-pressed={k.zLokalizacja} className={chip(k.zLokalizacja)}>
          {k.szukamPozycji ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <LocateFixed className="size-4" aria-hidden />
          )}
          Blisko mnie
        </button>
        <select
          value={pozycja && !k.zLokalizacja ? pozycja.opis : ""}
          onChange={(e) => k.wybierzMiejscowosc(e.target.value)}
          aria-label="Szukaj blisko miejscowości"
          className={`${chip(!!pozycja && !k.zLokalizacja)} max-w-48 appearance-none`}
        >
          <option value="">Miejscowość…</option>
          {miejscowosci.map((m) => (
            <option key={m.nazwa} value={m.nazwa}>
              {m.nazwa}
            </option>
          ))}
        </select>
        {pozycja &&
          PROMIENIE.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => k.setPromien(p)}
              aria-pressed={k.promien === p}
              className={chip(k.promien === p)}
            >
              {p} km
            </button>
          ))}
      </div>
      {k.bladPozycji && <p className="mt-1 text-sm font-bold text-zamkniete">{k.bladPozycji}</p>}
      {k.tylkoWege && (
        <p className="mt-1 flex items-center gap-1.5 text-xs font-bold opacity-75">
          <Leaf className="size-3.5" aria-hidden /> Lokale z daniami wegetariańskimi lub wegańskimi ({k.ileWege}).
        </p>
      )}
    </div>
  );
}
