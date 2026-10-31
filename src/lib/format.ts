import type { Venue } from "./venues";
import type { IconKey } from "./categoryTheme";

export const TYPES: Record<string, string> = {
  restaurant: "Restauracja",
  fast_food: "Fast food",
  cafe: "Kawiarnia",
  pub: "Pub",
  bar: "Bar",
  ice_cream: "Lodziarnia",
  food_court: "Strefa gastronomiczna",
};

const CUISINES: Record<string, string> = {
  pizza: "Pizza",
  italian_pizza: "Pizza",
  kebab: "Kebab",
  burger: "Burgery",
  chicken: "Kurczak",
  chinese: "Chińska",
  asian: "Azjatycka",
  vietnamese: "Wietnamska",
  thai: "Tajska",
  japanese: "Japońska",
  sushi: "Sushi",
  indian: "Indyjska",
  turkish: "Turecka",
  greek: "Grecka",
  italian: "Włoska",
  mexican: "Meksykańska",
  american: "Amerykańska",
  polish: "Polska",
  regional: "Regionalna",
  pasta: "Makarony",
  salad: "Sałatki",
  cake: "Ciasta",
  coffee_shop: "Kawa",
  tea: "Herbata",
  ice_cream: "Lody",
  fine_dining: "Fine dining",
  sandwich: "Kanapki",
  fish: "Ryby",
  seafood: "Owoce morza",
  steak_house: "Steki",
  grill: "Grill",
  barbecue: "Grill",
  breakfast: "Śniadania",
  pancake: "Naleśniki",
  crepe: "Naleśniki",
  dumplings: "Pierogi",
  hot_dog: "Hot dogi",
  zapiekanka: "Zapiekanki",
  vegan: "Wegańska",
  vegetarian: "Wegetariańska",
  international: "Międzynarodowa",
};

/** Cuisines guessed from the name when OSM has no cuisine tag — „Pizzeria Parkowa” → pizza. */
export function cuisinesFromName(name: string): string[] {
  const n = name.toLowerCase();
  const result: string[] = [];
  if (/pizz/.test(n)) result.push("pizza");
  if (/kebab|kebap|d[öo]ner|shawarma|szawarma/.test(n)) result.push("kebab");
  if (/burger/.test(n)) result.push("burger");
  if (/sushi/.test(n)) result.push("sushi");
  if (/pierog|pierożk/.test(n)) result.push("dumplings");
  if (/zapiek/.test(n)) result.push("zapiekanka");
  return result;
}

export function cuisineName(cuisine: string) {
  return CUISINES[cuisine] ?? (cuisine.charAt(0).toUpperCase() + cuisine.slice(1)).replace(/_/g, " ");
}

/** „Restauracja · Pizza · Włoska” */
export function venueDescription(venue: Venue) {
  return [...new Set([TYPES[venue.typ] ?? venue.typ, ...venue.kuchnie.map(cuisineName)])].join(" · ");
}

export function fullAddress(venue: Venue) {
  const { adres, miejscowosc } = venue;
  if (!adres) return miejscowosc ?? "";
  if (!miejscowosc || adres.startsWith(miejscowosc)) return adres;
  return `${adres}, ${miejscowosc}`;
}

const ASIAN_CUISINES = ["chinese", "asian", "vietnamese", "thai", "japanese", "sushi", "indian"];

export const CATEGORIES: { id: string; nazwa: string; ikona: IconKey; pasuje: (l: Venue) => boolean }[] = [
  { id: "wszystko", nazwa: "Wszystko", ikona: "wszystko", pasuje: () => true },
  { id: "pizza", nazwa: "Pizza", ikona: "pizza", pasuje: (l) => l.kuchnie.some((k) => k.includes("pizza")) },
  { id: "kebab", nazwa: "Kebab", ikona: "kebab", pasuje: (l) => l.kuchnie.includes("kebab") },
  { id: "burgery", nazwa: "Burgery", ikona: "burger", pasuje: (l) => l.kuchnie.includes("burger") },
  {
    id: "restauracje",
    nazwa: "Restauracje",
    ikona: "sztucce",
    pasuje: (l) => l.typ === "restaurant" || l.typ === "food_court",
  },
  { id: "fastfood", nazwa: "Fast food", ikona: "kebab", pasuje: (l) => l.typ === "fast_food" },
  { id: "kawiarnie", nazwa: "Kawiarnie", ikona: "kawa", pasuje: (l) => l.typ === "cafe" },
  {
    id: "lody",
    nazwa: "Lody",
    ikona: "lody",
    pasuje: (l) => l.typ === "ice_cream" || l.kuchnie.includes("ice_cream"),
  },
  { id: "azjatycka", nazwa: "Azjatycka", ikona: "zupa", pasuje: (l) => l.kuchnie.some((k) => ASIAN_CUISINES.includes(k)) },
  { id: "puby", nazwa: "Puby i bary", ikona: "piwo", pasuje: (l) => l.typ === "pub" || l.typ === "bar" },
];

/** plural(5, ["lokal", "lokale", "lokali"]) → "lokali" */
export function plural(n: number, [jeden, kilka, wiele]: [string, string, string]) {
  if (n === 1) return jeden;
  const d = n % 10;
  const s = n % 100;
  return d >= 2 && d <= 4 && (s < 12 || s > 14) ? kilka : wiele;
}

/** ileLokali(3) → "3 lokale" */
export const venueCount = (n: number) => `${n} ${plural(n, ["lokal", "lokale", "lokali"])}`;

/** venuesFound(3) → "są 3 lokale", venuesFound(10) → "jest 10 lokali" */
export const venuesFound = (n: number) => `${plural(n, ["jest", "są", "jest"])} ${venueCount(n)}`;

export const phoneUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const websiteUrl = (www: string) => (/^https?:\/\//.test(www) ? www : `https://${www}`);
export const facebookUrl = (fb: string) => (/^https?:\/\//.test(fb) ? fb : `https://www.facebook.com/${fb}`);
export const instagramUrl = (ig: string) =>
  /^https?:\/\//.test(ig) ? ig : `https://www.instagram.com/${ig.replace(/^@/, "")}`;
export const directionsUrl = (l: Pick<Venue, "lat" | "lon">) =>
  `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lon}`;
