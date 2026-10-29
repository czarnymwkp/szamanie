"use client";

import { BadgePercent } from "lucide-react";
import { useTeraz } from "@/components/useTeraz";
import { zl } from "@/lib/ceny";
import type { Promocja } from "@/lib/promocje";
import { opisTerminu, trwaTeraz } from "@/lib/terminPromocji";

/**
 * Promocje lokalu (dodaje je właściciel w panelu) — nad menu, bo to pierwsze, co warto zobaczyć przed zamówieniem.
 * „Trwa teraz” liczy przeglądarka: strona jest statyczna, więc „teraz” serwera nie jest „teraz” klienta.
 */
export default function PromocjeLokalu({ promocje, naglowek }: { promocje: Promocja[]; naglowek: string }) {
  const teraz = useTeraz();
  return (
    <section aria-labelledby="promocje" className="mt-6">
      <h2 id="promocje" className={`flex items-center gap-2 text-xl font-black ${naglowek}`}>
        <BadgePercent className="size-6 text-akcent-tekst" aria-hidden /> Promocje
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {promocje.map((p) => {
          const trwa = teraz && trwaTeraz(p, teraz);
          return (
            <li key={p.id} className="rounded-2xl border-2 border-akcent bg-karta p-4">
              <p className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                {trwa && <span className="rounded-full bg-otwarte px-2 py-0.5 text-white">Trwa teraz</span>}
                <span className="text-tekst-2">{opisTerminu(p)}</span>
              </p>
              <p className="mt-1.5 text-lg leading-snug font-black">{p.tytul}</p>
              {p.opis && <p className="mt-1 text-sm leading-relaxed text-tekst-2">{p.opis}</p>}
              {p.danie && p.cenaGr !== null && (
                <div className="mt-2 text-sm">
                  <p>
                    {p.danie}
                    {p.wariant ? ` ${p.wariant}` : ""}: <b className="text-base text-akcent-tekst">{zl(p.cenaGr)}</b>
                  </p>
                  {/* dyrektywa Omnibus: przy obniżce ceny najniższa cena z 30 dni przed nią */}
                  {p.najnizsza30Gr !== null && (
                    <p className="text-xs text-tekst-2">Najniższa cena z 30 dni przed obniżką: {zl(p.najnizsza30Gr)}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
