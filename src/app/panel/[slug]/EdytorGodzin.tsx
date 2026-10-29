"use client";

import { Copy, Plus, X } from "lucide-react";
import { useState } from "react";
import { DNI_PL, formatGodz, parsujGodziny, zapiszGodziny, type Tydzien } from "@/lib/godziny";
import { pole, przyciskMaly } from "@/components/panel/style";

// Godziny otwarcia jako 7 wierszy (dzień: zamknięte albo od–do, opcjonalnie druga zmiana, np. po przerwie).
// Wynik idzie w ukrytym polu „godziny” w formacie OpenStreetMap, tak jak resztę danych czyta strona lokalu.

type Zmiana = { od: string; do: string };
type Dzien = Zmiana[];

const DOMYSLNIE: Zmiana = { od: "10:00", do: "22:00" };

function naDni(godziny: string | null): Dzien[] | null {
  const t = parsujGodziny(godziny);
  if (!t) return null;
  return t.map((przedzialy) => przedzialy.map(([s, k]) => ({ od: formatGodz(s), do: formatGodz(k) })));
}

const minuty = (g: string) => {
  const [h, m] = g.split(":").map(Number);
  return h * 60 + m;
};

function naTekst(dni: Dzien[]) {
  if (dni.every((d) => !d.length)) return "";
  const tydzien: Tydzien = dni.map((d) =>
    d.map(({ od, do: doo }): [number, number] => {
      const s = minuty(od);
      const k = minuty(doo === "24:00" ? "00:00" : doo);
      return [s, k <= s ? k + 24 * 60 : k]; // do 02:00 = po północy
    }),
  );
  return zapiszGodziny(tydzien);
}

export default function EdytorGodzin({ godziny }: { godziny: string | null }) {
  const poczatkowe = naDni(godziny);
  const [dni, setDni] = useState<Dzien[] | null>(poczatkowe);
  const nietypowe = !!godziny && !poczatkowe;

  const zmienDzien = (i: number, dzien: Dzien) => setDni((d) => d && d.map((x, j) => (j === i ? dzien : x)));

  if (!dni) {
    return (
      <div className="space-y-3">
        {nietypowe && (
          <p className="text-sm text-tekst-2">
            Obecny zapis godzin jest nietypowy (<code className="break-all">{godziny}</code>). Ustaw je od nowa.
          </p>
        )}
        {!nietypowe && <p className="text-sm text-tekst-2">Godziny otwarcia nie są jeszcze podane.</p>}
        {/* bez zmian zostaje to, co było */}
        <input type="hidden" name="godziny" value={godziny ?? ""} />
        <button
          type="button"
          onClick={() => setDni(DNI_PL.map(() => [{ ...DOMYSLNIE }]))}
          className={`${przyciskMaly} bg-krem`}
        >
          <Plus className="size-4" aria-hidden /> Ustaw godziny
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="godziny" value={naTekst(dni)} />
      {dni.map((dzien, i) => (
        <div key={DNI_PL[i]} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-obrys py-2 last:border-0">
          <label className="flex w-36 shrink-0 items-center gap-2.5 font-extrabold">
            <input
              type="checkbox"
              checked={dzien.length > 0}
              onChange={(e) => zmienDzien(i, e.target.checked ? [{ ...(dni.find((d) => d.length)?.[0] ?? DOMYSLNIE) }] : [])}
              className="size-5 accent-akcent"
            />
            {DNI_PL[i]}
          </label>
          {dzien.length ? (
            <div className="flex flex-1 flex-col gap-2">
              {dzien.map((z, k) => (
                <div key={k} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={z.od}
                    aria-label={`${DNI_PL[i]}: otwarcie`}
                    onChange={(e) => zmienDzien(i, dzien.map((x, j) => (j === k ? { ...x, od: e.target.value } : x)))}
                    className={`${pole} w-28 px-2.5 py-2`}
                    required
                  />
                  <span aria-hidden>–</span>
                  <input
                    type="time"
                    value={z.do === "24:00" ? "00:00" : z.do}
                    aria-label={`${DNI_PL[i]}: zamknięcie`}
                    onChange={(e) => zmienDzien(i, dzien.map((x, j) => (j === k ? { ...x, do: e.target.value } : x)))}
                    className={`${pole} w-28 px-2.5 py-2`}
                    required
                  />
                  {k > 0 ? (
                    <button
                      type="button"
                      onClick={() => zmienDzien(i, dzien.filter((_, j) => j !== k))}
                      aria-label="Usuń drugą zmianę"
                      className="flex size-9 items-center justify-center rounded-full hover:bg-krem"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  ) : (
                    dzien.length === 1 && (
                      <button
                        type="button"
                        onClick={() => zmienDzien(i, [...dzien, { od: "17:00", do: "22:00" }])}
                        title="Dodaj drugą zmianę (np. po przerwie)"
                        aria-label="Dodaj drugą zmianę"
                        className="flex size-9 items-center justify-center rounded-full text-tekst-2 hover:bg-krem"
                      >
                        <Plus className="size-4" aria-hidden />
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-tekst-2">nieczynne</span>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setDni(dni.map(() => dni[0].map((z) => ({ ...z }))))}
        className={`${przyciskMaly} mt-2 bg-krem`}
      >
        <Copy className="size-4" aria-hidden /> Wszystkie dni jak poniedziałek
      </button>
      <p className="text-xs text-tekst-2">Zamknięcie po północy (np. 02:00) też jest w porządku.</p>
    </div>
  );
}
