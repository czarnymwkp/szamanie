import { ZDJECIA_DAN, type KluczDania } from "./zdjeciaDan";
import { ZDJECIA_KATEGORII, type KluczZdjecia } from "./zdjeciaKategorii";

// Zdjęcie poglądowe na kartę lokalu — każdy lokal inne, dopóki nie ma własnych zdjęć. Kolejność wyboru: dania
// z jego menu (najczęstsze najpierw), potem jego kuchnie i rodzaj lokalu, a gdy pula się wyczerpie — dowolne
// nieużyte zdjęcie. Zdjęć (dania + kategorie) jest więcej niż lokali, więc nic się nie powtarza.

export type ZdjecieLokalu = { plik: string; pozycja?: string };
type Kandydat = KluczDania | `kategoria:${KluczZdjecia}`;

const POLSKA: Kandydat[] = [
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
const AZJATYCKA: Kandydat[] = ["kategoria:azjatycka", "krewetki", "kurczak-sos", "ryba"];
const ELEGANCKA: Kandydat[] = ["poledwiczka", "tatar", "losos", "carpaccio", "kategoria:restauracja", "ryba", "kaczka"];

const Z_KUCHNI: Record<string, Kandydat[]> = {
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
  polish: POLSKA,
  regional: POLSKA,
  dumplings: ["pierogi", ...POLSKA],
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
  chinese: AZJATYCKA,
  asian: AZJATYCKA,
  vietnamese: AZJATYCKA,
  thai: AZJATYCKA,
  japanese: AZJATYCKA,
  sushi: AZJATYCKA,
  indian: AZJATYCKA,
  steak_house: ELEGANCKA,
  international: ELEGANCKA,
  fine_dining: ELEGANCKA,
  salad: ["salatka", "salatka-cezar", "salatka-grecka"],
  cake: ["szarlotka", "tarta", "fondant", "tiramisu"],
  coffee_shop: ["cappuccino", "latte", "espresso", "kawa-mrozona"],
  ice_cream: ["lody", "panna-cotta", "cannolo"],
};

const Z_TYPU: Record<string, Kandydat[]> = {
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
const NAPOJE = new Set<KluczDania>([
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
const WSZYSTKIE: Kandydat[] = [
  ...(Object.keys(ZDJECIA_KATEGORII) as KluczZdjecia[]).map((k) => `kategoria:${k}` as const),
  ...(Object.keys(ZDJECIA_DAN) as KluczDania[]).filter((k) => !NAPOJE.has(k)),
];

function zdjecie(k: Kandydat): ZdjecieLokalu | null {
  if (k.startsWith("kategoria:")) {
    const z = ZDJECIA_KATEGORII[k.slice("kategoria:".length) as KluczZdjecia];
    return z ? { plik: z.plik, pozycja: z.pozycja } : null;
  }
  const z = ZDJECIA_DAN[k as KluczDania];
  return z ? { plik: z.plik } : null;
}

/** Dania z menu lokalu do wyboru zdjęcia (bez napojów), od najczęstszego. */
export function daniaNaZdjecie(klucze: KluczDania[]): KluczDania[] {
  const ile = new Map<KluczDania, number>();
  for (const k of klucze) if (!NAPOJE.has(k)) ile.set(k, (ile.get(k) ?? 0) + 1);
  return [...ile.keys()].sort((a, b) => ile.get(b)! - ile.get(a)!);
}

/** Każdemu lokalowi inne zdjęcie: najpierw lokale z najkrótszą listą pasujących, żeby nie zostały z niczym. */
export function przydzielZdjecia(
  lokale: { id: number; typ: string; kuchnie: string[] }[],
  daniaZMenu: Map<number, KluczDania[]>,
): Map<number, ZdjecieLokalu> {
  const listy = lokale.map((l) => ({
    id: l.id,
    lista: [
      ...new Set<Kandydat>([
        ...(daniaZMenu.get(l.id) ?? []),
        ...l.kuchnie.flatMap((k) => Z_KUCHNI[k] ?? []),
        ...(Z_TYPU[l.typ] ?? Z_TYPU.restaurant),
      ]),
    ].filter((k) => zdjecie(k)),
  }));
  listy.sort((a, b) => a.lista.length - b.lista.length || a.id - b.id);

  const uzyte = new Set<Kandydat>();
  const wynik = new Map<number, ZdjecieLokalu>();
  for (const { id, lista } of listy) {
    const k = lista.find((k) => !uzyte.has(k)) ?? WSZYSTKIE.find((k) => !uzyte.has(k)) ?? lista[0];
    if (!k) continue;
    uzyte.add(k);
    wynik.set(id, zdjecie(k)!);
  }
  return wynik;
}
