import { Anton, Bricolage_Grotesque, Caveat, Fraunces, Instrument_Serif, JetBrains_Mono, Unbounded } from "next/font/google";

// Kroje propozycji na telefon (podstawowy Nunito i Space Grotesk są w app/layout.tsx). Wszystkie z polskimi znakami.
export const reka = Caveat({ weight: "700", subsets: ["latin", "latin-ext"] }); // 3 · Szkicownik
export const plakat = Anton({ weight: "400", subsets: ["latin", "latin-ext"] }); // 4 · Wielkie litery
export const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"] }); // 5 · Talia kart
export const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"] }); // 7 · Bento
export const fraunces = Fraunces({ subsets: ["latin", "latin-ext"] }); // 8 · Pora dnia
export const elegancki = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin", "latin-ext"] }); // 9 · Smak
export const szeroki = Unbounded({ subsets: ["latin", "latin-ext"] }); // 10 · Płynny kolor
