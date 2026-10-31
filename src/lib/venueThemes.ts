/**
 * A venue page's own look, matched to its brand (website, menu card). The colors override the `@theme` tokens
 * (globals.css) on the venue page <article>, so components know nothing about the theme — they use `bg-karta`,
 * `text-tekst` etc. Themes live here for now and will move to the venue panel later. Venue logos and photos only with
 * the owner's consent (confirm before deploying).
 */

export type ColorToken =
  | "tlo"
  | "karta"
  | "krem"
  | "tekst"
  | "tekst-2"
  | "obrys"
  | "obrys-2"
  | "akcent"
  | "akcent-tekst"
  | "na-akcencie"
  | "otwarte"
  | "zamkniete";

/** Fonts from `components/templates/fonts.ts`. */
export type VenueFont =
  | "playfair"
  | "karla"
  | "rokkitt"
  | "roboto-condensed"
  | "roboto"
  | "roboto-mono"
  | "montserrat"
  | "open-sans"
  | "outfit"
  | "kaushan"
  | "comfortaa"
  | "sanchez"
  | "lora"
  | "raleway"
  | "bodoni"
  | "poppins"
  | "rubik-dirt";

export type PageTheme = {
  kolory: Partial<Record<ColorToken, string>>;
  ciemny?: boolean; // dark form fields and scrollbars
  /** etykiety: small uppercase captions (prices, dish features) — via --etykiety-lokalu; without it the body font. */
  /** ozdobny: handwriting in menu section titles — via --ozdobny-lokalu. */
  kroje?: { naglowki: VenueFont; tekst: VenueFont; etykiety?: VenueFont; ozdobny?: VenueFont };
  /**
   * kreda: a chalkboard (chalk smudges and dust, .tlo-kreda in globals.css); marmur: dark marble with gold veins
   * (.tlo-marmur); plamy: beige blobs and thin red contour lines in the corners (.tlo-plamy).
   */
  tekstura?: "kreda" | "marmur" | "plamy";
  /**
   * A banner instead of the category photo, with the venue name (the page's <h1>) and the address in `podpis`.
   * swietliki: night and the venue's emblem (a file in public/); belka: the name on a black bar, below it a line in the
   * accent color and `haslo`; krata: cream background, `haslo` in the label font, the name and a checkered strip;
   * kreska: `haslo` in letter-spaced uppercase, a thick black line, the name below it (like a menu card header);
   * tablica: a large name, `haslo` letter-spaced below it and a line in the Italian colors; pas: a dark strip (accent
   * color) with the name in the middle, a line and `haslo` in the obrys-2 color; elegancki: on the page background the
   * name in large italics (decorative font), a thin gold line with a diamond and `haslo`; ludzik: the venue mascot
   * (`znak`, a file in public/) sways and jumps when a dish is added, the name below it.
   */
  baner?:
    | { rodzaj: "swietliki"; znak: string; podpis: string }
    | { rodzaj: "belka" | "krata" | "kreska" | "tablica" | "pas" | "elegancki"; haslo?: string; podpis: string }
    | { rodzaj: "ludzik"; znak: string; haslo?: string; podpis: string };
  /** Numbered menu items with dot leaders to the price — as on the venue's card. */
  menuNumerowane?: boolean;
  /** Menu sections on black bars, prices on labels in the accent color (numbered, no dots). */
  menuBelki?: boolean;
  /** Dishes on white cards in a grid, prices on pills in the label font, sections as pill toggles. */
  menuKarty?: boolean;
  /**
   * Menu as a list, price on the right. wersaliki: underlined sections, dish names in letter-spaced uppercase,
   * ingredients after „|”; tablica: handwritten sections with a line in the Italian colors, „(vege)” in green,
   * underlined prices; srodek: everything centered, sections in the decorative font, ingredients in the label font in
   * the akcent-tekst color after „•”; kropki: sections in the decorative italic, dish names in uppercase, dot leaders
   * to the price.
   */
  menuSpis?: "wersaliki" | "tablica" | "srodek" | "kropki";
};

const THEMES: Record<string, PageTheme> = {
  // pizzeriaparkowa.pl: black background, fireflies, a white tree, Playfair Display + Karla, green accents.
  "pizzeria-parkowa-krasnik": {
    ciemny: true,
    kolory: {
      tlo: "#0a0a0a",
      karta: "#141414",
      krem: "#1b211d",
      tekst: "#f5f5f4",
      "tekst-2": "#a3a3a3",
      obrys: "#232323",
      "obrys-2": "#3a3a3a",
      akcent: "#86efac",
      "akcent-tekst": "#4ade80",
      "na-akcencie": "#052e16",
      otwarte: "#4ade80",
      zamkniete: "#fca5a5",
    },
    kroje: { naglowki: "playfair", tekst: "karla" },
    // the tree from pizzeriaparkowa.pl (the user pointed to it on 25.10)
    baner: {
      rodzaj: "swietliki",
      znak: "/motywy/parkowa/drzewo.png",
      podpis: "Kraśnik · ul. Parkowa 1 · Piec Moretti · Pizza 32 cm",
    },
    menuNumerowane: true,
  },
  // The menu card from the venue's Facebook (20.01.2026): white background, sections on black bars, numbered dishes in
  // uppercase, prices on orange labels — with dark text, because white on that orange has a 2.8:1 contrast. Their logo
  // (a bull) and the sketches from the card only with the venue's consent — without them for now.
  "burger-pizza-krasnik": {
    kolory: {
      tlo: "#ffffff",
      karta: "#ffffff",
      krem: "#f3f2f0",
      tekst: "#2b2a28",
      "tekst-2": "#5c5a57",
      obrys: "#e7e5e2",
      "obrys-2": "#cfccc8",
      akcent: "#eb8523",
      "akcent-tekst": "#b45309",
      "na-akcencie": "#2b2a28",
    },
    kroje: { naglowki: "rokkitt", tekst: "roboto-condensed" },
    baner: { rodzaj: "belka", haslo: "Handmade", podpis: "Kraśnik · ul. Lubelska 117" },
    menuNumerowane: true,
    menuBelki: true,
  },
  // brunoo.pl/menu (30.10): cream background, white dish cards with a thin border, dark green pills, burgundy labels,
  // Roboto + Roboto Mono, a black-and-white checkerboard. No numbers — their card numbering differs from our sections.
  // Their logo and dish photos only with the venue's consent — without them for now.
  "brunoo-krasnik": {
    kolory: {
      tlo: "#faf6ea",
      karta: "#ffffff",
      krem: "#f5efdf",
      tekst: "#1a1410",
      "tekst-2": "#6b6357",
      obrys: "#e4e0d3",
      "obrys-2": "#c9c2b0",
      akcent: "#072821",
      "akcent-tekst": "#7e2625",
      "na-akcencie": "#f5efdf",
    },
    kroje: { naglowki: "roboto", tekst: "roboto", etykiety: "roboto-mono" },
    baner: { rodzaj: "krata", haslo: "Na miejscu · na wynos · z dowozem", podpis: "Kraśnik · ul. ks. Jerzego Popiełuszki 1" },
    menuKarty: true,
  },
  // The menu card from the venue's Facebook (17.01.2026): white background, black text, „RESTAURACJA ▬ KWADRAT”,
  // underlined sections, bold dish names in letter-spaced uppercase, ingredients after „|”, a leaf next to vegetarian
  // dishes. Their logo (a square with lettering) only with the venue's consent — without it for now.
  "kwadrat-miejsce-spotkan-stroza-kolonia": {
    kolory: {
      tlo: "#ffffff",
      karta: "#ffffff",
      krem: "#f4f4f3",
      tekst: "#111111",
      "tekst-2": "#4a4a4a",
      obrys: "#e6e6e6",
      "obrys-2": "#c8c8c8",
      akcent: "#111111",
      "akcent-tekst": "#111111",
      "na-akcencie": "#ffffff",
    },
    kroje: { naglowki: "montserrat", tekst: "open-sans" },
    baner: { rodzaj: "kreska", haslo: "Restauracja", podpis: "Stróża-Kolonia · ul. Dworska 6" },
    menuSpis: "wersaliki",
  },
  // siwloska.pl, PDF menu 2026: a black chalkboard, white text, brush section titles with a line in the Italian colors,
  // „(vege)” in green, underlined prices. Their logo (Si! in a circle) only with the venue's consent — without it for
  // now.
  "si-krasnik": {
    ciemny: true,
    tekstura: "kreda",
    kolory: {
      tlo: "#1d1e1d",
      karta: "#262726",
      krem: "#2f302f",
      tekst: "#f5f5f3",
      "tekst-2": "#b9bab6",
      obrys: "#3b3c3b",
      "obrys-2": "#5a5b58",
      akcent: "#f5f5f3",
      "akcent-tekst": "#5fd38a",
      "na-akcencie": "#1d1e1d",
      otwarte: "#5fd38a",
      zamkniete: "#ff8a80",
    },
    kroje: { naglowki: "outfit", tekst: "outfit", ozdobny: "kaushan" },
    baner: { rodzaj: "tablica", haslo: "Włoska", podpis: "Kraśnik · ul. Adama Mickiewicza 1k" },
    menuSpis: "tablica",
  },
  // musicaffe.pl/menu (31.10): a white, centered card, a dark strip at the top, sections in Comfortaa, dish names in
  // Sanchez, burgundy ingredients (Lora) after „•”, beige accents. Their logo only with the venue's consent — without
  // it for now.
  "musicaffe-krasnik": {
    kolory: {
      tlo: "#ffffff",
      karta: "#ffffff",
      krem: "#f6f0e6",
      tekst: "#28262b",
      "tekst-2": "#615f63",
      obrys: "#ece6dc",
      "obrys-2": "#d2bd9c",
      akcent: "#1b1b1b",
      "akcent-tekst": "#8f2020",
      "na-akcencie": "#ffffff",
    },
    kroje: { naglowki: "sanchez", tekst: "raleway", etykiety: "lora", ozdobny: "comfortaa" },
    baner: { rodzaj: "pas", haslo: "Restauracja · pizza · przyjęcia", podpis: "Kraśnik · ul. Zygmunta Krasińskiego 11f" },
    menuSpis: "srodek",
  },
  // The menu card from the venue's Facebook (Kinowa Craft Food Pub, 31.10): dark brown marble, sections in an elegant
  // serif italic, dish names in uppercase with dot leaders to the price, descriptions in a light sans. Their logo only
  // with the venue's consent.
  "kinowa-krasnik": {
    ciemny: true,
    tekstura: "marmur",
    kolory: {
      tlo: "#1e1611",
      karta: "#2a1f18",
      krem: "#33261d",
      tekst: "#f4ece2",
      "tekst-2": "#c8b9a8",
      obrys: "#3e2f25",
      "obrys-2": "#6b5646",
      akcent: "#ead8bf",
      "akcent-tekst": "#d8b483",
      "na-akcencie": "#1e1611",
      otwarte: "#8fd6a2",
      zamkniete: "#ff9f8f",
    },
    kroje: { naglowki: "montserrat", tekst: "montserrat", ozdobny: "bodoni" },
    baner: { rodzaj: "elegancki", haslo: "Craft Food Pub", podpis: "Kraśnik · al. Niepodległości 44" },
    menuSpis: "kropki",
  },
  // The menu card from the user (31.10): cream background, beige blobs, thin red contour lines, bold black uppercase
  // (Poppins), prices on the right. The mascot (a figure with a bowl) comes from their logo — the user gave it for the
  // page; confirm the venue's consent.
  "tam-tam-krasnik": {
    tekstura: "plamy",
    kolory: {
      tlo: "#f8f0e3",
      karta: "#fffaf2",
      krem: "#efe2c9",
      tekst: "#1c1a17",
      "tekst-2": "#5e5448",
      obrys: "#e6d8bf",
      "obrys-2": "#c9b48f",
      akcent: "#b23a2b",
      "akcent-tekst": "#9c2f22",
      "na-akcencie": "#ffffff",
    },
    kroje: { naglowki: "poppins", tekst: "poppins", ozdobny: "rubik-dirt" },
    baner: { rodzaj: "ludzik", znak: "/motywy/tamtam/ludzik.png", haslo: "Kuchnia azjatycka", podpis: "Kraśnik · ul. Urzędowska 4" },
    menuSpis: "wersaliki",
  },
};

export function pageTheme(slug: string): PageTheme | null {
  return THEMES[slug] ?? null;
}
