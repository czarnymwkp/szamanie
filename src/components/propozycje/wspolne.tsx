import Link from "next/link";
import type { Lokal, Miejscowosc } from "@/lib/lokale";

export type PropsGlownej = { lokale: Lokal[]; miejscowosci: Miejscowosc[]; nr: number };
export type PropsLokalu = { lokal: Lokal; nr: number };

export const PROPOZYCJE = [
  { nr: 1, nazwa: "Pomarańczowy klasyk", opis: "W stylu pyszne.pl: pomarańczowy baner, okrągłe kategorie, karty ze zdjęciami." },
  { nr: 2, nazwa: "Krem i typografia", opis: "Jak magazyn kulinarny: duże litery z szeryfem, lista zamiast kart." },
  { nr: 3, nazwa: "Tryb nocny", opis: "Ciemne tło, pomarańczowe akcenty i sekcja „Otwarte do późna”." },
  { nr: 4, nazwa: "Bento", opis: "Kafelki różnej wielkości: wyszukiwarka, otwarte teraz, kategorie ze zdjęciami." },
  { nr: 5, nazwa: "Mapa + lista", opis: "Mapa z pinezkami wszystkich lokali obok listy, jak w Mapach Google." },
  { nr: 6, nazwa: "Karuzele", opis: "Jak Wolt: przewijane rzędy „Otwarte teraz”, „Pizza”, „Kawa i słodkości”." },
  { nr: 7, nazwa: "Stories", opis: "Kategorie jak relacje na Instagramie i duże miejsce na wyróżniony lokal." },
  { nr: 8, nazwa: "Neo-brutalizm", opis: "Grube ramki, twarde cienie, naklejki — odważnie i modnie." },
  { nr: 9, nazwa: "Minimal", opis: "Najpierw wyszukiwarka, czysta lista bez ozdobników — szybko i konkretnie." },
  { nr: 10, nazwa: "Aplikacja", opis: "Jak aplikacja na telefon: dolne menu, powitanie, ulubione lokale." },
] as const;

/** Lokal z najpełniejszymi danymi — na nim pokazujemy wygląd strony restauracji. */
export const PRZYKLADOWY_LOKAL = "brunoo-krasnik";

export const adresPropozycji = (nr: number) => `/propozycje/${nr}`;
export const prefiksLokalu = (nr: number) => `/propozycje/${nr}/lokal/`;

export function StopkaPropozycji({ ciemna = false, className = "" }: { ciemna?: boolean; className?: string }) {
  const tekst = ciemna ? "text-white/60" : "text-tekst-2";
  return (
    <footer className={`px-5 py-8 text-xs font-semibold ${tekst} ${className}`}>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-x-4 gap-y-1">
        <span>szamanie.pl — lokale w Kraśniku i okolicy</span>
        <span>
          Dane: ©{" "}
          <a href="https://www.openstreetmap.org/copyright" className="underline">
            współtwórcy OpenStreetMap
          </a>
        </span>
        <Link href="/autorzy-zdjec" className="underline">
          Autorzy zdjęć
        </Link>
        <Link href="/dla-lokali" className="underline">
          Dla lokali
        </Link>
      </div>
    </footer>
  );
}
