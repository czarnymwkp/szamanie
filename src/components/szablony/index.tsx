import type { Lokal } from "@/lib/lokale";
import { motywStrony } from "@/lib/motywyStron";
import LokalSzkic from "../szkic/LokalSzkic";
import Klasyczny from "./Klasyczny";

// Wyglądy strony lokalu do wyboru w abonamencie. Nowy szablon: komponent w tym folderze + case poniżej.
export const SZABLONY = [{ id: "klasyczny", nazwa: "Klasyczny" }] as const;

export default function SzablonLokalu({ lokal }: { lokal: Lokal }) {
  switch (lokal.szablon) {
    default:
      // lokal z własnym motywem (w stylu jego karty menu, np. Burger&Pizza) — Klasyczny w jego barwach,
      // reszta w wyglądzie serwisu „Szkicownik”
      return motywStrony(lokal.slug) ? <Klasyczny lokal={lokal} /> : <LokalSzkic lokal={lokal} />;
  }
}
