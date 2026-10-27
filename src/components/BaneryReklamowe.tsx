"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgePercent, BookOpen, Megaphone } from "lucide-react";
import { REKLAMY } from "@/lib/reklamy";

const IKONY = { megafon: Megaphone, menu: BookOpen, procent: BadgePercent };

/**
 * Miejsce na banery reklamowe: przewijana taśma (następny baner wystaje z prawej), sama przewija się co 6 s,
 * dopóki ktoś jej nie dotknie. Zaokrąglenie z `--promien-reklamy`, żeby pasowało do wyglądu strony.
 */
export default function BaneryReklamowe({ className = "", ciemne = false }: { className?: string; ciemne?: boolean }) {
  const tasma = useRef<HTMLDivElement>(null);
  const [aktywny, setAktywny] = useState(0);

  useEffect(() => {
    const el = tasma.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dotknieta = false;
    const stop = () => (dotknieta = true);
    el.addEventListener("pointerdown", stop, { passive: true });
    el.addEventListener("wheel", stop, { passive: true });
    const id = setInterval(() => {
      if (dotknieta || document.hidden) return;
      const krok = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
      const nastepny = Math.round(el.scrollLeft / krok) + 1;
      el.scrollTo({ left: nastepny >= REKLAMY.length ? 0 : nastepny * (krok + 12), behavior: "smooth" });
    }, 6000);
    return () => {
      clearInterval(id);
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("wheel", stop);
    };
  }, []);

  const przewiniete = () => {
    const el = tasma.current;
    const krok = (el?.firstElementChild as HTMLElement | null)?.offsetWidth;
    if (el && krok) setAktywny(Math.min(REKLAMY.length - 1, Math.round(el.scrollLeft / (krok + 12))));
  };

  return (
    <section aria-label="Polecane" className={className}>
      <div
        ref={tasma}
        onScroll={przewiniete}
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 [scrollbar-width:none]"
      >
        {REKLAMY.map((r) => {
          const Ikona = IKONY[r.ikona];
          return (
            <Link
              key={r.id}
              href={r.href}
              className={`relative flex h-40 w-[86%] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[var(--promien-reklamy,1.5rem)] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition active:scale-[0.98] sm:w-[22rem] ${
                r.ciemna ? "text-white" : "text-[#111]"
              }`}
              style={{ background: r.tlo }}
            >
              <Ikona aria-hidden strokeWidth={1.25} className="absolute -right-4 -bottom-6 size-36 rotate-[-14deg] opacity-20" />
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${
                  r.ciemna ? "bg-white/15" : "bg-black/10"
                }`}
              >
                {r.etykieta}
              </span>
              <span className="relative">
                <span className="block font-grotesk text-xl leading-tight font-bold">{r.tytul}</span>
                <span className="mt-1 flex items-end gap-3">
                  <span
                    className={`flex-1 text-[13px] leading-snug font-semibold ${r.ciemna ? "text-white/75" : "text-black/70"}`}
                  >
                    {r.podpis}
                  </span>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black ${
                      r.ciemna ? "bg-white text-[#111]" : "bg-[#111] text-white"
                    }`}
                  >
                    {r.cta} <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-2.5 flex justify-center gap-1.5" aria-hidden>
        {REKLAMY.map((r, i) => (
          <span
            key={r.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === aktywny ? "w-5 bg-akcent" : `w-1.5 ${ciemne ? "bg-white/30" : "bg-tekst/20"}`}`}
          />
        ))}
      </div>
    </section>
  );
}
