"use client";

import { BadgePercent, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { startTransition, useActionState, useState, useTransition } from "react";
import {
  etykieta,
  karta,
  komunikatBledu,
  komunikatOk,
  pole,
  podpowiedz,
  przyciskDrugi,
  przyciskGlowny,
  przyciskMaly,
} from "@/components/panel/style";
import { zl } from "@/lib/ceny";
import type { PromocjaEdycja } from "@/lib/panel/lokal";
import { opisTerminu } from "@/lib/terminPromocji";
import type { StanFormularza } from "../akcje";

type Danie = { nazwa: string; ceny: { wariant: string | null; gr: number }[] };
type Zapisz = (stan: StanFormularza, dane: FormData) => Promise<StanFormularza>;

const DNI = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

const PRZYKLADY = ["Druga pizza za pół ceny", "Lunch dnia 25 zł", "Happy hours: piwo 8 zł", "Darmowa dostawa od 60 zł"];

export default function Promocje({
  promocje,
  dania,
  zapisz,
  usun,
}: {
  promocje: PromocjaEdycja[];
  dania: Danie[];
  zapisz: Zapisz;
  usun: (id: number) => Promise<void>;
}) {
  // null = lista; "nowa" albo id = otwarty formularz
  const [edytowana, setEdytowana] = useState<"nowa" | number | null>(promocje.length ? null : "nowa");
  const [trwaUsuwanie, startUsuwanie] = useTransition();
  const [doUsuniecia, setDoUsuniecia] = useState<number | null>(null); // usuwanie w dwóch kliknięciach

  if (edytowana !== null) {
    return (
      <FormularzPromocji
        key={edytowana}
        promocja={edytowana === "nowa" ? null : (promocje.find((p) => p.id === edytowana) ?? null)}
        dania={dania}
        zapisz={zapisz}
        zamknij={promocje.length || edytowana !== "nowa" ? () => setEdytowana(null) : null}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-tekst-2">Promocje pokazują się na stronie lokalu nad menu, z terminem, kiedy obowiązują.</p>
      <ul className="space-y-3">
        {promocje.map((p) => (
          <li key={p.id} className={`${karta} flex items-start gap-3 ${p.aktywna ? "" : "opacity-60"}`}>
            <BadgePercent className="mt-0.5 size-6 shrink-0 text-akcent-tekst" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-black">{p.tytul}</p>
              {p.opis && <p className="text-sm text-tekst-2">{p.opis}</p>}
              <p className="mt-1 text-sm">
                {opisTerminu(p)}
                {p.danie && p.cenaGr !== null && (
                  <>
                    {" · "}
                    {p.danie}
                    {p.wariant ? ` ${p.wariant}` : ""} za <b>{zl(p.cenaGr)}</b>
                  </>
                )}
              </p>
              {!p.aktywna && <p className="mt-1 text-xs font-bold">Wyłączona — nie widać jej na stronie</p>}
            </div>
            <button
              type="button"
              onClick={() => setEdytowana(p.id)}
              aria-label={`Edytuj: ${p.tytul}`}
              className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-krem"
            >
              <Pencil className="size-4" aria-hidden />
            </button>
            {doUsuniecia === p.id ? (
              <button
                type="button"
                disabled={trwaUsuwanie}
                onClick={() => startUsuwanie(() => usun(p.id))}
                onBlur={() => setDoUsuniecia(null)}
                autoFocus
                className={`${przyciskMaly} shrink-0 bg-zamkniete text-white`}
              >
                Usuń
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDoUsuniecia(p.id)}
                aria-label={`Usuń: ${p.tytul}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-tekst-2 hover:bg-zamkniete/10 hover:text-zamkniete"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setEdytowana("nowa")} className={przyciskGlowny}>
        <Plus className="size-5" aria-hidden /> Dodaj promocję
      </button>
    </div>
  );
}

function FormularzPromocji({
  promocja,
  dania,
  zapisz,
  zamknij,
}: {
  promocja: PromocjaEdycja | null;
  dania: Danie[];
  zapisz: Zapisz;
  zamknij: (() => void) | null;
}) {
  const [stan, akcja, trwa] = useActionState(zapisz, {} satisfies StanFormularza);
  const [tytul, setTytul] = useState(promocja?.tytul ?? "");
  const [danie, setDanie] = useState(promocja?.danie ?? "");
  const [wariant, setWariant] = useState(promocja?.wariant ?? "");
  const wybrane = dania.find((d) => d.nazwa === danie);
  const regularna =
    wybrane && (wybrane.ceny.length === 1 ? wybrane.ceny[0] : wybrane.ceny.find((c) => c.wariant === wariant));

  if (stan.ok && !trwa && zamknij) {
    return (
      <div className="space-y-4">
        <p role="status" className={`flex items-center gap-2 ${komunikatOk}`}>
          <Check className="size-4" aria-hidden /> {stan.ok}
        </p>
        <button type="button" onClick={zamknij} className={przyciskDrugi}>
          Wróć do listy promocji
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const pola = new FormData(e.currentTarget);
        startTransition(() => akcja(pola));
      }}
      className="space-y-5"
    >
      {promocja && <input type="hidden" name="id" value={promocja.id} />}
      <section className={`${karta} space-y-4`}>
        <h2 className="text-lg font-black">{promocja ? "Edytuj promocję" : "Nowa promocja"}</h2>
        <div>
          <label htmlFor="tytul" className={etykieta}>
            Tytuł
          </label>
          <input
            id="tytul"
            name="tytul"
            required
            maxLength={80}
            value={tytul}
            onChange={(e) => setTytul(e.target.value)}
            placeholder="np. Druga pizza za pół ceny"
            className={pole}
          />
          {!tytul && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRZYKLADY.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTytul(p)}
                  className="rounded-full bg-krem px-3 py-1 text-xs font-bold transition hover:bg-obrys"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="opis" className={etykieta}>
            Szczegóły <span className="font-normal text-tekst-2">(opcjonalnie)</span>
          </label>
          <textarea
            id="opis"
            name="opis"
            rows={2}
            maxLength={300}
            defaultValue={promocja?.opis ?? ""}
            placeholder="np. tańsza pizza gratis, tylko na miejscu i na wynos"
            className={pole}
          />
        </div>
      </section>

      <section className={`${karta} space-y-4`}>
        <h2 className="text-lg font-black">Kiedy</h2>
        <fieldset>
          <legend className={etykieta}>Dni tygodnia</legend>
          <div className="flex flex-wrap gap-1.5">
            {DNI.map((d, i) => (
              <label
                key={d}
                className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-obrys-2 text-sm font-extrabold transition has-checked:border-akcent has-checked:bg-akcent has-checked:text-na-akcencie"
              >
                <input type="checkbox" name="dni" value={i} defaultChecked={promocja?.dni.includes(i)} className="sr-only" />
                {d}
              </label>
            ))}
          </div>
          <p className={podpowiedz}>Bez zaznaczenia = codziennie.</p>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="odGodz" className={etykieta}>
              Od godziny
            </label>
            <input id="odGodz" name="odGodz" type="time" defaultValue={promocja?.odGodz ?? ""} className={pole} />
          </div>
          <div>
            <label htmlFor="doGodz" className={etykieta}>
              Do godziny
            </label>
            <input id="doGodz" name="doGodz" type="time" defaultValue={promocja?.doGodz ?? ""} className={pole} />
          </div>
          <div>
            <label htmlFor="odDnia" className={etykieta}>
              Od dnia
            </label>
            <input id="odDnia" name="odDnia" type="date" defaultValue={promocja?.odDnia ?? ""} className={pole} />
          </div>
          <div>
            <label htmlFor="doDnia" className={etykieta}>
              Do dnia
            </label>
            <input id="doDnia" name="doDnia" type="date" defaultValue={promocja?.doDnia ?? ""} className={pole} />
          </div>
        </div>
        <p className={podpowiedz}>Puste pola = bez ograniczeń (cały dzień, bez daty końca).</p>
      </section>

      {dania.length > 0 && (
        <section className={`${karta} space-y-4`}>
          <h2 className="text-lg font-black">Niższa cena dania</h2>
          <p className="text-sm text-tekst-2">
            Jeśli promocja obniża cenę jednego dania z menu, wybierz je — przy cenie promocyjnej pokażemy najniższą cenę
            z 30 dni przed obniżką, tak jak wymaga prawo.
          </p>
          <div>
            <label htmlFor="danie" className={etykieta}>
              Danie
            </label>
            <select
              id="danie"
              name="danie"
              value={danie}
              onChange={(e) => {
                setDanie(e.target.value);
                setWariant("");
              }}
              className={pole}
            >
              <option value="">— promocja bez obniżki ceny dania —</option>
              {dania.map((d) => (
                <option key={d.nazwa} value={d.nazwa}>
                  {d.nazwa}
                </option>
              ))}
            </select>
          </div>
          {wybrane && wybrane.ceny.length > 1 && (
            <div>
              <label htmlFor="wariant" className={etykieta}>
                Wariant
              </label>
              <select id="wariant" name="wariant" value={wariant} onChange={(e) => setWariant(e.target.value)} required className={pole}>
                <option value="">wybierz…</option>
                {wybrane.ceny.map((c) => (
                  <option key={c.wariant} value={c.wariant ?? ""}>
                    {c.wariant} — {zl(c.gr)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {wybrane && (
            <div>
              <label htmlFor="cena" className={etykieta}>
                Cena promocyjna {regularna && <span className="font-normal text-tekst-2">(w menu: {zl(regularna.gr)})</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="cena"
                  name="cena"
                  required
                  inputMode="decimal"
                  defaultValue={promocja?.cenaGr ? String(promocja.cenaGr / 100).replace(".", ",") : ""}
                  className={`${pole} w-32 text-right font-bold`}
                />
                <span className="text-tekst-2">zł</span>
              </div>
            </div>
          )}
        </section>
      )}

      <label className="flex items-center gap-3 font-bold">
        <input type="checkbox" name="aktywna" value="tak" defaultChecked={promocja?.aktywna ?? true} className="size-5 accent-akcent" />
        Pokazuj na stronie lokalu
      </label>

      <div className="sticky bottom-0 z-30 -mx-4 border-t border-obrys bg-tlo/95 px-4 py-3 backdrop-blur">
        {stan.blad && (
          <p role="alert" className={`mb-3 ${komunikatBledu}`}>
            {stan.blad}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={trwa} className={`${przyciskGlowny} flex-1 sm:flex-none`}>
            {trwa ? "Zapisuję…" : promocja ? "Zapisz zmiany" : "Dodaj promocję"}
          </button>
          {zamknij && (
            <button type="button" onClick={zamknij} className={`${przyciskMaly} h-12 px-5`}>
              Anuluj
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
