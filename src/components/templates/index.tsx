import type { Venue } from "@/lib/venues";
import { pageTheme } from "@/lib/venueThemes";
import SketchVenue from "../sketch/SketchVenue";
import Classic from "./Classic";

// Wyglądy strony lokalu do wyboru w abonamencie. Nowy szablon: komponent w tym folderze + case poniżej.
export const TEMPLATES = [{ id: "klasyczny", nazwa: "Klasyczny" }] as const;

export default function VenueTemplate({ lokal }: { lokal: Venue }) {
  switch (lokal.szablon) {
    default:
      // lokal z własnym motywem (w stylu jego karty menu, np. Burger&Pizza) — Klasyczny w jego barwach,
      // reszta w wyglądzie serwisu „Szkicownik”
      return pageTheme(lokal.slug) ? <Classic lokal={lokal} /> : <SketchVenue lokal={lokal} />;
  }
}
