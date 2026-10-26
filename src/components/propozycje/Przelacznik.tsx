"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutGrid, Store, House } from "lucide-react";
import { PROPOZYCJE, PRZYKLADOWY_LOKAL, adresPropozycji, prefiksLokalu } from "./wspolne";

// Pływający pasek do przeglądania propozycji: poprzednia / następna, strona główna ↔ strona lokalu.
export default function Przelacznik() {
  const sciezka = usePathname();
  const dopasowanie = sciezka.match(/^\/propozycje\/(\d+)(\/lokal\/([^/]+))?/);
  if (!dopasowanie) return null;

  const nr = Number(dopasowanie[1]);
  const slug = dopasowanie[3];
  const propozycja = PROPOZYCJE.find((p) => p.nr === nr);
  const cel = (n: number) => (slug ? `${prefiksLokalu(n)}${slug}` : adresPropozycji(n));
  const poprzednia = nr > 1 ? nr - 1 : PROPOZYCJE.length;
  const nastepna = nr < PROPOZYCJE.length ? nr + 1 : 1;
  const przycisk = "flex size-9 items-center justify-center rounded-full transition hover:bg-white/15";
  // Na telefonie omijamy dolne paski propozycji 6 (akcje lokalu) i 10 (menu aplikacji + akcje).
  const odDolu =
    nr === 10 ? (slug ? "bottom-[8.75rem]" : "bottom-[5.5rem]") : nr === 6 && slug ? "bottom-[5.5rem]" : "bottom-4";

  return (
    <nav
      aria-label="Propozycje wyglądu"
      className={`fixed left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#111]/90 p-1 text-white shadow-2xl backdrop-blur ${odDolu} lg:bottom-4`}
    >
      <Link href="/propozycje" aria-label="Wszystkie propozycje" className={przycisk}>
        <LayoutGrid className="size-4" aria-hidden />
      </Link>
      <Link href={cel(poprzednia)} aria-label="Poprzednia propozycja" className={przycisk}>
        <ChevronLeft className="size-5" aria-hidden />
      </Link>
      <span className="px-1 text-center text-xs leading-tight font-extrabold whitespace-nowrap">
        {nr}/{PROPOZYCJE.length}
        <span className="hidden font-semibold text-white/70 sm:inline"> · {propozycja?.nazwa}</span>
      </span>
      <Link href={cel(nastepna)} aria-label="Następna propozycja" className={przycisk}>
        <ChevronRight className="size-5" aria-hidden />
      </Link>
      <Link
        href={slug ? adresPropozycji(nr) : `${prefiksLokalu(nr)}${PRZYKLADOWY_LOKAL}`}
        className="flex h-9 items-center gap-1.5 rounded-full bg-[#ff6400] px-3 text-xs font-black text-[#111] transition hover:brightness-110"
      >
        {slug ? <House className="size-4" aria-hidden /> : <Store className="size-4" aria-hidden />}
        {slug ? "Strona główna" : "Strona lokalu"}
      </Link>
    </nav>
  );
}
