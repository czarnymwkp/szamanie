"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Flame, Leaf, Plus, Star } from "lucide-react";
import { zl } from "@/lib/ceny";
import type { Dostawa, Menu, PozycjaMenu } from "@/lib/menu";
import { slugify } from "@/lib/slug.mjs";
import { zdjecieDania } from "@/lib/zdjeciaDan";
import Licznik from "../menu/Licznik";
import ListaZamowienia from "../menu/ListaZamowienia";
import { kluczPozycji, useLista, type ListaLokalu } from "../menu/useLista";

export type WygladZakladek = {
  pasek: string; // tło przyklejonego paska zakładek
  aktywna: string;
  nieaktywna: string;
  naglowek: string; // nagłówek działu
  wiersz: string; // wiersz dania (np. karta albo linia)
  miniatura: string; // ramka zdjęcia dania
};

const DOMYSLNY: WygladZakladek = {
  pasek: "bg-tlo/85 backdrop-blur-xl",
  aktywna: "bg-tekst text-tlo",
  nieaktywna: "bg-krem text-tekst",
  naglowek: "font-grotesk text-2xl font-bold",
  wiersz: "border-b border-obrys",
  miniatura: "rounded-2xl",
};

/**
 * Menu jak w aplikacjach do zamawiania: przyklejone zakładki działów (podświetla się dział, który jest na
 * ekranie), pod nimi wszystkie dania z miniaturą zdjęcia i plusem na zdjęciu. Lista do zamówienia ta sama
 * co na stronie lokalu. `odGory` — wysokość przyklejonego nagłówka strony nad zakładkami.
 */
export default function MenuZakladki({
  menu,
  dostawa,
  slug,
  nazwa,
  telefon,
  wyglad = {},
  odGory = 0,
}: {
  menu: Menu;
  dostawa: Dostawa | null;
  slug: string;
  nazwa: string;
  telefon: string | null;
  wyglad?: Partial<WygladZakladek>;
  odGory?: number;
}) {
  const w = { ...DOMYSLNY, ...wyglad };
  const l = useLista(slug);
  const [aktywny, setAktywny] = useState(menu.sekcje[0]?.nazwa ?? "");
  const pasek = useRef<HTMLDivElement>(null);

  // dział na środku ekranu = aktywna zakładka
  useEffect(() => {
    const obserwator = new IntersectionObserver(
      (wpisy) => {
        const widoczny = wpisy.find((x) => x.isIntersecting);
        if (widoczny) setAktywny((widoczny.target as HTMLElement).dataset.dzial ?? "");
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-dzial]").forEach((el) => obserwator.observe(el));
    return () => obserwator.disconnect();
  }, [menu]);

  // aktywna zakładka zawsze widoczna w pasku (bez przewijania całej strony)
  useEffect(() => {
    const p = pasek.current;
    const z = p?.querySelector<HTMLElement>(`[data-zakladka="${CSS.escape(aktywny)}"]`);
    if (p && z) p.scrollTo({ left: z.offsetLeft - p.clientWidth / 2 + z.clientWidth / 2, behavior: "smooth" });
  }, [aktywny]);

  const idDzialu = (n: string) => `dzial-${slugify(n)}`;

  return (
    <section id="menu" aria-label="Menu" className="scroll-mt-24">
      <div className={`sticky z-30 -mx-5 px-5 py-2.5 ${w.pasek}`} style={{ top: odGory }}>
        <div ref={pasek} className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {menu.sekcje.map((s) => (
            <a
              key={s.nazwa}
              href={`#${idDzialu(s.nazwa)}`}
              data-zakladka={s.nazwa}
              aria-current={aktywny === s.nazwa ? "true" : undefined}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold whitespace-nowrap transition-colors duration-300 ${
                aktywny === s.nazwa ? w.aktywna : w.nieaktywna
              }`}
            >
              {s.nazwa}
            </a>
          ))}
        </div>
      </div>

      {menu.sekcje.map((s) => (
        <section
          key={s.nazwa}
          id={idDzialu(s.nazwa)}
          data-dzial={s.nazwa}
          aria-label={s.nazwa}
          style={{ scrollMarginTop: odGory + 64 }}
          className="pt-6"
        >
          <h3 className={w.naglowek}>{s.nazwa}</h3>
          {s.opis && <p className="mt-1 text-sm font-semibold text-tekst-2">{s.opis}</p>}
          <ul className="mt-2">
            {s.pozycje.map((p) => (
              <Danie key={p.id} p={p} sekcja={s.nazwa} l={l} w={w} />
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-6 text-xs font-semibold text-tekst-2">
        Ceny mogą się zmienić — lokal potwierdza je przy zamówieniu. Zdjęcia dań są poglądowe.
      </p>
      <ListaZamowienia l={l} nazwa={nazwa} telefon={telefon} dostawa={dostawa} />
    </section>
  );
}

function Danie({ p, sekcja, l, w }: { p: PozycjaMenu; sekcja: string; l: ListaLokalu; w: WygladZakladek }) {
  const zdjecie = zdjecieDania(sekcja, p.nazwa, p.opis);
  const jednaCena = p.ceny.length <= 1;
  const cena = p.ceny[0] ?? null;
  const dodaj = (wariant: string | null, gr: number | null) =>
    l.dodaj({ klucz: kluczPozycji(p.id, wariant), nazwa: p.nazwa, wariant, gr });
  const licznik = jednaCena && (
    <Licznik
      ile={l.ilosc(kluczPozycji(p.id, null))}
      nazwa={p.nazwa}
      dodaj={() => dodaj(null, cena?.gr ?? null)}
      zmien={(o) => l.zmienIlosc(kluczPozycji(p.id, null), o)}
    />
  );

  return (
    <li className={`flex gap-3 py-3.5 ${w.wiersz}`}>
      <div className="min-w-0 flex-1">
        <h4 className="flex items-center gap-1.5 leading-snug font-extrabold">
          {p.nazwa}
          {p.cechy.includes("wege") && <Leaf className="size-4 shrink-0 text-[#15803d]" aria-label="wege" />}
          {p.cechy.includes("ostre") && <Flame className="size-4 shrink-0 text-zamkniete" aria-label="ostre" />}
          {p.cechy.includes("polecane") && <Star className="size-4 shrink-0 text-akcent-tekst" aria-label="polecane" />}
        </h4>
        {p.opis && <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-tekst-2">{p.opis}</p>}
        {jednaCena ? (
          <p className="mt-1.5 font-black">{cena ? zl(cena.gr) : <span className="text-tekst-2">cena w lokalu</span>}</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.ceny.map((c) => {
              const ile = l.ilosc(kluczPozycji(p.id, c.wariant));
              return (
                <button
                  key={c.wariant}
                  type="button"
                  onClick={() => dodaj(c.wariant, c.gr)}
                  aria-label={`Dodaj do listy: ${p.nazwa}, ${c.wariant}, ${zl(c.gr)}`}
                  className={`inline-flex h-8 items-center gap-1 rounded-full border-[1.5px] px-2.5 text-xs font-extrabold transition active:scale-95 ${
                    ile ? "border-tekst bg-tekst text-tlo" : "border-obrys-2 bg-karta"
                  }`}
                >
                  <span className="opacity-70">{c.wariant}</span> {zl(c.gr)}
                  {ile ? <span className="ml-0.5 rounded-full bg-akcent px-1.5 text-na-akcencie">{ile}</span> : <Plus className="size-3.5" aria-hidden />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {zdjecie ? (
        <div className="relative shrink-0">
          <div className={`relative size-24 overflow-hidden ${w.miniatura}`}>
            <Image src={zdjecie} alt="" fill sizes="96px" className="object-cover" />
          </div>
          {licznik && <div className="absolute -right-1.5 -bottom-2">{licznik}</div>}
        </div>
      ) : (
        licznik && <div className="shrink-0 self-center">{licznik}</div>
      )}
    </li>
  );
}
