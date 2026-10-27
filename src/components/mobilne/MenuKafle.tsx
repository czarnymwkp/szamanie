"use client";

import Image from "next/image";
import { useState } from "react";
import { Flame, Leaf, Plus, UtensilsCrossed } from "lucide-react";
import { zl } from "@/lib/ceny";
import type { Dostawa, Menu, PozycjaMenu } from "@/lib/menu";
import { odmiana } from "@/lib/nazwy";
import { zdjecieDania } from "@/lib/zdjeciaDan";
import Licznik from "../menu/Licznik";
import ListaZamowienia from "../menu/ListaZamowienia";
import { kluczPozycji, useLista, type ListaLokalu } from "../menu/useLista";

/**
 * Menu w kaflach ze zdjęciami dań, po jednym dziale naraz (przełączane pigułkami). Na kaflu zdjęcie,
 * nazwa, cena i plus; warianty („32 cm”, „45 cm”) jako małe przyciski pod nazwą.
 */
export default function MenuKafle({
  menu,
  dostawa,
  slug,
  nazwa,
  telefon,
  ciemne = false,
}: {
  menu: Menu;
  dostawa: Dostawa | null;
  slug: string;
  nazwa: string;
  telefon: string | null;
  ciemne?: boolean;
}) {
  const l = useLista(slug);
  const [dzial, setDzial] = useState(menu.sekcje[0]?.nazwa ?? "");
  const sekcja = menu.sekcje.find((s) => s.nazwa === dzial) ?? menu.sekcje[0];

  return (
    <section id="menu" aria-label="Menu" className="scroll-mt-24">
      <div role="tablist" aria-label="Działy menu" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        {menu.sekcje.map((s) => (
          <button
            key={s.nazwa}
            type="button"
            role="tab"
            aria-selected={s.nazwa === sekcja.nazwa}
            onClick={() => setDzial(s.nazwa)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold whitespace-nowrap transition ${
              s.nazwa === sekcja.nazwa
                ? "bg-akcent text-na-akcencie shadow-[0_0_24px_rgba(255,100,0,0.45)]"
                : ciemne
                  ? "bg-white/10 text-tekst"
                  : "bg-krem text-tekst"
            }`}
          >
            {s.nazwa}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm font-bold text-tekst-2">
        {sekcja.pozycje.length} {odmiana(sekcja.pozycje.length, ["danie", "dania", "dań"])}
        {sekcja.opis && ` · ${sekcja.opis}`}
      </p>
      <ul key={sekcja.nazwa} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sekcja.pozycje.map((p, i) => (
          <Kafel key={p.id} p={p} sekcja={sekcja.nazwa} l={l} i={i} ciemne={ciemne} />
        ))}
      </ul>
      <p className="mt-5 text-xs font-semibold text-tekst-2">
        Ceny mogą się zmienić — lokal potwierdza je przy zamówieniu. Zdjęcia dań są poglądowe.
      </p>
      <ListaZamowienia l={l} nazwa={nazwa} telefon={telefon} dostawa={dostawa} />
    </section>
  );
}

function Kafel({
  p,
  sekcja,
  l,
  i,
  ciemne,
}: {
  p: PozycjaMenu;
  sekcja: string;
  l: ListaLokalu;
  i: number;
  ciemne: boolean;
}) {
  const zdjecie = zdjecieDania(sekcja, p.nazwa, p.opis);
  const jednaCena = p.ceny.length <= 1;
  const cena = p.ceny[0] ?? null;
  const dodaj = (wariant: string | null, gr: number | null) =>
    l.dodaj({ klucz: kluczPozycji(p.id, wariant), nazwa: p.nazwa, wariant, gr });
  const naLiscie = p.ceny.some((c) => l.ilosc(kluczPozycji(p.id, c.wariant)) > 0) || l.ilosc(kluczPozycji(p.id, null)) > 0;

  return (
    <li
      className={`flex animate-wjazd flex-col overflow-hidden rounded-3xl transition ${
        ciemne ? "bg-white/[0.06] ring-1 ring-white/10" : "bg-karta shadow-sm ring-1 ring-obrys"
      } ${naLiscie ? "ring-2 ring-akcent" : ""}`}
      style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
    >
      <div className="relative aspect-square">
        {zdjecie ? (
          <Image src={zdjecie} alt="" fill sizes="(min-width: 640px) 220px, 50vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-akcent/30 to-akcent/5">
            <UtensilsCrossed className="size-10 text-akcent-tekst/60" aria-hidden />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
        {jednaCena && (
          <span className="absolute bottom-2 left-2.5 text-lg font-black text-white drop-shadow">
            {cena ? zl(cena.gr) : "cena w lokalu"}
          </span>
        )}
        <span className="absolute top-2 left-2 flex gap-1">
          {p.cechy.includes("wege") && (
            <span className="flex size-6 items-center justify-center rounded-full bg-[#15803d] text-white">
              <Leaf className="size-3.5" aria-label="wege" />
            </span>
          )}
          {p.cechy.includes("ostre") && (
            <span className="flex size-6 items-center justify-center rounded-full bg-zamkniete text-white">
              <Flame className="size-3.5" aria-label="ostre" />
            </span>
          )}
        </span>
        {jednaCena && (
          <div className="absolute right-2 bottom-2">
            <Licznik
              ile={l.ilosc(kluczPozycji(p.id, null))}
              nazwa={p.nazwa}
              dodaj={() => dodaj(null, cena?.gr ?? null)}
              zmien={(o) => l.zmienIlosc(kluczPozycji(p.id, null), o)}
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h4 className="text-[15px] leading-tight font-extrabold">{p.nazwa}</h4>
        {p.opis && <p className="mt-1 line-clamp-2 text-xs leading-snug text-tekst-2">{p.opis}</p>}
        {!jednaCena && (
          <div className="mt-auto flex flex-wrap gap-1 pt-2">
            {p.ceny.map((c) => {
              const ile = l.ilosc(kluczPozycji(p.id, c.wariant));
              return (
                <button
                  key={c.wariant}
                  type="button"
                  onClick={() => dodaj(c.wariant, c.gr)}
                  aria-label={`Dodaj do listy: ${p.nazwa}, ${c.wariant}, ${zl(c.gr)}`}
                  className={`inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-extrabold transition active:scale-95 ${
                    ile ? "bg-akcent text-na-akcencie" : ciemne ? "bg-white/10" : "bg-krem"
                  }`}
                >
                  {c.wariant} {zl(c.gr)}
                  {ile ? <span className="font-black">×{ile}</span> : <Plus className="size-3" aria-hidden />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </li>
  );
}
