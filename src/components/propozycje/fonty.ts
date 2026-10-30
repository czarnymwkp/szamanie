import { Archivo_Black, DM_Serif_Display, Space_Grotesk } from "next/font/google";

// Dodatkowe kroje dla propozycji wyglądu (podstawowy Nunito jest w app/layout.tsx).
export const serif = DM_Serif_Display({ weight: "400", subsets: ["latin", "latin-ext"], preload: false });
export const grotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], preload: false });
export const brutal = Archivo_Black({ weight: "400", subsets: ["latin", "latin-ext"], preload: false });
