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
import { seededRandom } from "../shared";
import "./sketch.css";

// The „Sketchbook” look of the site (proposal 3, chosen 29.10): dotted paper, drawn food icons slowly drifting
// diagonally in the background, venues as polaroids stuck on with tape, handwritten notes in the Caveat font.

/** Handwritten notes (Caveat). */
export const hand = Caveat({ weight: "700", subsets: ["latin", "latin-ext"] });

/** Paper colors — override the page tokens on the element they are set on. */
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
// 360×360 pattern tile: icons in a 4×4 grid with jitter and rotation — repeats without seams
const DRAWINGS = Array.from({ length: 16 }, (_, i) => ({
  Ikona: ICONS[i % ICONS.length],
  x: (i % 4) * 90 + 10 + rand() * 30,
  y: Math.floor(i / 4) * 90 + 10 + rand() * 30,
  obrot: Math.round((rand() - 0.5) * 70),
  rozmiar: 30 + Math.round(rand() * 16),
}));

/** Background with drawn food icons (parent: relative isolate). */
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

/** Handwritten underline that „draws itself” after loading. */
export function Underline({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 300 24" preserveAspectRatio="none" className={`m-rysuj ${className}`}>
      <path d="M4 16 C 60 6, 120 22, 180 12 S 270 8, 296 14" fill="none" stroke="#ff6400" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Pill button in a hand-drawn frame (filters, venue links). */
export const chip = (isActive: boolean) =>
  `m-reczna-ramka flex h-10 shrink-0 items-center gap-1.5 border-2 border-tekst px-4 text-sm font-extrabold transition active:translate-y-0.5 ${
    isActive ? "bg-[#ffd36e] shadow-none" : "bg-white shadow-[3px_3px_0_#1d1b19]"
  }`;
