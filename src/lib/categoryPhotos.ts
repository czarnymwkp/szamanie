// Zdjęcia poglądowe jedzenia dla kategorii — pokazywane, dopóki lokal nie ma własnych zdjęć.
// Pliki w public/zdjecia/kategorie/. Źródła i licencje są wypisane na stronie /autorzy-zdjec.
// Kategoria bez wpisu tutaj pokazuje kolorowy baner z ikoną.

export type PhotoKey =
  | "pizza"
  | "kebab"
  | "burger"
  | "azjatycka"
  | "polska"
  | "grecka"
  | "wloska"
  | "kawa"
  | "lody"
  | "piwo"
  | "bar"
  | "fastfood"
  | "restauracja";

export type CategoryPhoto = {
  plik: string;
  opis: string; // co widać na zdjęciu (strona z autorami)
  pozycja: string; // object-position — co ma zostać widoczne przy wąskim kadrze
  autor: string;
  licencja: string;
  zrodlo: string;
};

const p = (file: string) => `/zdjecia/kategorie/${file}.jpg`;

export const CATEGORY_PHOTOS: Partial<Record<PhotoKey, CategoryPhoto>> = {
  pizza: {
    plik: p("pizza"),
    opis: "Pizza z pieca opalanego drewnem",
    pozycja: "50% 60%",
    autor: "Eneida Nieves",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/rustic-pizza-F7EPDH2L1A",
  },
  kebab: {
    plik: p("kebab"),
    opis: "Szaszłyki z grilla",
    pozycja: "50% 50%",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5969422/bbq-meat-kebabs",
  },
  burger: {
    plik: p("burger"),
    opis: "Burger z frytkami",
    pozycja: "50% 55%",
    autor: "Dana Tentis",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/hamburger-dinner-7QH4K6AESO",
  },
  azjatycka: {
    plik: p("azjatycka"),
    opis: "Makaron po azjatycku",
    pozycja: "50% 50%",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/6039936/photo-image-public-domain-food-free",
  },
  polska: {
    plik: p("polska"),
    opis: "Barszcz z pierogami",
    pozycja: "50% 50%",
    autor: "quinn.anya",
    licencja: "CC BY-SA 2.0 (kadrowane)",
    zrodlo: "https://www.flickr.com/photos/53326337@N00/52524246684",
  },
  grecka: {
    plik: p("grecka"),
    opis: "Sałatka grecka z fetą",
    pozycja: "50% 50%",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/5968295/photo-image-public-domain-plant-red",
  },
  wloska: {
    plik: p("wloska"),
    opis: "Spaghetti z klopsikami",
    pozycja: "50% 50%",
    autor: "sarahstierch",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/7633518@N08/54282559513",
  },
  kawa: {
    plik: p("kawa"),
    opis: "Latte",
    pozycja: "50% 55%",
    autor: "Taylor Franz",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/food-beverage-95U1U3BR0Y",
  },
  lody: {
    plik: p("lody"),
    opis: "Lody w ladzie",
    pozycja: "50% 50%",
    autor: "rawpixel.com",
    licencja: "CC0 1.0",
    zrodlo: "https://www.rawpixel.com/image/6036462/gelato-ice-cream-free-public-domain-cc0-photo",
  },
  piwo: {
    plik: p("piwo"),
    opis: "Piwo w szklance",
    pozycja: "50% 50%",
    autor: "Little Visuals",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/beer-brew-F15A241D0A",
  },
  bar: {
    plik: p("bar"),
    opis: "Mojito przy barze",
    pozycja: "50% 55%",
    autor: "Dave Meier",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/mojito-cocktail-4178415E1A",
  },
  fastfood: {
    plik: p("fastfood"),
    opis: "Frytki i kanapka z kurczakiem",
    pozycja: "50% 50%",
    autor: "sarahstierch",
    licencja: "CC0 1.0",
    zrodlo: "https://www.flickr.com/photos/7633518@N08/54440458800",
  },
  restauracja: {
    plik: p("restauracja"),
    opis: "Stek ze szparagami",
    pozycja: "50% 55%",
    autor: "Snapwire",
    licencja: "CC0 1.0",
    zrodlo: "https://stocksnap.io/photo/steak-asparagus-JMJZKYXUWD",
  },
};
