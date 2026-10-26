// Zdjęcia poglądowe dań — przy pozycji menu, dopóki lokal nie doda własnego zdjęcia.
// Pliki w public/zdjecia/dania/ (kwadrat 600×600). Źródła i licencje są wypisane na stronie /autorzy-zdjec.
// Danie bez pasującej reguły (albo z kluczem bez zdjęcia) nie ma zdjęcia — lepsze to niż zdjęcie czegoś innego.
import { bezPolskich } from "./slug.mjs";

export type KluczDania =
  | "pizza"
  | "pizza-margherita"
  | "pizza-salami"
  | "pizza-pieczarki"
  | "pizza-biala"
  | "pizza-rukola"
  | "pizza-hawajska"
  | "calzone"
  | "burger"
  | "burger-podwojny"
  | "burger-kurczak"
  | "frytki"
  | "nuggetsy"
  | "wrap"
  | "kanapka"
  | "tost"
  | "salatka-cezar"
  | "salatka-grecka"
  | "salatka"
  | "carbonara"
  | "bolognese"
  | "pesto"
  | "makaron-kremowy"
  | "makaron-owoce-morza"
  | "lasagne"
  | "gnocchi"
  | "ravioli"
  | "krewetki"
  | "bruschetta"
  | "focaccia"
  | "deska"
  | "burrata"
  | "zupa-pomidorowa"
  | "zupa-dyniowa"
  | "rosol"
  | "zurek"
  | "flaki"
  | "pierogi"
  | "schabowy"
  | "kaczka"
  | "golonka"
  | "zeberka"
  | "poledwiczka"
  | "pieczen"
  | "kurczak"
  | "kurczak-sos"
  | "losos"
  | "ryba"
  | "placki"
  | "tatar"
  | "carpaccio"
  | "tiramisu"
  | "szarlotka"
  | "fondant"
  | "panna-cotta"
  | "tarta"
  | "lody"
  | "nalesniki"
  | "pancakes"
  | "cannolo"
  | "espresso"
  | "cappuccino"
  | "latte"
  | "kawa-mrozona"
  | "herbata"
  | "lemoniada"
  | "cola"
  | "napoj"
  | "sok"
  | "woda"
  | "piwo"
  | "wino"
  | "aperol"
  | "mojito"
  | "drink"
  | "shot"
  | "whisky";

export type ZdjecieDania = {
  plik: string;
  opis: string; // co widać na zdjęciu (strona z autorami)
  autor: string;
  licencja: string;
  zrodlo: string;
};

const p = (plik: string) => `/zdjecia/dania/${plik}.jpg`;

// Rosół celowo bez zdjęcia — w wolnych zasobach są tylko azjatyckie zupy z makaronem.
export const ZDJECIA_DAN: Partial<Record<KluczDania, ZdjecieDania>> = {
  pizza: {
    plik: p("pizza"),
    opis: "Pizza w całości",
    autor: "Peter Belch",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/pizza-cheese-L1S7QIJIAT",
  },
  "pizza-margherita": {
    plik: p("pizza-margherita"),
    opis: "Pizza margherita z bazylią",
    autor: "sarahstierch",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/7633518@N08/54051854180",
  },
  "pizza-salami": {
    plik: p("pizza-salami"),
    opis: "Pizza z pepperoni",
    autor: "ChrisEdwardsCE",
    licencja: "CC0 1.0",
    zrodlo: "https://wordpress.org/photos/photo/914636e748/",
  },
  "pizza-pieczarki": {
    plik: p("pizza-pieczarki"),
    opis: "Pizza z pieczarkami",
    autor: "Ben Sutherland",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/60179301@N00/6996502661",
  },
  "pizza-biala": {
    plik: p("pizza-biala"),
    opis: "Pizza na białym sosie",
    autor: "Edsel L",
    licencja: "CC BY-SA 2.0 (kadrowane)",
    zrodlo: "https://www.flickr.com/photos/27119975@N00/5841302390",
  },
  "pizza-rukola": {
    plik: p("pizza-rukola"),
    opis: "Pizza z szynką parmeńską i rukolą",
    autor: "avlxyz",
    licencja: "CC BY-SA 2.0 (kadrowane)",
    zrodlo: "https://www.flickr.com/photos/10559879@N00/4958898517",
  },
  "pizza-hawajska": {
    plik: p("pizza-hawajska"),
    opis: "Pizza z szynką i ananasem",
    autor: "elsie.hui",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/91188380@N05/15452035777",
  },
  calzone: {
    plik: p("calzone"),
    opis: "Calzone",
    autor: "avlxyz",
    licencja: "CC BY-SA 2.0 (kadrowane)",
    zrodlo: "https://www.flickr.com/photos/10559879@N00/3470528312",
  },
  burger: {
    plik: p("burger"),
    opis: "Burger z frytkami",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5928088/photo-image-background-public-domain-hand",
  },
  "burger-podwojny": {
    plik: p("burger-podwojny"),
    opis: "Podwójny burger z serem",
    autor: "Dennis S. Hurd",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/43296902@N00/48507156171",
  },
  "burger-kurczak": {
    plik: p("burger-kurczak"),
    opis: "Burger z chrupiącym kurczakiem",
    autor: "sarahstierch",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/7633518@N08/54606742037",
  },
  frytki: {
    plik: p("frytki"),
    opis: "Frytki",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5914579/image-public-domain-food-free",
  },
  nuggetsy: {
    plik: p("nuggetsy"),
    opis: "Nuggetsy z sosem",
    autor: "incommunicado",
    licencja: "CC BY-SA 2.0 (kadrowane)",
    zrodlo: "https://commons.wikimedia.org/w/index.php?curid=123412221",
  },
  wrap: {
    plik: p("wrap"),
    opis: "Wrap z tortilli",
    autor: "LeonardKong",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/30216515@N05/8728191788",
  },
  kanapka: {
    plik: p("kanapka"),
    opis: "Kanapka z focaccii z szynką",
    autor: "Nemeth/Star Productions",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/192268789@N06/51336269933",
  },
  tost: {
    plik: p("tost"),
    opis: "Tost z serem",
    autor: "Foodie Girl",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/grilled-cheese-PBGPOQ3ODV",
  },
  "salatka-cezar": {
    plik: p("salatka-cezar"),
    opis: "Sałatka cezar z grzankami",
    autor: "sarahstierch",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/7633518@N08/54652075460",
  },
  "salatka-grecka": {
    plik: p("salatka-grecka"),
    opis: "Sałatka grecka",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5911961/image-white-background-public-domain-food",
  },
  salatka: {
    plik: p("salatka"),
    opis: "Sałatka z serem",
    autor: "irrational_cat",
    licencja: "CC BY-SA 2.0 (kadrowane)",
    zrodlo: "https://www.flickr.com/photos/80335855@N00/444736668",
  },
  carbonara: {
    plik: p("carbonara"),
    opis: "Spaghetti carbonara",
    autor: "jeffreyw",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/7927684@N03/13726596053",
  },
  bolognese: {
    plik: p("bolognese"),
    opis: "Spaghetti bolognese",
    autor: "chooyutshing",
    licencja: "PDM 1.0",
    zrodlo: "https://www.flickr.com/photos/25802865@N08/54706781448",
  },
  pesto: {
    plik: p("pesto"),
    opis: "Makaron z pesto",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5969580/pesto-pasta",
  },
  "makaron-kremowy": {
    plik: p("makaron-kremowy"),
    opis: "Makaron w sosie śmietanowym",
    autor: "Vishnu Chandra",
    licencja: "CC0 1.0",
    zrodlo: "https://wordpress.org/photos/photo/90469f7065/",
  },
  "makaron-owoce-morza": {
    plik: p("makaron-owoce-morza"),
    opis: "Spaghetti z krewetkami",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5906201/photo-image-public-domain-shape-nature",
  },
  lasagne: {
    plik: p("lasagne"),
    opis: "Lasagne w naczyniu",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5904491/photo-image-background-public-domain-food",
  },
  gnocchi: {
    plik: p("gnocchi"),
    opis: "Gnocchi z pesto",
    autor: "Cooking etc.",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/75467868@N07/6864270056",
  },
  ravioli: {
    plik: p("ravioli"),
    opis: "Ravioli z grzybami",
    autor: "Tim Sullivan",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/ravioli-mushrooms-KENRYYSJRK",
  },
  krewetki: {
    plik: p("krewetki"),
    opis: "Krewetki z czosnkiem",
    autor: "Red Lobster Lover Joe twitter:RLLoverJoe",
    licencja: "PDM 1.0",
    zrodlo: "https://www.flickr.com/photos/164188154@N05/54657906623",
  },
  bruschetta: {
    plik: p("bruschetta"),
    opis: "Bruschetta z pomidorami",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/6076057/bruschetta-with-tomato-and-basil",
  },
  focaccia: {
    plik: p("focaccia"),
    opis: "Focaccia",
    autor: "Explorers' Edge",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/82917638@N07/55370690135",
  },
  deska: {
    plik: p("deska"),
    opis: "Deska serów i wędlin",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5917501/image-public-domain-fruit-food",
  },
  burrata: {
    plik: p("burrata"),
    opis: "Burrata z pomidorami",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/3282815/free-photo-image-bread-burrata-cake",
  },
  "zupa-pomidorowa": {
    plik: p("zupa-pomidorowa"),
    opis: "Zupa pomidorowa",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5922180/photo-image-public-domain-free-vegetable",
  },
  "zupa-dyniowa": {
    plik: p("zupa-dyniowa"),
    opis: "Zupa krem z dyni",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5927637/photo-image-public-domain-halloween-food",
  },
  zurek: {
    plik: p("zurek"),
    opis: "Żurek z jajkiem",
    autor: "Marsilar",
    licencja: "CC BY-SA 4.0 (kadrowane)",
    zrodlo: "https://commons.wikimedia.org/w/index.php?curid=186354421",
  },
  flaki: {
    plik: p("flaki"),
    opis: "Flaki w filiżance",
    autor: "stu_spivack",
    licencja: "CC BY-SA 2.0 (kadrowane)",
    zrodlo: "https://www.flickr.com/photos/35034346243@N01/367261028",
  },
  pierogi: {
    plik: p("pierogi"),
    opis: "Pierogi z cebulką",
    autor: "Juhele_CZ",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/96541566@N06/54930887787",
  },
  schabowy: {
    plik: p("schabowy"),
    opis: "Kotlet panierowany",
    autor: "sarahstierch",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/7633518@N08/51347691171",
  },
  kaczka: {
    plik: p("kaczka"),
    opis: "Pieczona kaczka",
    autor: "Tim Sullivan",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/gourmet-food-BGROKWFVRK",
  },
  golonka: {
    plik: p("golonka"),
    opis: "Golonka z musztardą",
    autor: "Kent Wang",
    licencja: "CC BY-SA 2.0 (kadrowane)",
    zrodlo: "https://www.flickr.com/photos/27454212@N00/3020839079",
  },
  zeberka: {
    plik: p("zeberka"),
    opis: "Żeberka w glazurze",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5908338/image-public-domain-food-free",
  },
  poledwiczka: {
    plik: p("poledwiczka"),
    opis: "Polędwiczka z grzybami",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5921917/photo-image-public-domain-free-mushroom",
  },
  pieczen: {
    plik: p("pieczen"),
    opis: "Pieczeń z sosem i puree",
    autor: "jeffreyw",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/7927684@N03/8084010762",
  },
  kurczak: {
    plik: p("kurczak"),
    opis: "Grillowany kurczak",
    autor: "WordRidden",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/97844767@N00/4897726842",
  },
  "kurczak-sos": {
    plik: p("kurczak-sos"),
    opis: "Kurczak w sosie grzybowym",
    autor: "jeffreyw",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/7927684@N03/16408123408",
  },
  losos: {
    plik: p("losos"),
    opis: "Łosoś na puree",
    autor: "jh_tan84",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/21045446@N00/6283315549",
  },
  ryba: {
    plik: p("ryba"),
    opis: "Grillowana ryba z warzywami",
    autor: "ralph and jenny",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/92269745@N00/5735254298",
  },
  placki: {
    plik: p("placki"),
    opis: "Placki ziemniaczane ze śmietaną",
    autor: "Kagor at Ukrainian Wikipedia",
    licencja: "CC BY-SA 3.0 (kadrowane)",
    zrodlo: "https://commons.wikimedia.org/w/index.php?curid=5753178",
  },
  tatar: {
    plik: p("tatar"),
    opis: "Tatar z żółtkiem",
    autor: "insatiablemunch",
    licencja: "CC BY 2.0",
    zrodlo: "https://commons.wikimedia.org/w/index.php?curid=73174089",
  },
  carpaccio: {
    plik: p("carpaccio"),
    opis: "Carpaccio z parmezanem",
    autor: "Kent Wang",
    licencja: "CC BY-SA 2.0 (kadrowane)",
    zrodlo: "https://www.flickr.com/photos/27454212@N00/202551771",
  },
  tiramisu: {
    plik: p("tiramisu"),
    opis: "Tiramisu",
    autor: "ChrisEdwardsCE",
    licencja: "CC0 1.0",
    zrodlo: "https://wordpress.org/photos/photo/514632a8d0/",
  },
  szarlotka: {
    plik: p("szarlotka"),
    opis: "Szarlotka",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5913194/free-apple-pie-image-public-domain-cc0-photo",
  },
  fondant: {
    plik: p("fondant"),
    opis: "Fondant czekoladowy z lodami",
    autor: "o.tacke",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/89882948@N05/51716904256",
  },
  "panna-cotta": {
    plik: p("panna-cotta"),
    opis: "Panna cotta z owocami",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5968177/panna-cotta-dessert",
  },
  tarta: {
    plik: p("tarta"),
    opis: "Tarta owocowa",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5904397/free-fruit-tart-image-public-domain-cc0-photo",
  },
  lody: {
    plik: p("lody"),
    opis: "Puchar lodowy",
    autor: "Red Lobster Lover Joe twitter:RLLoverJoe",
    licencja: "PDM 1.0",
    zrodlo: "https://www.flickr.com/photos/164188154@N05/55320233315",
  },
  nalesniki: {
    plik: p("nalesniki"),
    opis: "Naleśniki z truskawkami",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5904965/photo-image-public-domain-fruit-food",
  },
  pancakes: {
    plik: p("pancakes"),
    opis: "Pancakes z owocami",
    autor: "Herson Rodriguez",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/strawberry-pancake-KBEYS7KRA3",
  },
  cannolo: {
    plik: p("cannolo"),
    opis: "Cannoli",
    autor: "jeffreyw",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/7927684@N03/5903012696",
  },
  espresso: {
    plik: p("espresso"),
    opis: "Espresso",
    autor: "Negative Space",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/coffeebeans-espresso-QSN2WIEZCI",
  },
  cappuccino: {
    plik: p("cappuccino"),
    opis: "Cappuccino",
    autor: "Bryan Pocius",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/coffee-cappuccino-TO4DBIESND",
  },
  latte: {
    plik: p("latte"),
    opis: "Latte w szklance",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/6066147/free-public-domain-cc0-photo",
  },
  "kawa-mrozona": {
    plik: p("kawa-mrozona"),
    opis: "Kawa mrożona",
    autor: "Linda Xu",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/drinks-beverage-NHUX06WSB3",
  },
  herbata: {
    plik: p("herbata"),
    opis: "Herbata w szklance",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5923477/photo-image-public-domain-leaf-glass",
  },
  lemoniada: {
    plik: p("lemoniada"),
    opis: "Lemoniada w dzbanku",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5917531/image-public-domain-summer-lemons",
  },
  cola: {
    plik: p("cola"),
    opis: "Cola z lodem",
    autor: "Simon Cousins from High Wycombe, England",
    licencja: "CC BY 2.0",
    zrodlo: "https://commons.wikimedia.org/w/index.php?curid=23020999",
  },
  napoj: {
    plik: p("napoj"),
    opis: "Napój z cytryną",
    autor: "Tim Sullivan",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/summer-cocktail-HGO20PXZVV",
  },
  sok: {
    plik: p("sok"),
    opis: "Sok pomarańczowy",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5911669/image-background-public-domain-fruit",
  },
  woda: {
    plik: p("woda"),
    opis: "Szklanka wody",
    autor: "Krzysztof%20Puszczy%u0144ski",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/glass-water-SVHF6MUWVZ",
  },
  piwo: {
    plik: p("piwo"),
    opis: "Piwo w kuflach",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5970747/cold-beer-glass",
  },
  wino: {
    plik: p("wino"),
    opis: "Kieliszek czerwonego wina",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/6016359/photo-image-public-domain-table-red",
  },
  aperol: {
    plik: p("aperol"),
    opis: "Aperol spritz",
    autor: "Winniepix",
    licencja: "CC BY 2.0",
    zrodlo: "https://www.flickr.com/photos/18181501@N00/16537178567",
  },
  mojito: {
    plik: p("mojito"),
    opis: "Mojito",
    autor: "Enaan Farhan",
    licencja: "CC0 1.0",
    zrodlo: "https://wordpress.org/photos/photo/260631584a/",
  },
  drink: {
    plik: p("drink"),
    opis: "Kolorowe drinki",
    autor: "Tim Sullivan",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/alcohol-cocktail-VJNRNBCITJ",
  },
  shot: {
    plik: p("shot"),
    opis: "Kieliszek wódki",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/8809338/photo-image-public-domain-water-glass",
  },
  whisky: {
    plik: p("whisky"),
    opis: "Whisky z lodem",
    autor: "Altered Reality",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/whiskey-glass-NBCKWLMBGX",
  },
};

type Regula = [RegExp, KluczDania | null];

// Pizza po składnikach: nazwa + opis. Kolejność ma znaczenie — pierwsza pasująca reguła wygrywa.
const PIZZA: Regula[] = [
  [/nutell/, null], // pizza na słodko — żadne ze zdjęć nie pasuje
  [/calzone|zawijan/, "calzone"],
  [/ananas|hawaj/, "pizza-hawajska"],
  [/sos smietan|bianca|formaggi|cztery sery|gorski raj/, "pizza-biala"],
  [/salam|pepperoni|spianat|ventricin|n.?duja|salsic|kielbas|chorizo/, "pizza-salami"],
  [/parmen|crudo|rukol/, "pizza-rukola"],
  [/pieczark|funghi|szynk|cotto|capricc/, "pizza-pieczarki"],
];

// Makaron po sosie: nazwa + opis.
const MAKARON: Regula[] = [
  [/carbonar/, "carbonara"],
  [/krewet|owoce morza|owocami morza|gamber|mare\b|scampi/, "makaron-owoce-morza"],
  [/pesto/, "pesto"],
  [/sos (winno-)?pomidor|pomidorow|bolog|bolon/, "bolognese"], // „suszone pomidory” to jeszcze nie sos
];

// Pozostałe dania — tylko po nazwie (opis typu „lody waniliowe” przy szarlotce zmyliłby reguły).
const PO_NAZWIE: Regula[] = [
  [/pierog/, "pierogi"],
  [/(krem|zupa).*pomidor|pomidorowa/, "zupa-pomidorowa"],
  [/(krem|zupa).*dyni/, "zupa-dyniowa"],
  [/rosol|zupa jajeczna/, "rosol"],
  [/flak|flacz/, "flaki"],
  [/zurek/, "zurek"],
  [/kwasnic/, null], // nie „żeberka”, choć z żeberkiem
  [/schab|kotlet|sznycel/, "schabowy"],
  [/kacz/, "kaczka"],
  [/golonk/, "golonka"],
  [/zeber|zebro/, "zeberka"],
  [/poledwiczk|karczek/, "poledwiczka"],
  [/pieczen|swiezonk|gulasz/, "pieczen"],
  [/losos/, "losos"],
  [/^sum\b|dorsz|pstrag|sandacz|ryb/, "ryba"],
  [/placki|racusz|racuch/, "placki"],
  [/tatar/, "tatar"],
  [/carpaccio/, "carpaccio"],
  [/talerz wedlin|deska|antipast/, "deska"],
  [/burrata/, "burrata"],
  [/bruschet/, "bruschetta"],
  [/focacc/, "focaccia"],
  [/scampi|krewet/, "krewetki"],
  [/filetto|saltimbocca/, "kurczak-sos"],
  [/nugget/, "nuggetsy"],
  [/kurcza|piers/, "kurczak"],
  [/frytk|wiatracz/, "frytki"],
  [/nalesnik/, "nalesniki"],
  [/pancake/, "pancakes"],
  [/tiramisu/, "tiramisu"],
  [/panna cotta/, "panna-cotta"],
  [/cannol/, "cannolo"],
  [/fondant/, "fondant"],
  [/szarlotk|kruszonk|ciasto/, "szarlotka"],
  [/tart[ay]\b/, "tarta"],
  [/^lody/, "lody"],
  [/\bice\b|mrozon|orange espresso/, "kawa-mrozona"], // \b: nie „Spice Cinnamon”
  [/cappucc/, "cappuccino"],
  [/latte|kawa biala/, "latte"],
  [/espresso|americano/, "espresso"],
  [/herbat/, "herbata"],
  [/cola|pepsi/, "cola"],
  [/fanta|mirinda|sprite|7 ?up/, "napoj"],
  [/^sok\b|tymbark|toma/, "sok"],
  [/woda|wody/, "woda"],
  [/lemoniad|soda|si! 0%/, "lemoniada"],
  [/aperol/, "aperol"],
  [/mojito/, "mojito"],
  [/piwo|peroni|moretti|heineken|ksiazece|zatecky/, "piwo"],
  [/jack daniel|ballantine|whisk|gin\b|bacardi|rum\b/, "whisky"],
  [/finlandia|stumbras|wodka/, "shot"],
];

const pierwsza = (reguly: Regula[], tekst: string) => reguly.find(([wzor]) => wzor.test(tekst));

/** Które zdjęcie poglądowe pasuje do pozycji menu; null, gdy żadne. */
export function kluczDania(sekcja: string, nazwa: string, opis: string | null): KluczDania | null {
  const s = bezPolskich(sekcja);
  const n = bezPolskich(nazwa);
  const no = `${n} ${bezPolskich(opis ?? "")}`;

  if (/dodat/.test(s) || /^(dodat|opakow|sos\b|sok do)/.test(n)) return null;

  if (/margherit|caprese|bufalin/.test(n)) return "pizza-margherita";
  if (/lasagn/.test(n)) return "lasagne";
  if (/gnocchi/.test(n)) return "gnocchi";
  if (/raviol/.test(n)) return "ravioli";
  if (/pizz|calzone/.test(s) || /pizz/.test(n)) {
    const r = pierwsza(PIZZA, no);
    if (r) return r[1];
    return /mozzarell|\bser\b/.test(no) && !/pomidor|\bsos\b/.test(no) ? "pizza-biala" : "pizza"; // ser bez sosu = biała
  }
  if (/burger/.test(s) || /burger/.test(n)) {
    if (/double|triple|podwojn|[23] ×/.test(no)) return "burger-podwojny";
    return /chicken|kurczak/.test(n) ? "burger-kurczak" : "burger";
  }
  if (/kanapk|tost|sandwich/.test(s)) return /wrap|tortill/.test(n) ? "wrap" : /toast|tost/.test(n) ? "tost" : "kanapka";
  if (/salat|insalat/.test(s) || /salat|insalat/.test(n)) {
    return /cezar|caesar/.test(n) ? "salatka-cezar" : /greck/.test(n) ? "salatka-grecka" : "salatka";
  }
  const zupa = /rosol|zup|krem\b|pomidorowa|flak|zurek|kwasnic/.test(n); // „Rosół z makaronem” to nie makaron
  if (!zupa && (/makaron/.test(s) || /makaron|spaghetti|penne|tagliatel|linguin|bucatini|rigatoni|fettucc/.test(n))) {
    return pierwsza(MAKARON, no)?.[1] ?? "makaron-kremowy";
  }

  const r = pierwsza(PO_NAZWIE, n);
  if (r) return r[1];
  // Po sekcji albo opisie, gdy nazwa nic nie mówi („Spice Cinnamon”, „Pornstar Martini”, „Cantina Borba Bianco”).
  if (/herbat|rooibos/.test(no)) return "herbata";
  if (/shot/.test(no)) return "shot";
  if (/drink|koktajl/.test(s) || /spritz|martini|sour/.test(n)) return "drink";
  if (/win[ao]/.test(s) || /\b(biale|czerwone|musujace|polslodkie|wytrawne)\b/.test(no)) return "wino";
  if (/piw/.test(s)) return "piwo";
  return null;
}

/** Ścieżka zdjęcia poglądowego dla pozycji menu; null, gdy nie mamy pasującego. */
export function zdjecieDania(sekcja: string, nazwa: string, opis: string | null) {
  const klucz = kluczDania(sekcja, nazwa, opis);
  return (klucz && ZDJECIA_DAN[klucz]?.plik) || null;
}
