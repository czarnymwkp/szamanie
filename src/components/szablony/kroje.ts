import { Karla, Playfair_Display } from "next/font/google";
import type { KrojLokalu } from "@/lib/motywyStron";

// Kroje motywów lokali (lib/motywyStron.ts). Bez preload: pobierają się tylko na stronach lokali, które ich używają.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: "700",
  preload: false,
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

export const KROJE: Record<KrojLokalu, { variable: string; zmienna: string }> = {
  playfair: { variable: playfair.variable, zmienna: "var(--font-playfair)" },
  karla: { variable: karla.variable, zmienna: "var(--font-karla)" },
};
