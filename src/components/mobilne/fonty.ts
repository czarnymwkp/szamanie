import {
  Amatic_SC,
  Anton,
  Bangers,
  Bebas_Neue,
  Bricolage_Grotesque,
  Cormorant_Garamond,
  Courier_Prime,
  Dancing_Script,
  Exo_2,
  Fraunces,
  Fredoka,
  Instrument_Serif,
  JetBrains_Mono,
  Josefin_Sans,
  League_Spartan,
  Limelight,
  Old_Standard_TT,
  Pixelify_Sans,
  Playfair_Display,
  Press_Start_2P,
  Unbounded,
} from "next/font/google";

// Kroje propozycji na telefon (podstawowy Nunito i Space Grotesk są w app/layout.tsx). Wszystkie z polskimi znakami.
export { reka } from "../szkic/szkic"; // 3 · Szkicownik — ten sam krój co na stronie
export const plakat = Anton({ weight: "400", subsets: ["latin", "latin-ext"] }); // 4 · Wielkie litery
export const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"] }); // 5 · Talia kart
export const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"] }); // 7 · Bento
export const fraunces = Fraunces({ subsets: ["latin", "latin-ext"] }); // 8 · Pora dnia
export const elegancki = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin", "latin-ext"] }); // 9 · Smak
export const szeroki = Unbounded({ subsets: ["latin", "latin-ext"] }); // 10 · Płynny kolor

// druga dziesiątka (11–20)
export const pikselowy = Press_Start_2P({ weight: "400", subsets: ["latin", "latin-ext"] }); // 11 · Automat
export const pikseleTekst = Pixelify_Sans({ subsets: ["latin", "latin-ext"] });
export const gazetowy = Old_Standard_TT({ weight: ["400", "700"], subsets: ["latin", "latin-ext"] }); // 12 · Gazeta
export const winieta = Playfair_Display({ weight: "900", subsets: ["latin", "latin-ext"] });
export const kasowy = Courier_Prime({ weight: ["400", "700"], subsets: ["latin", "latin-ext"] }); // 13 · Paragon
export const okragly = Fredoka({ subsets: ["latin", "latin-ext"] }); // 14 · Glina
export const kosmiczny = Exo_2({ subsets: ["latin", "latin-ext"] }); // 15 · Kosmos
export const pedzel = Cormorant_Garamond({ weight: ["500", "700"], style: ["normal", "italic"], subsets: ["latin", "latin-ext"] }); // 16 · Akwarela
export const kaligrafia = Dancing_Script({ subsets: ["latin", "latin-ext"] });
export const ogrodowy = Josefin_Sans({ subsets: ["latin", "latin-ext"] }); // 17 · Ogród
export const tablica = Amatic_SC({ weight: "700", subsets: ["latin", "latin-ext"] });
export const komiksowy = Bangers({ weight: "400", subsets: ["latin", "latin-ext"] }); // 18 · Komiks
export const spartan = League_Spartan({ subsets: ["latin", "latin-ext"] }); // 19 · Bauhaus
export const neonKino = Limelight({ weight: "400", subsets: ["latin", "latin-ext"] }); // 20 · Kino
export const afisz = Bebas_Neue({ weight: "400", subsets: ["latin", "latin-ext"] });
