import type { Venue, Town } from "@/lib/venues";
import type { Delivery, Menu } from "@/lib/menu";
import type { FooterLink } from "./site/FooterContent";

// Shared helpers of the mobile design proposals (27.10).

export type HomeProps = { lokale: Venue[]; miejscowosci: Town[]; nr: number; linki: FooterLink[] };
export type VenueProps = { lokal: Venue; menu: Menu | null; dostawa: Delivery | null; nr: number; linki: FooterLink[] };

export const MOBILE_PROPOSALS = [
  { nr: 1, nazwa: "Zorza", opis: "Kolorowa zorza płynie pod szklanymi kartami. Na stronie lokalu pływający pasek akcji jak w iOS." },
  { nr: 2, nazwa: "Neon", opis: "Ciemno, ziarno jak na filmie, światło idzie za palcem, neonowe napisy. Restauracja nocą." },
  { nr: 3, nazwa: "Szkicownik", opis: "Papier, rysowane ikony jedzenia w tle, naklejki z taśmą. Menu jak karta w lokalu." },
  { nr: 4, nazwa: "Wielkie litery", opis: "Ogromne napisy suną w tle, odważna typografia, kategorie jak spis treści magazynu." },
  { nr: 5, nazwa: "Talia kart", opis: "„Nie wiesz, co zjeść?” — przesuwasz karty lokali palcem jak w Tinderze. Sekcje lokalu układają się w stos." },
  { nr: 6, nazwa: "Mapa", opis: "Najpierw mapa z pinezkami, lista wjeżdża na nią jak arkusz w Mapach Google. Warstwice w tle." },
  { nr: 7, nazwa: "Bento", opis: "Siatka kafli jak w nowych aplikacjach Apple, kropki w tle reagują na dotyk, zegar na żywo." },
  { nr: 8, nazwa: "Pora dnia", opis: "Niebo zmienia się z godziną: rano, w dzień, wieczorem i w nocy (gwiazdy). Powitanie i podpowiedzi do pory." },
  { nr: 9, nazwa: "Smak", opis: "Duże zdjęcia jedzenia, para unosi się nad talerzem, kafle dań ze zdjęciami. Ciepły, ciemny klimat." },
  { nr: 10, nazwa: "Płynny kolor", opis: "Tło liczone na karcie graficznej (WebGL) płynie w kolorze lokalu, karty przechylają się za palcem." },
  { nr: 11, nazwa: "Automat", opis: "Gra z lat 80.: pikselowe litery, ekran kineskopu, gwiazdy lecą w tle, lokale jak poziomy gry z punktami." },
  { nr: 12, nazwa: "Gazeta", opis: "„Kurier Kraśnicki”: winieta, szpalty, lokale jak ogłoszenia drobne, zdjęcia w rastrze druku." },
  { nr: 13, nazwa: "Paragon", opis: "Wszystko jak wydruk z kasy: papier termiczny, kropki do ceny, ząbkowane brzegi, kod kreskowy." },
  { nr: 14, nazwa: "Glina", opis: "Miękkie, napompowane kształty 3D w cukierkowych kolorach, wszystko sprężynuje pod palcem." },
  { nr: 15, nazwa: "Kosmos", opis: "Granatowa galaktyka: kategorie krążą po orbitach jak planety, gwiazdy przelatują w tle." },
  { nr: 16, nazwa: "Akwarela", opis: "Plamy farby wodnej rozlewają się po papierze, eleganckie pismo, spokojnie i delikatnie." },
  { nr: 17, nazwa: "Ogród", opis: "Zielono i świeżo: liście opadają w tle, wege na pierwszym miejscu, menu jak tablica kredowa." },
  { nr: 18, nazwa: "Komiks", opis: "Kadry z grubą kreską, dymki „MNIAM!”, raster pop-art, wszystko lekko przekrzywione." },
  { nr: 19, nazwa: "Bauhaus", opis: "Geometria: kółka, kwadraty i trójkąty w kolorach podstawowych powoli się obracają." },
  { nr: 20, nazwa: "Kino", opis: "„Teraz grane” to otwarte lokale, lokale jak plakaty filmowe, menu jako repertuar, reflektory w tle." },
] as const;

/** The venue with the longest menu — the venue page is shown on it. */
export const SAMPLE_VENUE = "musicaffe-krasnik";
/** For the preview on the proposals list: different cuisines and menu lengths. */
export const PREVIEW_VENUES = [
  { slug: "musicaffe-krasnik", nazwa: "MusiCaffe" },
  { slug: "burger-pizza-krasnik", nazwa: "Burger&Pizza" },
  { slug: "bd-star-kebab-krasnik", nazwa: "BD Star Kebab" },
  { slug: "brunoo-krasnik", nazwa: "Brunoo" },
  { slug: "mar-mat-krasnik", nazwa: "Mar-Mat (bez menu)" },
];

export const venueUrl = (nr: number) => `/propozycje/m/${nr}`;
export const venueHref = (nr: number, slug: string) => `/propozycje/m/${nr}/lokal/${slug}`;

/** Seeded random numbers (the same on the server and in the browser) for scattering background decorations. */
export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
