/**
 * Własny wygląd strony lokalu, dopasowany do jego marki (strony www, karty menu). Kolory nadpisują tokeny
 * z `@theme` (globals.css) na <article> strony lokalu, więc komponenty nie wiedzą o motywie — używają
 * `bg-karta`, `text-tekst` itd. Na razie motywy są tutaj, później przejdą do panelu lokalu.
 * Logo i zdjęcia lokalu tylko za zgodą właściciela (przed wdrożeniem potwierdzić).
 */

export type TokenKoloru =
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

/** Kroje z `components/szablony/kroje.ts`. */
export type KrojLokalu =
  | "playfair"
  | "karla"
  | "rokkitt"
  | "roboto-condensed"
  | "roboto"
  | "roboto-mono"
  | "montserrat"
  | "open-sans";

export type MotywStrony = {
  kolory: Partial<Record<TokenKoloru, string>>;
  ciemny?: boolean; // ciemne pola formularzy i paski przewijania
  /** etykiety: drobne napisy wersalikami (ceny, cechy dań) — przez --etykiety-lokalu; bez niego krój tekstu. */
  kroje?: { naglowki: KrojLokalu; tekst: KrojLokalu; etykiety?: KrojLokalu };
  /**
   * Baner zamiast zdjęcia kategorii, z nazwą lokalu (to jest <h1> strony) i `podpis` z adresem.
   * swietliki: noc i znak lokalu (plik w public/); belka: nazwa na czarnej belce, pod nią kreska w kolorze akcentu i `haslo`;
   * krata: kremowe tło, `haslo` krojem etykiet, nazwa i pasek w szachownicę;
   * kreska: `haslo` rozstrzelonymi wersalikami, gruba czarna kreska, pod nią nazwa (jak nagłówek karty menu).
   */
  baner?:
    | { rodzaj: "swietliki"; znak: string; podpis: string }
    | { rodzaj: "belka" | "krata" | "kreska"; haslo?: string; podpis: string };
  /** Pozycje menu ponumerowane, z kropkami do ceny — jak w karcie lokalu. */
  menuNumerowane?: boolean;
  /** Działy menu na czarnych belkach, ceny na etykietach w kolorze akcentu (z numerami, bez kropek). */
  menuBelki?: boolean;
  /** Dania na białych kartach w siatce, ceny na pigułkach krojem etykiet, działy jak przełączniki-pigułki. */
  menuKarty?: boolean;
  /** Karta jak spis: działy podkreślone, nazwy dań rozstrzelonymi wersalikami, cena po prawej, skład po „|”. */
  menuSpis?: boolean;
};

const MOTYWY: Record<string, MotywStrony> = {
  // pizzeriaparkowa.pl: czarne tło, świetliki, białe drzewo, Playfair Display + Karla, zielone akcenty.
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
    // drzewo z pizzeriaparkowa.pl (user wskazał je 25.10)
    baner: {
      rodzaj: "swietliki",
      znak: "/motywy/parkowa/drzewo.png",
      podpis: "Kraśnik · ul. Parkowa 1 · Piec Moretti · Pizza 32 cm",
    },
    menuNumerowane: true,
  },
  // Karta z Facebooka lokalu (20.01.2026): białe tło, działy na czarnych belkach, numerowane dania wersalikami,
  // ceny na pomarańczowych etykietach — z ciemnym tekstem, bo biały na tym pomarańczu ma kontrast 2,8:1.
  // Ich logo (byk) i szkice z karty tylko za zgodą lokalu — na razie bez nich.
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
  // brunoo.pl/menu (30.10): kremowe tło, białe karty dań z cienką ramką, ciemnozielone pigułki, bordowe etykiety,
  // Roboto + Roboto Mono, czarno-biała szachownica. Bez numerów — ich numeracja w karcie jest inna niż nasze działy.
  // Ich logo i zdjęcia dań tylko za zgodą lokalu — na razie bez nich.
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
  // Karta z Facebooka lokalu (17.01.2026): białe tło, czarny tekst, „RESTAURACJA ▬ KWADRAT”, działy podkreślone,
  // nazwy dań pogrubione rozstrzelonymi wersalikami, skład po „|”, listek przy wege. Ich logo (kwadrat
  // z napisem) tylko za zgodą lokalu — na razie bez niego.
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
    menuSpis: true,
  },
};

export function motywStrony(slug: string): MotywStrony | null {
  return MOTYWY[slug] ?? null;
}
