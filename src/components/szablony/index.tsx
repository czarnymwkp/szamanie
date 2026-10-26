import type { Lokal } from "@/lib/lokale";
import Klasyczny from "./Klasyczny";

// Wyglądy strony lokalu do wyboru w abonamencie. Nowy szablon: komponent w tym folderze + case poniżej.
export const SZABLONY = [{ id: "klasyczny", nazwa: "Klasyczny" }] as const;

export default function SzablonLokalu({ lokal }: { lokal: Lokal }) {
  switch (lokal.szablon) {
    default:
      return <Klasyczny lokal={lokal} />;
  }
}
