import type { Venue } from "./venues";
import { CATEGORY_PHOTOS, type PhotoKey, type CategoryPhoto } from "./categoryPhotos";

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
 * Look of the card banner until a venue has its own photos: an illustrative category photo, or without one — a color
 * with an icon. Every color has at least 4.5:1 contrast with white (a white icon on the color). The first recognized
 * cuisine decides: those from the venue data come first, then those inferred from the name and the menu (`getVenues`),
 * so an Italian restaurant with pizza on its menu does not get a pizzeria banner.
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
