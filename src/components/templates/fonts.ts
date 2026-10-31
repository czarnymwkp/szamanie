import {
  Bodoni_Moda,
  Comfortaa,
  Karla,
  Kaushan_Script,
  Lora,
  Montserrat,
  Open_Sans,
  Outfit,
  Playfair_Display,
  Poppins,
  Raleway,
  Roboto,
  Roboto_Condensed,
  Roboto_Mono,
  Rokkitt,
  Rubik_Dirt,
  Sanchez,
} from "next/font/google";
import type { VenueFont } from "@/lib/venueThemes";

// Fonts of venue themes (lib/venueThemes.ts). No preload: they are downloaded only on the venue pages that use them.
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

// Burger&Pizza: a heavy slab serif like the headings of their menu card and a narrow sans like the ingredients.
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

// Brunoo: Roboto for headings and text, Roboto Mono for labels (prices, filters, „karta dań”) — as on brunoo.pl.
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

// Kwadrat: a wide sans in letter-spaced uppercase for headings and dish names, a regular one for ingredients.
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

// Si!: a geometric sans (instead of the paid Geomanist from their card) and brush lettering for section titles.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

const kaushan = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  preload: false,
});

// MusiCaffe (musicaffe.pl/menu): sections in Comfortaa, dish names in the Sanchez serif, ingredients in Lora, text in
// Raleway.
const comfortaa = Comfortaa({ variable: "--font-comfortaa", subsets: ["latin", "latin-ext"], preload: false });
const sanchez = Sanchez({ variable: "--font-sanchez", subsets: ["latin", "latin-ext"], weight: "400", preload: false });
const lora = Lora({ variable: "--font-lora", subsets: ["latin", "latin-ext"], preload: false });
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin", "latin-ext"], preload: false });

// Kinowa: sections in a high-contrast italic serif (as on their card), dishes in uppercase Montserrat.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  preload: false,
});

// Tam Tam: Poppins as on their card and the rough Rubik Dirt for the name (like the lettering in their logo).
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});
const rubikDirt = Rubik_Dirt({ variable: "--font-rubik-dirt", subsets: ["latin", "latin-ext"], weight: "400", preload: false });

export const FONTS: Record<VenueFont, { variable: string; zmienna: string }> = {
  playfair: { variable: playfair.variable, zmienna: "var(--font-playfair)" },
  karla: { variable: karla.variable, zmienna: "var(--font-karla)" },
  rokkitt: { variable: rokkitt.variable, zmienna: "var(--font-rokkitt)" },
  "roboto-condensed": { variable: robotoCondensed.variable, zmienna: "var(--font-roboto-condensed)" },
  roboto: { variable: roboto.variable, zmienna: "var(--font-roboto)" },
  "roboto-mono": { variable: robotoMono.variable, zmienna: "var(--font-roboto-mono)" },
  montserrat: { variable: montserrat.variable, zmienna: "var(--font-montserrat)" },
  "open-sans": { variable: openSans.variable, zmienna: "var(--font-open-sans)" },
  outfit: { variable: outfit.variable, zmienna: "var(--font-outfit)" },
  kaushan: { variable: kaushan.variable, zmienna: "var(--font-kaushan)" },
  comfortaa: { variable: comfortaa.variable, zmienna: "var(--font-comfortaa)" },
  sanchez: { variable: sanchez.variable, zmienna: "var(--font-sanchez)" },
  lora: { variable: lora.variable, zmienna: "var(--font-lora)" },
  raleway: { variable: raleway.variable, zmienna: "var(--font-raleway)" },
  bodoni: { variable: bodoni.variable, zmienna: "var(--font-bodoni)" },
  poppins: { variable: poppins.variable, zmienna: "var(--font-poppins)" },
  "rubik-dirt": { variable: rubikDirt.variable, zmienna: "var(--font-rubik-dirt)" },
};
