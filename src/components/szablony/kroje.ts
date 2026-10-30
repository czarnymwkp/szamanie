import { Karla, Montserrat, Open_Sans, Playfair_Display, Roboto, Roboto_Condensed, Roboto_Mono, Rokkitt } from "next/font/google";
import type { KrojLokalu } from "@/lib/motywyStron";

// Kroje motywów lokali (lib/motywyStron.ts). Bez preload: pobierają się tylko na stronach lokali, które ich używają.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: "700",
  preload: false,
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

// Burger&Pizza: gruby szeryf blokowy jak w nagłówkach ich karty i wąski bezszeryfowy jak w składnikach.
const rokkitt = Rokkitt({
  variable: "--font-rokkitt",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

// Brunoo: Roboto w nagłówkach i tekście, Roboto Mono w etykietach (ceny, filtry, „karta dań”) — jak na brunoo.pl.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  preload: false,
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  preload: false,
});

// Kwadrat: szeroki bezszeryfowy wersalikami z rozstrzeleniem w nagłówkach i nazwach dań, zwykły w składnikach.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

export const KROJE: Record<KrojLokalu, { variable: string; zmienna: string }> = {
  playfair: { variable: playfair.variable, zmienna: "var(--font-playfair)" },
  karla: { variable: karla.variable, zmienna: "var(--font-karla)" },
  rokkitt: { variable: rokkitt.variable, zmienna: "var(--font-rokkitt)" },
  "roboto-condensed": { variable: robotoCondensed.variable, zmienna: "var(--font-roboto-condensed)" },
  roboto: { variable: roboto.variable, zmienna: "var(--font-roboto)" },
  "roboto-mono": { variable: robotoMono.variable, zmienna: "var(--font-roboto-mono)" },
  montserrat: { variable: montserrat.variable, zmienna: "var(--font-montserrat)" },
  "open-sans": { variable: openSans.variable, zmienna: "var(--font-open-sans)" },
};
