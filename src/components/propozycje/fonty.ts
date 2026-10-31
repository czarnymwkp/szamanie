import { Archivo_Black, DM_Serif_Display } from "next/font/google";

// Dodatkowe kroje dla propozycji wyglądu (podstawowy Nunito jest w app/layout.tsx).
export const serif = DM_Serif_Display({ weight: "400", subsets: ["latin", "latin-ext"], preload: false });
// Space Grotesk z app/layout.tsx (klasa font-grotesk), nie druga deklaracja: dwie @font-face o tej samej nazwie
// sprawiały, że każda strona serwisu pobierała ten krój dwa razy.
export const grotesk = { className: "font-grotesk" };
export const brutal = Archivo_Black({ weight: "400", subsets: ["latin", "latin-ext"], preload: false });
