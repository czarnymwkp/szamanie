"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { label, card, errorMessage, okMessage, field, hint, primaryButton, smallButton } from "@/components/panel/style";
import type { ZoneDraft } from "@/lib/panel/venue";
import type { FormState } from "../actions";

type Zone = ZoneDraft & { k: string };

let counter = 0;
const key = () => `s${++counter}`;
const emptyList = (): Zone => ({ k: key(), nazwa: "", miejsca: "", cena: "", minimum: "" });

export default function DeliveryEditor({
  strefy: poczatkowe,
  uwagi: poczatkoweUwagi,
  miejscowosci,
  zapisz,
}: {
  strefy: ZoneDraft[];
  uwagi: string;
  miejscowosci: string[];
  zapisz: (zones: ZoneDraft[], notes: string) => Promise<FormState>;
}) {
  const [strefy, setStrefy] = useState<Zone[]>(() =>
    poczatkowe.length ? poczatkowe.map((s) => ({ ...s, k: key() })) : [emptyList()],
  );
  const [uwagi, setUwagi] = useState(poczatkoweUwagi);
  const [stan, setStan] = useState<FormState>({});
  const [trwa, startTransition] = useTransition();
  const [zapisane, setZapisane] = useState(() => JSON.stringify([poczatkowe, poczatkoweUwagi]));
  const withoutKeys = strefy.map(({ nazwa, miejsca, cena, minimum }) => ({ nazwa, miejsca, cena, minimum }));
  const changed =
    JSON.stringify([withoutKeys.filter((s) => s.nazwa || s.miejsca || s.cena || s.minimum), uwagi]) !== zapisane;

  useEffect(() => {
    if (!changed) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  const change = (k: string, field: keyof ZoneDraft, v: string) => {
    setStan({});
    setStrefy((l) => l.map((s) => (s.k === k ? { ...s, [field]: v } : s)));
  };

  function saveAll() {
    startTransition(async () => {
      const result = await zapisz(withoutKeys, uwagi);
      setStan(result);
      if (result.ok) setZapisane(JSON.stringify([withoutKeys.filter((s) => s.nazwa || s.miejsca || s.cena || s.minimum), uwagi]));
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-tekst-2">
        Dokąd dowozicie, za ile i od jakiej kwoty zamówienia. Klient widzi to na stronie lokalu i w podsumowaniu listy
        dań.
      </p>
      <datalist id="miejscowosci">
        {miejscowosci.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>

      <ul className="space-y-3">
        {strefy.map((s, i) => (
          <li key={s.k} className={`${card} space-y-3`}>
            <div className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-krem text-sm font-black">
                {i + 1}
              </span>
              <input
                value={s.nazwa}
                onChange={(e) => change(s.k, "nazwa", e.target.value)}
                list="miejscowosci"
                placeholder="Strefa, np. Kraśnik albo Kraśnik Fabryczny"
                aria-label="Nazwa strefy"
                maxLength={80}
                className={`${field} font-extrabold`}
              />
              <button
                type="button"
                onClick={() => setStrefy((l) => l.filter((x) => x.k !== s.k))}
                aria-label="Usuń strefę"
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-tekst-2 hover:bg-zamkniete/10 hover:text-zamkniete"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
            <div>
              <label className={label} htmlFor={`miejsca-${i}`}>
                Miejscowości w strefie <span className="font-normal text-tekst-2">(po przecinku)</span>
              </label>
              <input
                id={`miejsca-${i}`}
                value={s.miejsca}
                onChange={(e) => change(s.k, "miejsca", e.target.value)}
                placeholder="np. Budzyń, Wyżnianka"
                className={field}
              />
              <p className={hint}>Puste, gdy nazwa strefy to jedna miejscowość.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={label}>Cena dostawy</span>
                <span className="flex items-center gap-2">
                  <input
                    value={s.cena}
                    onChange={(e) => change(s.k, "cena", e.target.value)}
                    inputMode="decimal"
                    placeholder="np. 5"
                    className={`${field} text-right`}
                  />
                  <span className="text-tekst-2">zł</span>
                </span>
              </label>
              <label className="block">
                <span className={label}>Zamówienie od</span>
                <span className="flex items-center gap-2">
                  <input
                    value={s.minimum}
                    onChange={(e) => change(s.k, "minimum", e.target.value)}
                    inputMode="decimal"
                    placeholder="bez minimum"
                    className={`${field} text-right`}
                  />
                  <span className="text-tekst-2">zł</span>
                </span>
              </label>
            </div>
            <p className={hint}>Cena 0 = dostawa gratis. Puste pole = nie podajecie.</p>
          </li>
        ))}
      </ul>

      <button type="button" onClick={() => setStrefy((l) => [...l, emptyList()])} className={`${smallButton} h-11 bg-krem px-5`}>
        <Plus className="size-4" aria-hidden /> Dodaj strefę
      </button>

      <div className={card}>
        <label htmlFor="uwagi" className={label}>
          Uwagi do dostawy <span className="font-normal text-tekst-2">(opcjonalnie)</span>
        </label>
        <input
          id="uwagi"
          value={uwagi}
          onChange={(e) => {
            setStan({});
            setUwagi(e.target.value);
          }}
          maxLength={300}
          placeholder="np. dowozimy od 12:00 do 21:00"
          className={field}
        />
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 border-t border-obrys bg-tlo/95 px-4 py-3 backdrop-blur">
        {stan.blad && (
          <p role="alert" className={`mb-3 ${errorMessage}`}>
            {stan.blad}
          </p>
        )}
        {stan.ok && !changed && (
          <p role="status" className={`mb-3 flex items-center gap-2 ${okMessage}`}>
            <Check className="size-4" aria-hidden /> {stan.ok}
          </p>
        )}
        <button
          type="button"
          onClick={saveAll}
          disabled={!changed || trwa}
          className={`${primaryButton} w-full sm:w-auto`}
        >
          {trwa ? "Zapisuję…" : "Zapisz dostawę"}
        </button>
      </div>
    </div>
  );
}
