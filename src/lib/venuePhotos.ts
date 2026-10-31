import { DISH_PHOTOS, type DishKey } from "./dishPhotos";
import { CATEGORY_PHOTOS, type PhotoKey } from "./categoryPhotos";

// Zdjęcie poglądowe na kartę lokalu — każdy lokal inne, dopóki nie ma własnych zdjęć. Kolejność wyboru: dania
// z jego menu (najczęstsze najpierw), potem jego kuchnie i rodzaj lokalu, a gdy pula się wyczerpie — dowolne
// nieużyte zdjęcie. Zdjęć (dania + kategorie) jest więcej niż lokali, więc nic się nie powtarza.

export type VenuePhoto = { plik: string; pozycja?: string };
type Candidate = DishKey | `kategoria:${PhotoKey}`;

const POLISH: Candidate[] = [
  "kategoria:polska",
  "pierogi",
  "schabowy",
  "zurek",
  "golonka",
  "rosol",
  "placki",
  "zupa-pomidorowa",
  "kaczka",
  "pieczen",
  "zeberka",
  "flaki",
  "kurczak-sos",
];
const ASIAN: Candidate[] = ["kategoria:azjatycka", "krewetki", "kurczak-sos", "ryba"];
const FINE_DINING: Candidate[] = ["poledwiczka", "tatar", "losos", "carpaccio", "kategoria:restauracja", "ryba", "kaczka"];

const BY_CUISINE: Record<string, Candidate[]> = {
  pizza: [
    "kategoria:pizza",
    "pizza",
    "pizza-margherita",
    "pizza-salami",
    "pizza-pieczarki",
    "pizza-rukola",
    "pizza-biala",
    "pizza-hawajska",
    "calzone",
    "focaccia",
  ],
  burger: ["kategoria:burger", "burger", "burger-podwojny", "burger-kurczak", "frytki", "nuggetsy"],
  chicken: ["kurczak", "nuggetsy", "burger-kurczak"],
  kebab: ["kategoria:kebab", "wrap", "kanapka", "kurczak", "tost", "frytki", "nuggetsy"],
  polish: POLISH,
  regional: POLISH,
  dumplings: ["pierogi", ...POLISH],
  italian: [
    "kategoria:wloska",
    "carbonara",
    "lasagne",
    "pesto",
    "gnocchi",
    "ravioli",
    "bolognese",
    "makaron-kremowy",
    "makaron-owoce-morza",
    "burrata",
    "bruschetta",
    "carpaccio",
  ],
  pasta: ["carbonara", "bolognese", "pesto", "makaron-kremowy"],
  greek: ["kategoria:grecka", "salatka-grecka", "ryba", "krewetki"],
  chinese: ASIAN,
  asian: ASIAN,
  vietnamese: ASIAN,
  thai: ASIAN,
  japanese: ASIAN,
  sushi: ASIAN,
  indian: ASIAN,
  steak_house: FINE_DINING,
  international: FINE_DINING,
  fine_dining: FINE_DINING,
  salad: ["salatka", "salatka-cezar", "salatka-grecka"],
  cake: ["szarlotka", "tarta", "fondant", "tiramisu"],
  coffee_shop: ["cappuccino", "latte", "espresso", "kawa-mrozona"],
  ice_cream: ["lody", "panna-cotta", "cannolo"],
};

const BY_TYPE: Record<string, Candidate[]> = {
  cafe: [
    "kategoria:kawa",
    "cappuccino",
    "latte",
    "espresso",
    "kawa-mrozona",
    "szarlotka",
    "tiramisu",
    "tarta",
    "fondant",
    "cannolo",
    "pancakes",
    "nalesniki",
  ],
  ice_cream: [
    "kategoria:lody",
    "lody",
    "panna-cotta",
    "cannolo",
    "tiramisu",
    "fondant",
    "pancakes",
    "nalesniki",
    "szarlotka",
    "tarta",
  ],
  pub: ["kategoria:piwo", "piwo", "deska", "whisky", "drink", "frytki"],
  bar: ["kategoria:bar", "drink", "mojito", "aperol", "wino", "piwo", "deska"],
  fast_food: ["kategoria:fastfood", "frytki", "nuggetsy", "wrap", "tost", "kanapka", "burger"],
  restaurant: [
    "kategoria:restauracja",
    "schabowy",
    "poledwiczka",
    "pieczen",
    "losos",
    "kaczka",
    "salatka",
    "deska",
    "zupa-pomidorowa",
    "ryba",
    "kurczak-sos",
  ],
};

// Napoje z menu nie idą na kartę lokalu — bary, puby i kawiarnie dostają je z puli swojego rodzaju.
const DRINKS = new Set<DishKey>([
  "espresso",
  "cappuccino",
  "latte",
  "kawa-mrozona",
  "herbata",
  "lemoniada",
  "cola",
  "napoj",
  "sok",
  "woda",
  "piwo",
  "wino",
  "aperol",
  "mojito",
  "drink",
  "shot",
  "whisky",
]);
// Na ostatnią chwilę (gdy pule się wyczerpią) — bez napojów, które słabo wyglądają jako zdjęcie lokalu.
const ALL: Candidate[] = [
  ...(Object.keys(CATEGORY_PHOTOS) as PhotoKey[]).map((k) => `kategoria:${k}` as const),
  ...(Object.keys(DISH_PHOTOS) as DishKey[]).filter((k) => !DRINKS.has(k)),
];

function photo(k: Candidate): VenuePhoto | null {
  if (k.startsWith("kategoria:")) {
    const z = CATEGORY_PHOTOS[k.slice("kategoria:".length) as PhotoKey];
    return z ? { plik: z.plik, pozycja: z.pozycja } : null;
  }
  const z = DISH_PHOTOS[k as DishKey];
  return z ? { plik: z.plik } : null;
}

/** Dania z menu lokalu do wyboru zdjęcia (bez napojów), od najczęstszego. */
export function dishesForPhoto(keys: DishKey[]): DishKey[] {
  const count = new Map<DishKey, number>();
  for (const k of keys) if (!DRINKS.has(k)) count.set(k, (count.get(k) ?? 0) + 1);
  return [...count.keys()].sort((a, b) => count.get(b)! - count.get(a)!);
}

/** Każdemu lokalowi inne zdjęcie: najpierw lokale z najkrótszą listą pasujących, żeby nie zostały z niczym. */
export function assignPhotos(
  venues: { id: number; typ: string; kuchnie: string[] }[],
  dishesFromMenu: Map<number, DishKey[]>,
): Map<number, VenuePhoto> {
  const lists = venues.map((l) => ({
    id: l.id,
    lista: [
      ...new Set<Candidate>([
        ...(dishesFromMenu.get(l.id) ?? []),
        ...l.kuchnie.flatMap((k) => BY_CUISINE[k] ?? []),
        ...(BY_TYPE[l.typ] ?? BY_TYPE.restaurant),
      ]),
    ].filter((k) => photo(k)),
  }));
  lists.sort((a, b) => a.lista.length - b.lista.length || a.id - b.id);

  const used = new Set<Candidate>();
  const result = new Map<number, VenuePhoto>();
  for (const { id, lista } of lists) {
    const k = lista.find((k) => !used.has(k)) ?? ALL.find((k) => !used.has(k)) ?? lista[0];
    if (!k) continue;
    used.add(k);
    result.set(id, photo(k)!);
  }
  return result;
}
