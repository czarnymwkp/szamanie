import { SIZE, shareImage } from "@/lib/shareImage";

// Domyślny obrazek przy linkach do szamanie.pl; strony fraz i lokali mają własne.

export const alt = "szamanie.pl — gdzie zjeść w Kraśniku i okolicy";
export const size = SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareImage({
    tytul: "Co dziś szamiesz?",
    podtytul: "Pizza, burgery, kebab i obiady w Kraśniku i okolicy — menu z cenami, dowóz i telefon w jednym miejscu.",
    zdjecie: "/zdjecia/kategorie/burger.jpg",
  });
}
