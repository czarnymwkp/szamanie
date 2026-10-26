"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { etykieta, karta, komunikatBledu, komunikatOk, pole, podpowiedz, przyciskGlowny, przyciskMaly } from "@/components/panel/style";
import type { StrefaEdycja } from "@/lib/panel/lokal";
import type { StanFormularza } from "../akcje";

type Strefa = StrefaEdycja & { k: string };

let licznik = 0;
const klucz = () => `s${++licznik}`;
const pusta = (): Strefa => ({ k: klucz(), nazwa: "", miejsca: "", cena: "", minimum: "" });

export default function EdytorDostawy({
  strefy: poczatkowe,
  uwagi: poczatkoweUwagi,
  miejscowosci,
  zapisz,
}: {
  strefy: StrefaEdycja[];
  uwagi: string;
  miejscowosci: string[];
  zapisz: (strefy: StrefaEdycja[], uwagi: string) => Promise<StanFormularza>;
}) {
  const [strefy, setStrefy] = useState<Strefa[]>(() =>
    poczatkowe.length ? poczatkowe.map((s) => ({ ...s, k: klucz() })) : [pusta()],
  );
  const [uwagi, setUwagi] = useState(poczatkoweUwagi);
  const [stan, setStan] = useState<StanFormularza>({});
  const [trwa, startTransition] = useTransition();
  const [zapisane, setZapisane] = useState(() => JSON.stringify([poczatkowe, poczatkoweUwagi]));
  const bezKluczy = strefy.map(({ nazwa, miejsca, cena, minimum }) => ({ nazwa, miejsca, cena, minimum }));
  const zmienione =
    JSON.stringify([bezKluczy.filter((s) => s.nazwa || s.miejsca || s.cena || s.minimum), uwagi]) !== zapisane;

  useEffect(() => {
    if (!zmienione) return;
    const ostrzez = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", ostrzez);
    return () => window.removeEventListener("beforeunload", ostrzez);
  }, [zmienione]);

  const zmien = (k: string, pole: keyof StrefaEdycja, v: string) => {
    setStan({});
    setStrefy((l) => l.map((s) => (s.k === k ? { ...s, [pole]: v } : s)));
  };

  function zapiszWszystko() {
    startTransition(async () => {
      const wynik = await zapisz(bezKluczy, uwagi);
      setStan(wynik);
      if (wynik.ok) setZapisane(JSON.stringify([bezKluczy.filter((s) => s.nazwa || s.miejsca || s.cena || s.minimum), uwagi]));
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
          <li key={s.k} className={`${karta} space-y-3`}>
            <div className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-krem text-sm font-black">
                {i + 1}
              </span>
              <input
                value={s.nazwa}
                onChange={(e) => zmien(s.k, "nazwa", e.target.value)}
                list="miejscowosci"
                placeholder="Strefa, np. Kraśnik albo Kraśnik Fabryczny"
                aria-label="Nazwa strefy"
                maxLength={80}
                className={`${pole} font-extrabold`}
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
              <label className={etykieta} htmlFor={`miejsca-${i}`}>
                Miejscowości w strefie <span className="font-normal text-tekst-2">(po przecinku)</span>
              </label>
              <input
                id={`miejsca-${i}`}
                value={s.miejsca}
                onChange={(e) => zmien(s.k, "miejsca", e.target.value)}
                placeholder="np. Budzyń, Wyżnianka"
                className={pole}
              />
              <p className={podpowiedz}>Puste, gdy nazwa strefy to jedna miejscowość.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={etykieta}>Cena dostawy</span>
                <span className="flex items-center gap-2">
                  <input
                    value={s.cena}
                    onChange={(e) => zmien(s.k, "cena", e.target.value)}
                    inputMode="decimal"
                    placeholder="np. 5"
                    className={`${pole} text-right`}
                  />
                  <span className="text-tekst-2">zł</span>
                </span>
              </label>
              <label className="block">
                <span className={etykieta}>Zamówienie od</span>
                <span className="flex items-center gap-2">
                  <input
                    value={s.minimum}
                    onChange={(e) => zmien(s.k, "minimum", e.target.value)}
                    inputMode="decimal"
                    placeholder="bez minimum"
                    className={`${pole} text-right`}
                  />
                  <span className="text-tekst-2">zł</span>
                </span>
              </label>
            </div>
            <p className={podpowiedz}>Cena 0 = dostawa gratis. Puste pole = nie podajecie.</p>
          </li>
        ))}
      </ul>

      <button type="button" onClick={() => setStrefy((l) => [...l, pusta()])} className={`${przyciskMaly} h-11 bg-krem px-5`}>
        <Plus className="size-4" aria-hidden /> Dodaj strefę
      </button>

      <div className={karta}>
        <label htmlFor="uwagi" className={etykieta}>
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
          className={pole}
        />
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 border-t border-obrys bg-tlo/95 px-4 py-3 backdrop-blur">
        {stan.blad && (
          <p role="alert" className={`mb-3 ${komunikatBledu}`}>
            {stan.blad}
          </p>
        )}
        {stan.ok && !zmienione && (
          <p role="status" className={`mb-3 flex items-center gap-2 ${komunikatOk}`}>
            <Check className="size-4" aria-hidden /> {stan.ok}
          </p>
        )}
        <button
          type="button"
          onClick={zapiszWszystko}
          disabled={!zmienione || trwa}
          className={`${przyciskGlowny} w-full sm:w-auto`}
        >
          {trwa ? "Zapisuję…" : "Zapisz dostawę"}
        </button>
      </div>
    </div>
  );
}
