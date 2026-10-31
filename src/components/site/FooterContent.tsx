"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUp, Store } from "lucide-react";
import StyledMascot, { type MascotStyle } from "../StyledMascot";

export type FooterLink = { nazwa: string; adres: string };

const DISHES = "PIZZA ✦ KEBAB ✦ BURGERY ✦ PIEROGI ✦ KAWA ✦ LODY ✦ ZAPIEKANKI ✦ SAŁATKI ✦ ";

/**
 * Site footer: a strip of dishes, the shaman (tap — he jumps), „Smacznego!”, the „Masz lokal?” card, links to pages
 * like „Pizza w Kraśniku” (for Google) and the tymito.pl credit. The data source (OpenStreetMap, required by ODbL) is
 * on the „Źródła danych i zdjęć” page, linked from the footer. Colors come from tokens (background = page text color),
 * so it works on light and dark themes.
 */
export default function FooterContent({ linki, szaman, className = "" }: { linki: FooterLink[]; szaman: MascotStyle; className?: string }) {
  const [skok, setSkok] = useState(0);
  return (
    <footer className={`relative mt-16 overflow-hidden rounded-t-[2.5rem] bg-tekst text-tlo ${className}`}>
      <div aria-hidden className="overflow-hidden border-b border-tlo/10 py-2.5">
        <div className="flex w-max animate-tasma text-sm font-black tracking-widest text-akcent">
          <span>{DISHES.repeat(3)}</span>
          <span>{DISHES.repeat(3)}</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSkok((s) => s + 1)}
            aria-label="Szaman — dotknij"
            className="w-28 shrink-0"
          >
            <span key={skok} className={`block ${skok ? "animate-[m-skok_0.9s_cubic-bezier(0.3,1.5,0.5,1)]" : ""}`}>
              <StyledMascot styl={szaman} className="w-full" />
            </span>
          </button>
          <div>
            <p className="font-grotesk text-[2.6rem] leading-none font-bold tracking-tight">Smacznego!</p>
            <p className="mt-2 text-sm font-semibold opacity-70">
              {skok > 2 ? "Dobra, dobra — już czaruję burgera 🍔" : "Głodny o północy? Włącz „Otwarte teraz”."}
            </p>
          </div>
        </div>

        <Link
          href="/dla-lokali"
          className="mt-7 flex items-center gap-3 rounded-3xl bg-akcent p-4 text-na-akcencie transition active:scale-[0.98]"
        >
          <Store className="size-8 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block font-black">Masz lokal?</span>
            <span className="block text-sm font-semibold opacity-80">Dodaj menu i promocje — goście zamówią przez telefon.</span>
          </span>
          <ArrowRight className="size-6 shrink-0" aria-hidden />
        </Link>

        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
          <nav aria-label="Gdzie zjeść">
            <h2 className="text-xs font-black tracking-widest uppercase opacity-60">Gdzie zjeść</h2>
            <ul className="mt-3 space-y-2 font-bold">
              {linki.slice(0, 8).map((l) => (
                <li key={l.adres}>
                  <Link href={l.adres} className="transition hover:text-akcent">
                    {l.nazwa}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="szamanie.pl">
            <h2 className="text-xs font-black tracking-widest uppercase opacity-60">szamanie.pl</h2>
            <ul className="mt-3 space-y-2 font-bold">
              {[
                ["Wszystkie lokale", "/#wyniki"],
                ["Dla lokali", "/dla-lokali"],
                ["Dodaj lub popraw lokal", "/dla-lokali#wpis"],
                ["Polityka prywatności", "/polityka-prywatnosci"],
                ["Źródła danych i zdjęć", "/autorzy-zdjec"],
              ].map(([nazwa, adres]) => (
                <li key={adres}>
                  <Link href={adres} className="transition hover:text-akcent">
                    {nazwa}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4 border-t border-tlo/10 pt-5 text-xs font-semibold opacity-70">
          <p>
            © 2026 szamanie.pl
            <span className="mt-1 block">
              Zrobione przez{" "}
              <a href="https://tymito.pl" target="_blank" rel="noopener" className="underline transition hover:text-akcent">
                tymito.pl
              </a>
            </span>
          </p>
          <button
            type="button"
            onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
            className="flex shrink-0 items-center gap-1 rounded-full border border-tlo/25 px-3 py-2 font-extrabold"
          >
            <ArrowUp className="size-4" aria-hidden /> Do góry
          </button>
        </div>
      </div>
    </footer>
  );
}
