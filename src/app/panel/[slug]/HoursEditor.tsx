"use client";

import { Copy, Plus, X } from "lucide-react";
import { useState } from "react";
import { POLISH_DAYS, formatHour, parseHours, saveHours, type Week } from "@/lib/hours";
import { field, smallButton } from "@/components/panel/style";

// Godziny otwarcia jako 7 wierszy (dzień: zamknięte albo od–do, opcjonalnie druga zmiana, np. po przerwie).
// Wynik idzie w ukrytym polu „godziny” w formacie OpenStreetMap, tak jak resztę danych czyta strona lokalu.

type Change = { od: string; do: string };
type Day = Change[];

const DEFAULTS: Change = { od: "10:00", do: "22:00" };

function toDays(hours: string | null): Day[] | null {
  const t = parseHours(hours);
  if (!t) return null;
  return t.map((ranges) => ranges.map(([s, k]) => ({ od: formatHour(s), do: formatHour(k) })));
}

const minutes = (g: string) => {
  const [h, m] = g.split(":").map(Number);
  return h * 60 + m;
};

function toText(days: Day[]) {
  if (days.every((d) => !d.length)) return "";
  const week: Week = days.map((d) =>
    d.map(({ od, do: doo }): [number, number] => {
      const s = minutes(od);
      const k = minutes(doo === "24:00" ? "00:00" : doo);
      return [s, k <= s ? k + 24 * 60 : k]; // do 02:00 = po północy
    }),
  );
  return saveHours(week);
}

export default function HoursEditor({ godziny }: { godziny: string | null }) {
  const initial = toDays(godziny);
  const [dni, setDni] = useState<Day[] | null>(initial);
  const unusual = !!godziny && !initial;

  const changeDay = (i: number, day: Day) => setDni((d) => d && d.map((x, j) => (j === i ? day : x)));

  if (!dni) {
    return (
      <div className="space-y-3">
        {unusual && (
          <p className="text-sm text-tekst-2">
            Obecny zapis godzin jest nietypowy (<code className="break-all">{godziny}</code>). Ustaw je od nowa.
          </p>
        )}
        {!unusual && <p className="text-sm text-tekst-2">Godziny otwarcia nie są jeszcze podane.</p>}
        {/* bez zmian zostaje to, co było */}
        <input type="hidden" name="godziny" value={godziny ?? ""} />
        <button
          type="button"
          onClick={() => setDni(POLISH_DAYS.map(() => [{ ...DEFAULTS }]))}
          className={`${smallButton} bg-krem`}
        >
          <Plus className="size-4" aria-hidden /> Ustaw godziny
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="godziny" value={toText(dni)} />
      {dni.map((day, i) => (
        <div key={POLISH_DAYS[i]} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-obrys py-2 last:border-0">
          <label className="flex w-36 shrink-0 items-center gap-2.5 font-extrabold">
            <input
              type="checkbox"
              checked={day.length > 0}
              onChange={(e) => changeDay(i, e.target.checked ? [{ ...(dni.find((d) => d.length)?.[0] ?? DEFAULTS) }] : [])}
              className="size-5 accent-akcent"
            />
            {POLISH_DAYS[i]}
          </label>
          {day.length ? (
            <div className="flex flex-1 flex-col gap-2">
              {day.map((z, k) => (
                <div key={k} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={z.od}
                    aria-label={`${POLISH_DAYS[i]}: otwarcie`}
                    onChange={(e) => changeDay(i, day.map((x, j) => (j === k ? { ...x, od: e.target.value } : x)))}
                    className={`${field} w-28 px-2.5 py-2`}
                    required
                  />
                  <span aria-hidden>–</span>
                  <input
                    type="time"
                    value={z.do === "24:00" ? "00:00" : z.do}
                    aria-label={`${POLISH_DAYS[i]}: zamknięcie`}
                    onChange={(e) => changeDay(i, day.map((x, j) => (j === k ? { ...x, do: e.target.value } : x)))}
                    className={`${field} w-28 px-2.5 py-2`}
                    required
                  />
                  {k > 0 ? (
                    <button
                      type="button"
                      onClick={() => changeDay(i, day.filter((_, j) => j !== k))}
                      aria-label="Usuń drugą zmianę"
                      className="flex size-9 items-center justify-center rounded-full hover:bg-krem"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  ) : (
                    day.length === 1 && (
                      <button
                        type="button"
                        onClick={() => changeDay(i, [...day, { od: "17:00", do: "22:00" }])}
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
        className={`${smallButton} mt-2 bg-krem`}
      >
        <Copy className="size-4" aria-hidden /> Wszystkie dni jak poniedziałek
      </button>
      <p className="text-xs text-tekst-2">Zamknięcie po północy (np. 02:00) też jest w porządku.</p>
    </div>
  );
}
