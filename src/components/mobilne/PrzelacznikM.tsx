"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, House, LayoutGrid, Store } from "lucide-react";
import { PRZYKLADOWY_LOKAL_M, PROPOZYCJE_M, adresM, lokalM } from "./wspolne";

// Pionowy pasek przy prawej krawędzi: poprzednia / następna propozycja i przejście główna ↔ lokal.
// Z boku, bo na dole są paski akcji propozycji i lista do zamówienia.
export default function PrzelacznikM() {
  const sciezka = usePathname();
  const dopasowanie = sciezka.match(/^\/propozycje\/m\/(\d+)(\/lokal\/([^/]+))?/);
  if (!dopasowanie) return null;

  const nr = Number(dopasowanie[1]);
  const slug = dopasowanie[3];
  const ile = PROPOZYCJE_M.length;
  const cel = (n: number) => (slug ? lokalM(n, slug) : adresM(n));
  const przycisk = "flex size-9 items-center justify-center rounded-full transition hover:bg-white/15";

  return (
    <nav
      aria-label="Propozycje wyglądu"
      className="fixed top-1/2 right-1.5 z-[80] flex -translate-y-1/2 flex-col items-center gap-0.5 rounded-full bg-[#111]/80 p-1 text-white shadow-2xl backdrop-blur"
    >
      <Link href="/propozycje/m" aria-label="Wszystkie propozycje" className={przycisk}>
        <LayoutGrid className="size-4" aria-hidden />
      </Link>
      <Link href={cel(nr > 1 ? nr - 1 : ile)} aria-label="Poprzednia propozycja" className={przycisk}>
        <ChevronUp className="size-5" aria-hidden />
      </Link>
      <span className="py-0.5 text-center text-[11px] leading-none font-black tabular-nums">
        {nr}
        <span className="block text-[9px] font-bold text-white/60">/{ile}</span>
      </span>
      <Link href={cel(nr < ile ? nr + 1 : 1)} aria-label="Następna propozycja" className={przycisk}>
        <ChevronDown className="size-5" aria-hidden />
      </Link>
      <Link
        href={slug ? adresM(nr) : lokalM(nr, PRZYKLADOWY_LOKAL_M)}
        aria-label={slug ? "Strona główna" : "Strona lokalu"}
        className="flex size-9 items-center justify-center rounded-full bg-[#ff6400] text-[#111]"
      >
        {slug ? <House className="size-4" aria-hidden /> : <Store className="size-4" aria-hidden />}
      </Link>
    </nav>
  );
}
