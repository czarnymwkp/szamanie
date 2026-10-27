import type { Lokal, Miejscowosc } from "@/lib/lokale";
import type { Dostawa, Menu } from "@/lib/menu";

// Druga seria propozycji (27.10): cały wygląd na telefon — strona główna i strona lokalu.
// Każda ma inne tło „z prześwitem”, inny układ i inne animacje. Wspólne: dane, lista do zamówienia,
// miejsce na banery reklamowe pod wyszukiwarką i listek „Wege”.

export type PropsGlownejM = { lokale: Lokal[]; miejscowosci: Miejscowosc[]; nr: number };
export type PropsLokaluM = { lokal: Lokal; menu: Menu | null; dostawa: Dostawa | null; nr: number };

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
