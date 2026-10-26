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
export type KrojLokalu = "playfair" | "karla";

export type MotywStrony = {
  kolory: Partial<Record<TokenKoloru, string>>;
  ciemny?: boolean; // ciemne pola formularzy i paski przewijania
  kroje?: { naglowki: KrojLokalu; tekst: KrojLokalu };
  /** Baner zamiast zdjęcia kategorii: znak lokalu (plik w public/), pod nim nazwa i `podpis` z adresem. */
  baner?: { rodzaj: "swietliki"; znak: string; podpis: string };
  /** Pozycje menu ponumerowane, z kropkami do ceny — jak w karcie lokalu. */
  menuNumerowane?: boolean;
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
};

export function motywStrony(slug: string): MotywStrony | null {
  return MOTYWY[slug] ?? null;
}
