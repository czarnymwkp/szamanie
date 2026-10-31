"use client";

import Image from "next/image";
import { useOrderList } from "@/components/menu/useOrderList";

/**
 * Baner motywu lokalu z jego maskotką: postać kołysze się, nad miską unosi się para, a gdy ktoś doda danie do listy
 * (albo je zdejmie), podskakuje — `key` z liczbą pozycji odtwarza animację od nowa. Pod nią nazwa (<h1> strony)
 * krojem ozdobnym, `haslo` i adres. Maskotka to grafika lokalu (public/motywy/…) — tylko za jego zgodą.
 */
export default function MascotBanner({
  slug,
  nazwa,
  znak,
  haslo,
  podpis,
}: {
  slug: string;
  nazwa: string;
  znak: string;
  haslo?: string;
  podpis: string;
}) {
  const { liczba } = useOrderList(slug);
  return (
    <div className="px-5 pt-16 pb-6 text-center sm:pt-20">
      <div aria-hidden className="ludzik-kolysanie relative mx-auto w-32 sm:w-40">
        <div key={liczba} className={liczba ? "ludzik-podskok" : ""}>
          <Image src={znak} alt="" width={148} height={215} priority className="h-auto w-full" />
        </div>
        {/* para nad miską (miska po prawej, na wysokości ~40%) */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="ludzik-para absolute top-[22%] h-6 w-1.5 rounded-full bg-tekst-2/40"
            style={{ left: `${74 + i * 6}%`, animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </div>
      <h1 className="mt-2 animate-wjazd font-[family-name:var(--ozdobny-lokalu,var(--naglowek-lokalu))] text-5xl leading-none uppercase sm:text-6xl">
        {nazwa}
      </h1>
      {haslo && (
        <p className="mt-1 animate-wjazd text-sm font-medium tracking-[0.25em] uppercase [animation-delay:100ms] sm:text-base">
          {haslo}
        </p>
      )}
      <p className="mt-2 animate-wjazd text-sm text-tekst-2 [animation-delay:200ms]">{podpis}</p>
    </div>
  );
}
