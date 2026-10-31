import type { Venue } from "./lokale";
import { CATEGORY_PHOTOS, type PhotoKey, type CategoryPhoto } from "./zdjeciaKategorii";

export type IconKey =
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

const ASIAN_CUISINES = ["chinese", "asian", "vietnamese", "thai", "japanese", "sushi", "indian"];

type Theme = { kolor: string; ikona: IconKey; zdjecie?: CategoryPhoto };

function theme(color: string, icon: IconKey, photo: PhotoKey): Theme {
  return { kolor: color, ikona: icon, zdjecie: CATEGORY_PHOTOS[photo] };
}

function cuisineTheme(k: string): Theme | null {
  if (k.includes("pizza")) return theme("#c9341a", "pizza", "pizza");
  if (k === "burger") return theme("#b45309", "burger", "burger");
  if (k === "kebab") return theme("#c2410c", "kebab", "kebab");
  if (ASIAN_CUISINES.includes(k)) return theme("#9f1d1d", "zupa", "azjatycka");
  if (k === "greek") return theme("#2f5d8a", "sztucce", "grecka");
  if (k === "italian") return theme("#8f2d1f", "sztucce", "wloska");
  if (k === "polish" || k === "regional" || k === "dumplings") return theme("#8a5a12", "zupa", "polska");
  if (k === "steak_house" || k === "international") return theme("#3b322c", "sztucce", "restauracja");
  return null;
}

/**
 * Wygląd banera karty, dopóki lokal nie ma własnych zdjęć: zdjęcie poglądowe kategorii, a gdy go brak —
 * kolor z ikoną. Każdy kolor ma kontrast co najmniej 4,5:1 z bielą (biała ikona na kolorze).
 * Decyduje pierwsza rozpoznana kuchnia: najpierw idą te z danych lokalu, potem dopisane z nazwy i menu
 * (`pobierzLokale`), więc włoska restauracja z pizzą w karcie nie dostaje banera pizzerii.
 */
export function venueTheme(l: Pick<Venue, "typ" | "kuchnie">): Theme {
  for (const k of l.kuchnie) {
    const m = cuisineTheme(k);
    if (m) return m;
  }
  switch (l.typ) {
    case "cafe":
      return theme("#6b4226", "kawa", "kawa");
    case "ice_cream":
      return theme("#b8325f", "lody", "lody");
    case "pub":
      return theme("#9a5b06", "piwo", "piwo");
    case "bar":
      return theme("#7c2d12", "wino", "bar");
    case "fast_food":
      return theme("#c2410c", "kebab", "fastfood");
    default:
      return theme("#3b322c", "sztucce", "restauracja");
  }
}
