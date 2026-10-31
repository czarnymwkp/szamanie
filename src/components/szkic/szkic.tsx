import type { CSSProperties } from "react";
import { Caveat } from "next/font/google";
import {
  Beer,
  CakeSlice,
  Carrot,
  Cherry,
  Coffee,
  Croissant,
  CupSoda,
  Donut,
  Drumstick,
  Fish,
  Hamburger,
  IceCreamCone,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Wine,
} from "lucide-react";
import { seededRandom } from "../mobilne/wspolne";
import "./szkic.css";

// Wygląd serwisu „Szkicownik” (propozycja 3 z /propozycje/m, wybrana 29.10): papier w kropki, w tle rysowane ikony
// jedzenia powoli płyną po skosie, lokale jak polaroidy przyklejone taśmą, odręczne dopiski krojem Caveat.

/** Odręczne dopiski (Caveat). */
export const hand = Caveat({ weight: "700", subsets: ["latin", "latin-ext"] });

/** Kolory papieru — nadpisują tokeny strony na elemencie, na którym je ustawimy. */
export const PAPER = {
  "--color-tlo": "#fffdf7",
  "--color-krem": "#f6eedf",
  "--color-obrys": "#e9dfcf",
  "--color-obrys-2": "#cbbca3",
  "--color-tekst": "#1d1b19",
  "--color-tekst-2": "#5d554b",
} as CSSProperties;

const ICONS = [Pizza, Coffee, Hamburger, Soup, IceCreamCone, Croissant, Cherry, Carrot, Salad, Fish, Wine, Beer, CakeSlice, Donut, Drumstick, Sandwich, CupSoda];
const rand = seededRandom(11);
// kafel wzoru 360×360: ikony w siatce 4×4 z rozrzutem i obrotem — powtarza się bez szwów
const DRAWINGS = Array.from({ length: 16 }, (_, i) => ({
  Ikona: ICONS[i % ICONS.length],
  x: (i % 4) * 90 + 10 + rand() * 30,
  y: Math.floor(i / 4) * 90 + 10 + rand() * 30,
  obrot: Math.round((rand() - 0.5) * 70),
  rozmiar: 30 + Math.round(rand() * 16),
}));

/** Tło z rysowanymi ikonami jedzenia (rodzic: relative isolate). */
export function SketchBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <svg className="m-dryf fixed -top-[360px] -left-[360px] h-[calc(100vh+720px)] w-[calc(100vw+720px)] text-[#1d1b19] opacity-[0.07]">
        <defs>
          <pattern id="m-szkic" width="360" height="360" patternUnits="userSpaceOnUse">
            {DRAWINGS.map(({ Ikona, x, y, obrot, rozmiar }, i) => (
              <g key={i} transform={`rotate(${obrot} ${x + rozmiar / 2} ${y + rozmiar / 2})`}>
                <Ikona x={x} y={y} width={rozmiar} height={rozmiar} strokeWidth={1.6} />
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#m-szkic)" />
      </svg>
    </div>
  );
}

/** Odręczne podkreślenie, które „rysuje się” po wczytaniu. */
export function Underline({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 300 24" preserveAspectRatio="none" className={`m-rysuj ${className}`}>
      <path d="M4 16 C 60 6, 120 22, 180 12 S 270 8, 296 14" fill="none" stroke="#ff6400" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Przycisk-pigułka w ręcznie rysowanej ramce (filtry, linki lokalu). */
export const chip = (isActive: boolean) =>
  `m-reczna-ramka flex h-10 shrink-0 items-center gap-1.5 border-2 border-tekst px-4 text-sm font-extrabold transition active:translate-y-0.5 ${
    isActive ? "bg-[#ffd36e] shadow-none" : "bg-white shadow-[3px_3px_0_#1d1b19]"
  }`;
