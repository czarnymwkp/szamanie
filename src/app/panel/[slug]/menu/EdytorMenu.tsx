"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { karta, komunikatBledu, komunikatOk, pole, przyciskGlowny, przyciskMaly } from "@/components/panel/style";
import type { CechaDania } from "@/lib/menu";
import type { DanieEdycja, SekcjaEdycja } from "@/lib/panel/lokal";
import { bezPolskich } from "@/lib/slug.mjs";
import type { StanMenu } from "../akcje";

// Edytor całego menu w przeglądarce; „Zapisz” wysyła je w całości (serwer sprawdza i zapisuje w jednej transakcji).
// Ceny zmienia się od razu na liście — to najczęstsza zmiana; resztę dania po rozwinięciu ołówkiem.

type Cena = { k: string; wariant: string; cena: string };
type Danie = Omit<DanieEdycja, "ceny"> & { k: string; ceny: Cena[] };
type Sekcja = Omit<SekcjaEdycja, "dania"> & { k: string; dania: Danie[] };

const CECHY: { id: CechaDania; nazwa: string }[] = [
  { id: "wege", nazwa: "wege" },
  { id: "ostre", nazwa: "ostre" },
  { id: "polecane", nazwa: "polecane" },
  { id: "sezonowe", nazwa: "sezonowe" },
];

// klucze Reacta dla nowych wierszy (crypto.randomUUID nie działa na http:// z telefonu w sieci domowej)
let licznik = 0;
const klucz = () => `k${++licznik}`;

const zKluczami = (menu: SekcjaEdycja[]): Sekcja[] =>
  menu.map((s) => ({
    ...s,
    k: klucz(),
    dania: s.dania.map((d) => ({ ...d, k: klucz(), ceny: d.ceny.map((c) => ({ ...c, k: klucz() })) })),
  }));

const bezKluczy = (sekcje: Sekcja[]): SekcjaEdycja[] =>
  sekcje.map(({ nazwa, opis, dania }) => ({
    nazwa,
    opis,
    dania: dania.map(({ id, nazwa, opis, ceny, cechy }) => ({
      id,
      nazwa,
      opis,
      ceny: ceny.map(({ wariant, cena }) => ({ wariant, cena })),
      cechy,
    })),
  }));

const przesun = <T,>(lista: T[], i: number, o: number) => {
  const j = i + o;
  if (j < 0 || j >= lista.length) return lista;
  const nowa = [...lista];
  [nowa[i], nowa[j]] = [nowa[j], nowa[i]];
  return nowa;
};

const nowaCena = (): Cena => ({ k: klucz(), wariant: "", cena: "" });

export default function EdytorMenu({
  menu,
  zapisz,
}: {
  menu: SekcjaEdycja[];
  zapisz: (menu: SekcjaEdycja[]) => Promise<StanMenu>;
}) {
  const [sekcje, setSekcje] = useState(() => zKluczami(menu));
  const [zapisane, setZapisane] = useState(() => JSON.stringify(bezKluczy(zKluczami(menu))));
  const [otwarte, setOtwarte] = useState<Set<string>>(() => new Set(menu.length <= 3 ? sekcje.map((s) => s.k) : []));
  const [edytowane, setEdytowane] = useState<string | null>(null);
  const [fraza, setFraza] = useState("");
  const [stan, setStan] = useState<StanMenu>({});
  const [trwa, startTransition] = useTransition();

  const zmienione = JSON.stringify(bezKluczy(sekcje)) !== zapisane;

  // ostrzeżenie przy zamykaniu karty z niezapisanymi zmianami
  useEffect(() => {
    if (!zmienione) return;
    const ostrzez = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", ostrzez);
    return () => window.removeEventListener("beforeunload", ostrzez);
  }, [zmienione]);

  const zmienSekcje = (k: string, f: (s: Sekcja) => Sekcja) => {
    setStan({});
    setSekcje((lista) => lista.map((s) => (s.k === k ? f(s) : s)));
  };
  const zmienDanie = (ks: string, kd: string, f: (d: Danie) => Danie) =>
    zmienSekcje(ks, (s) => ({ ...s, dania: s.dania.map((d) => (d.k === kd ? f(d) : d)) }));

  const przelacz = (k: string) =>
    setOtwarte((o) => {
      const n = new Set(o);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  function dodajSekcje() {
    const s: Sekcja = { k: klucz(), nazwa: "", opis: "", dania: [] };
    setSekcje((lista) => [...lista, s]);
    setOtwarte((o) => new Set(o).add(s.k));
  }

  function dodajDanie(ks: string) {
    const d: Danie = { k: klucz(), id: null, nazwa: "", opis: "", ceny: [nowaCena()], cechy: [] };
    zmienSekcje(ks, (s) => ({ ...s, dania: [...s.dania, d] }));
    setEdytowane(d.k);
  }

  function przeniesDanie(ks: string, kd: string, doSekcji: string) {
    setSekcje((lista) => {
      const danie = lista.find((s) => s.k === ks)?.dania.find((d) => d.k === kd);
      if (!danie) return lista;
      return lista.map((s) =>
        s.k === ks
          ? { ...s, dania: s.dania.filter((d) => d.k !== kd) }
          : s.k === doSekcji
            ? { ...s, dania: [...s.dania, danie] }
            : s,
      );
    });
    setOtwarte((o) => new Set(o).add(doSekcji));
  }

  function zapiszWszystko() {
    startTransition(async () => {
      const wynik = await zapisz(bezKluczy(sekcje));
      setStan(wynik);
      if (wynik.menu) {
        const nowe = zKluczami(wynik.menu);
        // otwarte działy zostają otwarte (po nazwie — klucze są nowe)
        const nazwyOtwartych = new Set(sekcje.filter((s) => otwarte.has(s.k)).map((s) => s.nazwa));
        setSekcje(nowe);
        setOtwarte(new Set(nowe.filter((s) => nazwyOtwartych.has(s.nazwa)).map((s) => s.k)));
        setZapisane(JSON.stringify(bezKluczy(nowe)));
        setEdytowane(null);
      }
    });
  }

  const f = bezPolskich(fraza.trim());
  const pasuje = (d: Danie) => !f || bezPolskich(`${d.nazwa} ${d.opis}`).includes(f);
  const liczbaDan = sekcje.reduce((n, s) => n + s.dania.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-56">
          <span className="sr-only">Szukaj dania</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-tekst-2" aria-hidden />
          <input
            value={fraza}
            onChange={(e) => setFraza(e.target.value)}
            placeholder={`Szukaj wśród ${liczbaDan} dań`}
            className={`${pole} pl-11`}
          />
        </label>
        <button
          type="button"
          onClick={() => setOtwarte(new Set(otwarte.size ? [] : sekcje.map((s) => s.k)))}
          className={`${przyciskMaly} bg-krem`}
        >
          {otwarte.size ? "Zwiń działy" : "Rozwiń działy"}
        </button>
      </div>

      {!sekcje.length && (
        <p className={`${karta} text-tekst-2`}>
          Menu jest puste. Dodaj pierwszy dział (np. „Pizza”), a w nim dania z cenami.
        </p>
      )}

      {sekcje.map((s, i) => {
        const widoczne = s.dania.filter(pasuje);
        if (f && !widoczne.length) return null;
        const otwarta = !!f || otwarte.has(s.k);
        return (
          <section key={s.k} className={`${karta} p-0`}>
            <div className="flex items-center gap-1.5 p-3 sm:p-4">
              <button
                type="button"
                onClick={() => przelacz(s.k)}
                aria-expanded={otwarta}
                aria-label={otwarta ? "Zwiń dział" : "Rozwiń dział"}
                className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-krem"
              >
                <ChevronDown className={`size-5 transition ${otwarta ? "" : "-rotate-90"}`} aria-hidden />
              </button>
              <input
                value={s.nazwa}
                onChange={(e) => zmienSekcje(s.k, (x) => ({ ...x, nazwa: e.target.value }))}
                placeholder="Nazwa działu, np. Pizza"
                aria-label="Nazwa działu"
                maxLength={80}
                className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-lg font-black outline-none focus:bg-krem"
              />
              <span className="shrink-0 text-sm text-tekst-2">{s.dania.length}</span>
              <PrzyciskiKolejnosci
                gora={() => setSekcje((l) => przesun(l, i, -1))}
                dol={() => setSekcje((l) => przesun(l, i, 1))}
                co="dział"
              />
              <Usun
                co="dział"
                pytanie={s.dania.length ? `Usunąć dział z ${s.dania.length} daniami?` : "Usunąć dział?"}
                usun={() => setSekcje((l) => l.filter((x) => x.k !== s.k))}
              />
            </div>

            {otwarta && (
              <div className="border-t border-obrys">
                <input
                  value={s.opis}
                  onChange={(e) => zmienSekcje(s.k, (x) => ({ ...x, opis: e.target.value }))}
                  placeholder="Opis działu (opcjonalnie), np. „do każdej pizzy sos gratis”"
                  aria-label="Opis działu"
                  maxLength={200}
                  className="w-full bg-transparent px-5 py-2.5 text-sm text-tekst-2 outline-none focus:bg-krem"
                />
                <ul className="divide-y divide-obrys border-t border-obrys">
                  {widoczne.map((d) => (
                    <li key={d.k}>
                      {edytowane === d.k ? (
                        <EdycjaDania
                          danie={d}
                          sekcje={sekcje}
                          sekcja={s.k}
                          zmien={(fn) => zmienDanie(s.k, d.k, fn)}
                          przenies={(doSekcji) => przeniesDanie(s.k, d.k, doSekcji)}
                          kolejnosc={(o) =>
                            zmienSekcje(s.k, (x) => ({ ...x, dania: przesun(x.dania, x.dania.indexOf(d), o) }))
                          }
                          usun={() => zmienSekcje(s.k, (x) => ({ ...x, dania: x.dania.filter((y) => y.k !== d.k) }))}
                          zamknij={() => setEdytowane(null)}
                        />
                      ) : (
                        <WierszDania danie={d} zmien={(fn) => zmienDanie(s.k, d.k, fn)} edytuj={() => setEdytowane(d.k)} />
                      )}
                    </li>
                  ))}
                </ul>
                {!f && (
                  <button
                    type="button"
                    onClick={() => dodajDanie(s.k)}
                    className="flex w-full items-center gap-2 border-t border-obrys px-5 py-3.5 text-sm font-extrabold text-akcent-tekst transition hover:bg-krem"
                  >
                    <Plus className="size-4" aria-hidden /> Dodaj danie
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}

      {f && sekcje.every((s) => !s.dania.some(pasuje)) && <p className="text-tekst-2">Nic nie pasuje do „{fraza}”.</p>}

      {!f && (
        <button type="button" onClick={dodajSekcje} className={`${przyciskMaly} h-11 bg-krem px-5`}>
          <Plus className="size-4" aria-hidden /> Dodaj dział
        </button>
      )}

      {/* pasek zapisu przyklejony do dołu ekranu */}
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={zapiszWszystko}
            disabled={!zmienione || trwa}
            className={`${przyciskGlowny} flex-1 sm:flex-none`}
          >
            {trwa ? "Zapisuję…" : "Zapisz menu"}
          </button>
          {zmienione && !trwa && <span className="text-sm font-bold text-akcent-tekst">Masz niezapisane zmiany</span>}
        </div>
      </div>
    </div>
  );
}

function opisCen(d: Danie) {
  return d.ceny.filter((c) => c.cena || c.wariant);
}

/** Zwinięte danie: nazwa i pola cen do szybkiej zmiany. */
function WierszDania({ danie, zmien, edytuj }: { danie: Danie; zmien: (f: (d: Danie) => Danie) => void; edytuj: () => void }) {
  const ceny = opisCen(danie);
  return (
    <div className="flex items-start gap-2 px-4 py-3 sm:items-center sm:px-5">
      <button type="button" onClick={edytuj} className="min-w-0 flex-1 text-left">
        <span className={`block font-extrabold ${danie.nazwa ? "" : "text-tekst-2 italic"}`}>
          {danie.nazwa || "Nowe danie"}
        </span>
        {danie.opis && <span className="line-clamp-1 text-sm text-tekst-2">{danie.opis}</span>}
      </button>
      <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center">
        {ceny.length ? (
          ceny.map((c) => (
            <label key={c.k} className="flex items-center gap-1.5 text-sm">
              {c.wariant && <span className="text-tekst-2">{c.wariant}</span>}
              <input
                value={c.cena}
                onChange={(e) =>
                  zmien((d) => ({ ...d, ceny: d.ceny.map((x) => (x.k === c.k ? { ...x, cena: e.target.value } : x)) }))
                }
                inputMode="decimal"
                aria-label={`Cena: ${danie.nazwa}${c.wariant ? `, ${c.wariant}` : ""}`}
                className="w-20 rounded-lg border border-obrys-2 bg-white px-2 py-1.5 text-right text-[16px] font-bold outline-none focus:border-akcent"
              />
              <span className="text-tekst-2">zł</span>
            </label>
          ))
        ) : (
          <span className="text-sm text-tekst-2">bez ceny</span>
        )}
      </div>
      <button
        type="button"
        onClick={edytuj}
        aria-label={`Edytuj: ${danie.nazwa || "nowe danie"}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-tekst-2 hover:bg-krem hover:text-tekst"
      >
        <Pencil className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function EdycjaDania({
  danie,
  sekcje,
  sekcja,
  zmien,
  przenies,
  kolejnosc,
  usun,
  zamknij,
}: {
  danie: Danie;
  sekcje: Sekcja[];
  sekcja: string;
  zmien: (f: (d: Danie) => Danie) => void;
  przenies: (doSekcji: string) => void;
  kolejnosc: (o: number) => void;
  usun: () => void;
  zamknij: () => void;
}) {
  const zmienCene = (k: string, pole: "wariant" | "cena", v: string) =>
    zmien((d) => ({ ...d, ceny: d.ceny.map((c) => (c.k === k ? { ...c, [pole]: v } : c)) }));
  const kilka = danie.ceny.length > 1;
  const zWariantem = kilka || !!danie.ceny[0]?.wariant; // np. jedna cena „0,5 l”

  return (
    <div className="space-y-3 bg-krem/50 px-4 py-4 sm:px-5">
      <input
        value={danie.nazwa}
        onChange={(e) => zmien((d) => ({ ...d, nazwa: e.target.value }))}
        placeholder="Nazwa dania, np. Margherita"
        aria-label="Nazwa dania"
        maxLength={120}
        autoFocus={!danie.nazwa}
        className={`${pole} font-extrabold`}
      />
      <textarea
        value={danie.opis}
        onChange={(e) => zmien((d) => ({ ...d, opis: e.target.value }))}
        placeholder="Skład albo opis (opcjonalnie), np. sos pomidorowy, mozzarella"
        aria-label="Opis dania"
        rows={2}
        maxLength={500}
        className={pole}
      />

      <div className="space-y-2">
        {danie.ceny.map((c) => (
          <div key={c.k} className="flex items-center gap-2">
            {zWariantem && (
              <input
                value={c.wariant}
                onChange={(e) => zmienCene(c.k, "wariant", e.target.value)}
                placeholder="wariant, np. 32 cm"
                aria-label="Wariant"
                maxLength={40}
                className={`${pole} min-w-0 flex-1`}
              />
            )}
            <input
              value={c.cena}
              onChange={(e) => zmienCene(c.k, "cena", e.target.value)}
              placeholder="cena"
              aria-label="Cena w złotych"
              inputMode="decimal"
              className={`${pole} w-28 text-right font-bold`}
            />
            <span className="text-tekst-2">zł</span>
            {kilka && (
              <button
                type="button"
                onClick={() => zmien((d) => ({ ...d, ceny: d.ceny.filter((x) => x.k !== c.k) }))}
                aria-label="Usuń cenę"
                className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-obrys"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
        ))}
        {danie.ceny.length < 6 && (
          <button
            type="button"
            onClick={() => zmien((d) => ({ ...d, ceny: [...d.ceny, nowaCena()] }))}
            className="text-sm font-extrabold text-akcent-tekst hover:underline"
          >
            + {!danie.ceny.length ? "Dodaj cenę" : kilka ? "Kolejny wariant" : "Kilka cen (np. rozmiary pizzy)"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CECHY.map((c) => {
          const ma = danie.cechy.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={ma}
              onClick={() =>
                zmien((d) => ({ ...d, cechy: ma ? d.cechy.filter((x) => x !== c.id) : [...d.cechy, c.id] }))
              }
              className={`rounded-full border-2 px-3 py-1 text-sm font-extrabold transition ${
                ma ? "border-akcent bg-akcent text-na-akcencie" : "border-obrys-2 bg-white"
              }`}
            >
              {c.nazwa}
            </button>
          );
        })}
      </div>

      {sekcje.length > 1 && (
        <label className="flex items-center gap-2 text-sm">
          <span className="font-bold">Dział:</span>
          <select
            value={sekcja}
            onChange={(e) => przenies(e.target.value)}
            className="rounded-lg border border-obrys-2 bg-white px-2 py-1.5 text-[16px]"
          >
            {sekcje.map((s) => (
              <option key={s.k} value={s.k}>
                {s.nazwa || "(bez nazwy)"}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button type="button" onClick={zamknij} className={`${przyciskMaly} bg-tekst text-white`}>
          <Check className="size-4" aria-hidden /> Gotowe
        </button>
        <PrzyciskiKolejnosci gora={() => kolejnosc(-1)} dol={() => kolejnosc(1)} co="danie" />
        <span className="flex-1" />
        <Usun co="danie" pytanie="Usunąć danie?" usun={usun} zNapisem />
      </div>
    </div>
  );
}

function PrzyciskiKolejnosci({ gora, dol, co }: { gora: () => void; dol: () => void; co: string }) {
  const klasa = "flex size-9 shrink-0 items-center justify-center rounded-full text-tekst-2 hover:bg-krem hover:text-tekst";
  return (
    <>
      <button type="button" onClick={gora} aria-label={`Przesuń ${co} wyżej`} className={klasa}>
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button type="button" onClick={dol} aria-label={`Przesuń ${co} niżej`} className={klasa}>
        <ArrowDown className="size-4" aria-hidden />
      </button>
    </>
  );
}

/** Usuwanie w dwóch kliknięciach zamiast okienka potwierdzenia. */
function Usun({ co, pytanie, usun, zNapisem = false }: { co: string; pytanie: string; usun: () => void; zNapisem?: boolean }) {
  const [pewny, setPewny] = useState(false);
  if (pewny) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={usun} className={`${przyciskMaly} bg-zamkniete text-white`}>
          {pytanie.replace("?", "")}
        </button>
        <button
          type="button"
          onClick={() => setPewny(false)}
          aria-label="Anuluj"
          className="flex size-9 items-center justify-center rounded-full hover:bg-krem"
        >
          <X className="size-4" aria-hidden />
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPewny(true)}
      aria-label={`Usuń ${co}`}
      className={
        zNapisem
          ? `${przyciskMaly} text-zamkniete hover:bg-zamkniete/10`
          : "flex size-9 shrink-0 items-center justify-center rounded-full text-tekst-2 hover:bg-zamkniete/10 hover:text-zamkniete"
      }
    >
      <Trash2 className="size-4" aria-hidden />
      {zNapisem && "Usuń"}
    </button>
  );
}
