"use client";

import Image from "next/image";
import { useOrderList } from "@/components/menu/useOrderList";

/**
 * Venue theme banner with its mascot: the figure sways, steam rises from the bowl, and when someone adds a dish to the
 * list (or removes one) it jumps — a `key` with the item count replays the animation. Below it the name (the page's
 * <h1>) in the decorative font, `haslo` and the address. The mascot is a venue graphic (public/motywy/…) — only with
 * its consent.
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
        {/* steam above the bowl (the bowl is on the right, at about 40% height) */}
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
