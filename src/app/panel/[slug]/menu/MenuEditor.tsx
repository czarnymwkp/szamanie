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
import { card, framedCard, errorMessage, okMessage, field, primaryButton, smallButton } from "@/components/panel/style";
import type { DishFeature } from "@/lib/menu";
import type { DishDraft, SectionDraft } from "@/lib/panel/venue";
import { stripPolish } from "@/lib/slug.mjs";
import type { MenuState } from "../actions";

// Editor for the whole menu in the browser; „Zapisz” sends it as a whole (the server validates it and saves it in one
// transaction). Prices change right in the list — the most common edit; the rest of a dish after expanding it with the
// pencil.

type Price = { k: string; wariant: string; cena: string };
type Dish = Omit<DishDraft, "ceny"> & { k: string; ceny: Price[] };
type Section = Omit<SectionDraft, "dania"> & { k: string; dania: Dish[] };

const FEATURES: { id: DishFeature; nazwa: string }[] = [
  { id: "wege", nazwa: "wege" },
  { id: "ostre", nazwa: "ostre" },
  { id: "polecane", nazwa: "polecane" },
  { id: "sezonowe", nazwa: "sezonowe" },
];

// React keys for new rows (crypto.randomUUID does not work over http:// from a phone on the home network)
let counter = 0;
const key = () => `k${++counter}`;

const withKeys = (menu: SectionDraft[]): Section[] =>
  menu.map((s) => ({
    ...s,
    k: key(),
    dania: s.dania.map((d) => ({ ...d, k: key(), ceny: d.ceny.map((c) => ({ ...c, k: key() })) })),
  }));

const withoutKeys = (sections: Section[]): SectionDraft[] =>
  sections.map(({ nazwa, opis, dania }) => ({
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

const move = <T,>(list: T[], i: number, o: number) => {
  const j = i + o;
  if (j < 0 || j >= list.length) return list;
  const newOne = [...list];
  [newOne[i], newOne[j]] = [newOne[j], newOne[i]];
  return newOne;
};

const newPrice = (): Price => ({ k: key(), wariant: "", cena: "" });

export default function MenuEditor({
  menu,
  zapisz,
}: {
  menu: SectionDraft[];
  zapisz: (menu: SectionDraft[]) => Promise<MenuState>;
}) {
  const [sekcje, setSekcje] = useState(() => withKeys(menu));
  const [zapisane, setZapisane] = useState(() => JSON.stringify(withoutKeys(withKeys(menu))));
  const [otwarte, setOtwarte] = useState<Set<string>>(() => new Set(menu.length <= 3 ? sekcje.map((s) => s.k) : []));
  const [edytowane, setEdytowane] = useState<string | null>(null);
  const [fraza, setFraza] = useState("");
  const [stan, setStan] = useState<MenuState>({});
  const [trwa, startTransition] = useTransition();

  const changed = JSON.stringify(withoutKeys(sekcje)) !== zapisane;

  // warning when closing the tab with unsaved changes
  useEffect(() => {
    if (!changed) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  const changeSection = (k: string, f: (s: Section) => Section) => {
    setStan({});
    setSekcje((list) => list.map((s) => (s.k === k ? f(s) : s)));
  };
  const changeDish = (sectionKey: string, dishKey: string, f: (d: Dish) => Dish) =>
    changeSection(sectionKey, (s) => ({ ...s, dania: s.dania.map((d) => (d.k === dishKey ? f(d) : d)) }));

  const toggle = (k: string) =>
    setOtwarte((o) => {
      const n = new Set(o);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  function addSection() {
    const s: Section = { k: key(), nazwa: "", opis: "", dania: [] };
    setSekcje((list) => [...list, s]);
    setOtwarte((o) => new Set(o).add(s.k));
  }

  function addDish(sectionKey: string) {
    const d: Dish = { k: key(), id: null, nazwa: "", opis: "", ceny: [newPrice()], cechy: [] };
    changeSection(sectionKey, (s) => ({ ...s, dania: [...s.dania, d] }));
    setEdytowane(d.k);
  }

  function moveDish(sectionKey: string, dishKey: string, toSection: string) {
    setSekcje((list) => {
      const dish = list.find((s) => s.k === sectionKey)?.dania.find((d) => d.k === dishKey);
      if (!dish) return list;
      return list.map((s) =>
        s.k === sectionKey
          ? { ...s, dania: s.dania.filter((d) => d.k !== dishKey) }
          : s.k === toSection
            ? { ...s, dania: [...s.dania, dish] }
            : s,
      );
    });
    setOtwarte((o) => new Set(o).add(toSection));
  }

  function saveAll() {
    startTransition(async () => {
      const result = await zapisz(withoutKeys(sekcje));
      setStan(result);
      if (result.menu) {
        const newOnes = withKeys(result.menu);
        // open sections stay open (by name — the keys are new)
        const openNames = new Set(sekcje.filter((s) => otwarte.has(s.k)).map((s) => s.nazwa));
        setSekcje(newOnes);
        setOtwarte(new Set(newOnes.filter((s) => openNames.has(s.nazwa)).map((s) => s.k)));
        setZapisane(JSON.stringify(withoutKeys(newOnes)));
        setEdytowane(null);
      }
    });
  }

  const f = stripPolish(fraza.trim());
  const matches = (d: Dish) => !f || stripPolish(`${d.nazwa} ${d.opis}`).includes(f);
  const dishCount = sekcje.reduce((n, s) => n + s.dania.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-56">
          <span className="sr-only">Szukaj dania</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-tekst-2" aria-hidden />
          <input
            value={fraza}
            onChange={(e) => setFraza(e.target.value)}
            placeholder={`Szukaj wśród ${dishCount} dań`}
            className={`${field} pl-11`}
          />
        </label>
        <button
          type="button"
          onClick={() => setOtwarte(new Set(otwarte.size ? [] : sekcje.map((s) => s.k)))}
          className={`${smallButton} bg-krem`}
        >
          {otwarte.size ? "Zwiń działy" : "Rozwiń działy"}
        </button>
      </div>

      {!sekcje.length && (
        <p className={`${card} text-tekst-2`}>
          Menu jest puste. Dodaj pierwszy dział (np. „Pizza”), a w nim dania z cenami.
        </p>
      )}

      {sekcje.map((s, i) => {
        const visible = s.dania.filter(matches);
        if (f && !visible.length) return null;
        const isOpenNow = !!f || otwarte.has(s.k);
        return (
          <section key={s.k} className={framedCard}>
            {isOpenNow ? (
              <div className="flex items-center gap-1 p-2 sm:gap-1.5 sm:p-3">
                <button
                  type="button"
                  onClick={() => toggle(s.k)}
                  aria-expanded
                  aria-label="Zwiń dział"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-krem"
                >
                  <ChevronDown className="size-5" aria-hidden />
                </button>
                <input
                  value={s.nazwa}
                  onChange={(e) => changeSection(s.k, (x) => ({ ...x, nazwa: e.target.value }))}
                  placeholder="Nazwa działu, np. Pizza"
                  aria-label="Nazwa działu"
                  maxLength={80}
                  className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-lg font-black outline-none focus:bg-krem"
                />
                <OrderButtons
                  gora={() => setSekcje((l) => move(l, i, -1))}
                  dol={() => setSekcje((l) => move(l, i, 1))}
                  co="dział"
                />
                <DeleteButton
                  co="dział"
                  pytanie={s.dania.length ? `Usunąć dział z ${s.dania.length} daniami?` : "Usunąć dział?"}
                  usun={() => setSekcje((l) => l.filter((x) => x.k !== s.k))}
                />
              </div>
            ) : (
              // collapsed section: the whole bar expands it — name and order are changed after expanding
              <button
                type="button"
                onClick={() => toggle(s.k)}
                aria-expanded={false}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition hover:bg-krem"
              >
                <ChevronDown className="size-5 shrink-0 -rotate-90" aria-hidden />
                <span className={`min-w-0 flex-1 truncate text-lg font-black ${s.nazwa ? "" : "text-tekst-2 italic"}`}>
                  {s.nazwa || "Nowy dział"}
                </span>
                <span className="shrink-0 rounded-full bg-krem px-2.5 py-0.5 text-sm font-bold text-tekst-2">
                  {s.dania.length}
                </span>
              </button>
            )}

            {isOpenNow && (
              <div className="border-t border-obrys">
                <input
                  value={s.opis}
                  onChange={(e) => changeSection(s.k, (x) => ({ ...x, opis: e.target.value }))}
                  placeholder="Opis działu (opcjonalnie), np. „do każdej pizzy sos gratis”"
                  aria-label="Opis działu"
                  maxLength={200}
                  className="w-full bg-transparent px-5 py-2.5 text-sm text-tekst-2 outline-none focus:bg-krem"
                />
                <ul className="divide-y divide-obrys border-t border-obrys">
                  {visible.map((d) => (
                    <li key={d.k}>
                      {edytowane === d.k ? (
                        <DishEditor
                          danie={d}
                          sekcje={sekcje}
                          sekcja={s.k}
                          zmien={(fn) => changeDish(s.k, d.k, fn)}
                          przenies={(toSection) => moveDish(s.k, d.k, toSection)}
                          kolejnosc={(o) =>
                            changeSection(s.k, (x) => ({ ...x, dania: move(x.dania, x.dania.indexOf(d), o) }))
                          }
                          usun={() => changeSection(s.k, (x) => ({ ...x, dania: x.dania.filter((y) => y.k !== d.k) }))}
                          zamknij={() => setEdytowane(null)}
                        />
                      ) : (
                        <DishRow danie={d} zmien={(fn) => changeDish(s.k, d.k, fn)} edytuj={() => setEdytowane(d.k)} />
                      )}
                    </li>
                  ))}
                </ul>
                {!f && (
                  <button
                    type="button"
                    onClick={() => addDish(s.k)}
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

      {f && sekcje.every((s) => !s.dania.some(matches)) && <p className="text-tekst-2">Nic nie pasuje do „{fraza}”.</p>}

      {!f && (
        <button type="button" onClick={addSection} className={`${smallButton} h-11 bg-krem px-5`}>
          <Plus className="size-4" aria-hidden /> Dodaj dział
        </button>
      )}

      {/* save bar stuck to the bottom of the screen */}
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveAll}
            disabled={!changed || trwa}
            className={`${primaryButton} flex-1 sm:flex-none`}
          >
            {trwa ? "Zapisuję…" : "Zapisz menu"}
          </button>
          {changed && !trwa && <span className="text-sm font-bold text-akcent-tekst">Masz niezapisane zmiany</span>}
        </div>
      </div>
    </div>
  );
}

function priceDescription(d: Dish) {
  return d.ceny.filter((c) => c.cena || c.wariant);
}

/** Collapsed dish: the name and price fields for quick edits. */
function DishRow({ danie, zmien, edytuj }: { danie: Dish; zmien: (f: (d: Dish) => Dish) => void; edytuj: () => void }) {
  const prices = priceDescription(danie);
  return (
    <div className="flex items-start gap-2 px-4 py-3 sm:items-center sm:px-5">
      <button type="button" onClick={edytuj} className="min-w-0 flex-1 text-left">
        <span className={`block font-extrabold ${danie.nazwa ? "" : "text-tekst-2 italic"}`}>
          {danie.nazwa || "Nowe danie"}
        </span>
        {danie.opis && <span className="line-clamp-1 text-sm text-tekst-2">{danie.opis}</span>}
      </button>
      <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center">
        {prices.length ? (
          prices.map((c) => (
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

function DishEditor({
  danie,
  sekcje,
  sekcja,
  zmien,
  przenies,
  kolejnosc,
  usun,
  zamknij,
}: {
  danie: Dish;
  sekcje: Section[];
  sekcja: string;
  zmien: (f: (d: Dish) => Dish) => void;
  przenies: (toSection: string) => void;
  kolejnosc: (o: number) => void;
  usun: () => void;
  zamknij: () => void;
}) {
  const changePrice = (k: string, field: "wariant" | "cena", v: string) =>
    zmien((d) => ({ ...d, ceny: d.ceny.map((c) => (c.k === k ? { ...c, [field]: v } : c)) }));
  const several = danie.ceny.length > 1;
  const withVariant = several || !!danie.ceny[0]?.wariant; // np. jedna cena „0,5 l”

  return (
    <div className="space-y-3 bg-krem/50 px-4 py-4 sm:px-5">
      <input
        value={danie.nazwa}
        onChange={(e) => zmien((d) => ({ ...d, nazwa: e.target.value }))}
        placeholder="Nazwa dania, np. Margherita"
        aria-label="Nazwa dania"
        maxLength={120}
        autoFocus={!danie.nazwa}
        className={`${field} font-extrabold`}
      />
      <textarea
        value={danie.opis}
        onChange={(e) => zmien((d) => ({ ...d, opis: e.target.value }))}
        placeholder="Skład albo opis (opcjonalnie), np. sos pomidorowy, mozzarella"
        aria-label="Opis dania"
        rows={2}
        maxLength={500}
        className={field}
      />

      <div className="space-y-2">
        {danie.ceny.map((c) => (
          <div key={c.k} className="flex items-center gap-2">
            {withVariant && (
              <input
                value={c.wariant}
                onChange={(e) => changePrice(c.k, "wariant", e.target.value)}
                placeholder="wariant, np. 32 cm"
                aria-label="Wariant"
                maxLength={40}
                className={`${field} min-w-0 flex-1`}
              />
            )}
            <input
              value={c.cena}
              onChange={(e) => changePrice(c.k, "cena", e.target.value)}
              placeholder="cena"
              aria-label="Cena w złotych"
              inputMode="decimal"
              className={`${field} w-28 text-right font-bold`}
            />
            <span className="text-tekst-2">zł</span>
            {several && (
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
            onClick={() => zmien((d) => ({ ...d, ceny: [...d.ceny, newPrice()] }))}
            className="text-sm font-extrabold text-akcent-tekst hover:underline"
          >
            + {!danie.ceny.length ? "Dodaj cenę" : several ? "Kolejny wariant" : "Kilka cen (np. rozmiary pizzy)"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {FEATURES.map((c) => {
          const has = danie.cechy.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={has}
              onClick={() =>
                zmien((d) => ({ ...d, cechy: has ? d.cechy.filter((x) => x !== c.id) : [...d.cechy, c.id] }))
              }
              className={`rounded-full border-2 px-3 py-1 text-sm font-extrabold transition ${
                has ? "border-akcent bg-akcent text-na-akcencie" : "border-obrys-2 bg-white"
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
        <button type="button" onClick={zamknij} className={`${smallButton} bg-tekst text-white`}>
          <Check className="size-4" aria-hidden /> Gotowe
        </button>
        <OrderButtons gora={() => kolejnosc(-1)} dol={() => kolejnosc(1)} co="danie" />
        <span className="flex-1" />
        <DeleteButton co="danie" pytanie="Usunąć danie?" usun={usun} zNapisem />
      </div>
    </div>
  );
}

function OrderButtons({ gora, dol, co }: { gora: () => void; dol: () => void; co: string }) {
  const cls = "flex size-9 shrink-0 items-center justify-center rounded-full text-tekst-2 hover:bg-krem hover:text-tekst";
  return (
    <>
      <button type="button" onClick={gora} aria-label={`Przesuń ${co} wyżej`} className={cls}>
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button type="button" onClick={dol} aria-label={`Przesuń ${co} niżej`} className={cls}>
        <ArrowDown className="size-4" aria-hidden />
      </button>
    </>
  );
}

/** Deleting takes two clicks instead of a confirmation dialog. */
function DeleteButton({ co, pytanie, usun, zNapisem = false }: { co: string; pytanie: string; usun: () => void; zNapisem?: boolean }) {
  const [pewny, setPewny] = useState(false);
  if (pewny) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={usun} className={`${smallButton} bg-zamkniete text-white`}>
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
          ? `${smallButton} text-zamkniete hover:bg-zamkniete/10`
          : "flex size-9 shrink-0 items-center justify-center rounded-full text-tekst-2 hover:bg-zamkniete/10 hover:text-zamkniete"
      }
    >
      <Trash2 className="size-4" aria-hidden />
      {zNapisem && "Usuń"}
    </button>
  );
}
