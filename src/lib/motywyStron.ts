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

export type MotywStrony = {
  kolory: Partial<Record<TokenKoloru, string>>;
  ciemny?: boolean; // ciemne pola formularzy i paski przewijania
  /** etykiety: drobne napisy wersalikami (ceny, cechy dań) — przez --etykiety-lokalu; bez niego krój tekstu. */
  /** ozdobny: pismo odręczne w tytułach działów menu — przez --ozdobny-lokalu. */
  kroje?: { naglowki: KrojLokalu; tekst: KrojLokalu; etykiety?: KrojLokalu; ozdobny?: KrojLokalu };
  /**
   * kreda: tablica kredowa (smugi i pył kredy, .tlo-kreda w globals.css); marmur: ciemny marmur ze złotymi
   * żyłkami (.tlo-marmur); plamy: beżowe plamy i cienkie czerwone warstwice w rogach (.tlo-plamy).
   */
  tekstura?: "kreda" | "marmur" | "plamy";
  /**
   * Baner zamiast zdjęcia kategorii, z nazwą lokalu (to jest <h1> strony) i `podpis` z adresem.
   * swietliki: noc i znak lokalu (plik w public/); belka: nazwa na czarnej belce, pod nią kreska w kolorze akcentu i `haslo`;
   * krata: kremowe tło, `haslo` krojem etykiet, nazwa i pasek w szachownicę;
   * kreska: `haslo` rozstrzelonymi wersalikami, gruba czarna kreska, pod nią nazwa (jak nagłówek karty menu);
   * tablica: duża nazwa, `haslo` rozstrzelone pod nią i kreska w barwach Włoch;
   * pas: ciemny pas (kolor akcentu) z nazwą na środku, kreska i `haslo` w kolorze obrys-2;
   * elegancki: na tle strony nazwa dużą kursywą (krój ozdobny), cienka złota kreska z rombem i `haslo`;
   * ludzik: maskotka lokalu (`znak`, plik w public/) kołysze się i podskakuje przy dodaniu dania, pod nią nazwa.
   */
  baner?:
    | { rodzaj: "swietliki"; znak: string; podpis: string }
    | { rodzaj: "belka" | "krata" | "kreska" | "tablica" | "pas" | "elegancki"; haslo?: string; podpis: string }
    | { rodzaj: "ludzik"; znak: string; haslo?: string; podpis: string };
  /** Pozycje menu ponumerowane, z kropkami do ceny — jak w karcie lokalu. */
  menuNumerowane?: boolean;
  /** Działy menu na czarnych belkach, ceny na etykietach w kolorze akcentu (z numerami, bez kropek). */
  menuBelki?: boolean;
  /** Dania na białych kartach w siatce, ceny na pigułkach krojem etykiet, działy jak przełączniki-pigułki. */
  menuKarty?: boolean;
  /**
   * Karta jak spis, cena po prawej. wersaliki: działy podkreślone, nazwy dań rozstrzelonymi wersalikami, skład po „|”;
   * tablica: działy pismem odręcznym z kreską w barwach Włoch, „(vege)” na zielono, ceny podkreślone;
   * srodek: wszystko wyśrodkowane, działy krojem ozdobnym, składniki krojem etykiet w kolorze akcent-tekst po „•”;
   * kropki: działy kursywą krojem ozdobnym, nazwy dań wersalikami, kropki do ceny.
   */
  menuSpis?: "wersaliki" | "tablica" | "srodek" | "kropki";
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
    menuSpis: "wersaliki",
  },
  // siwloska.pl, karta PDF 2026: czarna tablica kredowa, biały tekst, tytuły działów pędzlem z kreską w barwach Włoch,
  // „(vege)” na zielono, ceny podkreślone. Ich logo (Si! w kole) tylko za zgodą lokalu — na razie bez niego.
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
  // musicaffe.pl/menu (31.10): biała, wyśrodkowana karta, ciemny pasek u góry, działy Comfortaa, nazwy dań Sanchez,
  // składniki bordowe (Lora) po „•”, beżowe akcenty. Ich logo tylko za zgodą lokalu — na razie bez niego.
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
  // Karta z Facebooka lokalu (Kinowa Craft Food Pub, 31.10): ciemny brązowy marmur, działy elegancką szeryfową
  // kursywą, nazwy dań wersalikami z kropkami do ceny, opisy jasnym bezszeryfowym. Ich logo tylko za zgodą lokalu.
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
  // Karta od usera (31.10): kremowe tło, beżowe plamy, cienkie czerwone warstwice, czarne pogrubione wersaliki
  // (Poppins), ceny po prawej. Maskotka (ludzik z miską) z ich logo — user dał ją do strony; zgodę lokalu potwierdzić.
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

export function motywStrony(slug: string): MotywStrony | null {
  return MOTYWY[slug] ?? null;
}
