import type { Lokal } from "./lokale";
import type { KluczIkony } from "./motyw";

export const TYPY: Record<string, string> = {
  restaurant: "Restauracja",
  fast_food: "Fast food",
  cafe: "Kawiarnia",
  pub: "Pub",
  bar: "Bar",
  ice_cream: "Lodziarnia",
  food_court: "Strefa gastronomiczna",
};

const KUCHNIE: Record<string, string> = {
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

/** Kuchnie odgadnięte z nazwy, gdy w OSM brak tagu cuisine — „Pizzeria Parkowa” → pizza. */
export function kuchnieZNazwy(nazwa: string): string[] {
  const n = nazwa.toLowerCase();
  const wynik: string[] = [];
  if (/pizz/.test(n)) wynik.push("pizza");
  if (/kebab|kebap|d[öo]ner|shawarma|szawarma/.test(n)) wynik.push("kebab");
  if (/burger/.test(n)) wynik.push("burger");
  if (/sushi/.test(n)) wynik.push("sushi");
  if (/pierog|pierożk/.test(n)) wynik.push("dumplings");
  if (/zapiek/.test(n)) wynik.push("zapiekanka");
  return wynik;
}

export function nazwaKuchni(kuchnia: string) {
  return KUCHNIE[kuchnia] ?? (kuchnia.charAt(0).toUpperCase() + kuchnia.slice(1)).replace(/_/g, " ");
}

/** „Restauracja · Pizza · Włoska” */
export function opisLokalu(lokal: Lokal) {
  return [...new Set([TYPY[lokal.typ] ?? lokal.typ, ...lokal.kuchnie.map(nazwaKuchni)])].join(" · ");
}

export function pelnyAdres(lokal: Lokal) {
  const { adres, miejscowosc } = lokal;
  if (!adres) return miejscowosc ?? "";
  if (!miejscowosc || adres.startsWith(miejscowosc)) return adres;
  return `${adres}, ${miejscowosc}`;
}

const AZJATYCKIE = ["chinese", "asian", "vietnamese", "thai", "japanese", "sushi", "indian"];

export const KATEGORIE: { id: string; nazwa: string; ikona: KluczIkony; pasuje: (l: Lokal) => boolean }[] = [
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
  { id: "azjatycka", nazwa: "Azjatycka", ikona: "zupa", pasuje: (l) => l.kuchnie.some((k) => AZJATYCKIE.includes(k)) },
  { id: "puby", nazwa: "Puby i bary", ikona: "piwo", pasuje: (l) => l.typ === "pub" || l.typ === "bar" },
];

/** odmiana(5, ["lokal", "lokale", "lokali"]) → "lokali" */
export function odmiana(n: number, [jeden, kilka, wiele]: [string, string, string]) {
  if (n === 1) return jeden;
  const d = n % 10;
  const s = n % 100;
  return d >= 2 && d <= 4 && (s < 12 || s > 14) ? kilka : wiele;
}

/** ileLokali(3) → "3 lokale" */
export const ileLokali = (n: number) => `${n} ${odmiana(n, ["lokal", "lokale", "lokali"])}`;

/** jestLokali(3) → "są 3 lokale", jestLokali(10) → "jest 10 lokali" */
export const jestLokali = (n: number) => `${odmiana(n, ["jest", "są", "jest"])} ${ileLokali(n)}`;

export const linkTelefonu = (telefon: string) => `tel:${telefon.replace(/[^\d+]/g, "")}`;
export const linkWww = (www: string) => (/^https?:\/\//.test(www) ? www : `https://${www}`);
export const linkFacebooka = (fb: string) => (/^https?:\/\//.test(fb) ? fb : `https://www.facebook.com/${fb}`);
export const linkInstagrama = (ig: string) =>
  /^https?:\/\//.test(ig) ? ig : `https://www.instagram.com/${ig.replace(/^@/, "")}`;
export const linkNawigacji = (l: Pick<Lokal, "lat" | "lon">) =>
  `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lon}`;
