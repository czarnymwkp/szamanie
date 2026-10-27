import type { Lokal, Miejscowosc } from "@/lib/lokale";
import type { Dostawa, Menu } from "@/lib/menu";
import type { LinkStopki } from "./StopkaM";

// Druga seria propozycji (27.10): cały wygląd na telefon — strona główna i strona lokalu.
// Każda ma inne tło „z prześwitem”, inny układ i inne animacje. Wspólne: dane, lista do zamówienia,
// miejsce na banery reklamowe pod wyszukiwarką i listek „Wege”.

export type PropsGlownejM = { lokale: Lokal[]; miejscowosci: Miejscowosc[]; nr: number; linki: LinkStopki[] };
export type PropsLokaluM = { lokal: Lokal; menu: Menu | null; dostawa: Dostawa | null; nr: number; linki: LinkStopki[] };

export const PROPOZYCJE_M = [
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

/** Lokal z najdłuższym menu — na nim pokazujemy stronę lokalu. */
export const PRZYKLADOWY_LOKAL_M = "musicaffe-krasnik";
/** Do podglądu na liście propozycji: różne kuchnie i długości menu. */
export const LOKALE_DO_PODGLADU = [
  { slug: "musicaffe-krasnik", nazwa: "MusiCaffe" },
  { slug: "burger-pizza-krasnik", nazwa: "Burger&Pizza" },
  { slug: "bd-star-kebab-krasnik", nazwa: "BD Star Kebab" },
  { slug: "brunoo-krasnik", nazwa: "Brunoo" },
  { slug: "mar-mat-krasnik", nazwa: "Mar-Mat (bez menu)" },
];

export const adresM = (nr: number) => `/propozycje/m/${nr}`;
export const lokalM = (nr: number, slug: string) => `/propozycje/m/${nr}/lokal/${slug}`;

/** Stałe losowanie (to samo na serwerze i w przeglądarce) do rozrzucania ozdób tła. */
export function losowe(ziarno: number) {
  let s = ziarno;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
