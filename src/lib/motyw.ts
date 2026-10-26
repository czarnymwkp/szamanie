import type { Lokal } from "./lokale";
import { ZDJECIA_KATEGORII, type KluczZdjecia, type ZdjecieKategorii } from "./zdjeciaKategorii";

export type KluczIkony =
  | "wszystko"
  | "pizza"
  | "burger"
  | "kebab"
  | "zupa"
  | "kawa"
  | "lody"
  | "piwo"
  | "wino"
  | "sztucce";

const AZJATYCKIE = ["chinese", "asian", "vietnamese", "thai", "japanese", "sushi", "indian"];

type Motyw = { kolor: string; ikona: KluczIkony; zdjecie?: ZdjecieKategorii };

function motyw(kolor: string, ikona: KluczIkony, zdjecie: KluczZdjecia): Motyw {
  return { kolor, ikona, zdjecie: ZDJECIA_KATEGORII[zdjecie] };
}

function motywKuchni(k: string): Motyw | null {
  if (k.includes("pizza")) return motyw("#c9341a", "pizza", "pizza");
  if (k === "burger") return motyw("#b45309", "burger", "burger");
  if (k === "kebab") return motyw("#c2410c", "kebab", "kebab");
  if (AZJATYCKIE.includes(k)) return motyw("#9f1d1d", "zupa", "azjatycka");
  if (k === "greek") return motyw("#2f5d8a", "sztucce", "grecka");
  if (k === "italian") return motyw("#8f2d1f", "sztucce", "wloska");
  if (k === "polish" || k === "regional" || k === "dumplings") return motyw("#8a5a12", "zupa", "polska");
  if (k === "steak_house" || k === "international") return motyw("#3b322c", "sztucce", "restauracja");
  return null;
}

/**
 * Wygląd banera karty, dopóki lokal nie ma własnych zdjęć: zdjęcie poglądowe kategorii, a gdy go brak —
 * kolor z ikoną. Każdy kolor ma kontrast co najmniej 4,5:1 z bielą (biała ikona, kolorowe inicjały na białym).
 * Decyduje pierwsza rozpoznana kuchnia: najpierw idą te z danych lokalu, potem dopisane z nazwy i menu
 * (`pobierzLokale`), więc włoska restauracja z pizzą w karcie nie dostaje banera pizzerii.
 */
export function motywLokalu(l: Pick<Lokal, "typ" | "kuchnie">): Motyw {
  for (const k of l.kuchnie) {
    const m = motywKuchni(k);
    if (m) return m;
  }
  switch (l.typ) {
    case "cafe":
      return motyw("#6b4226", "kawa", "kawa");
    case "ice_cream":
      return motyw("#b8325f", "lody", "lody");
    case "pub":
      return motyw("#9a5b06", "piwo", "piwo");
    case "bar":
      return motyw("#7c2d12", "wino", "bar");
    case "fast_food":
      return motyw("#c2410c", "kebab", "fastfood");
    default:
      return motyw("#3b322c", "sztucce", "restauracja");
  }
}

/** „Pyszny Kebab” → „PK”, „Santorini” → „S” — zastępcze logo lokalu. */
export function inicjaly(nazwa: string) {
  const slowa = nazwa.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return slowa
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}
