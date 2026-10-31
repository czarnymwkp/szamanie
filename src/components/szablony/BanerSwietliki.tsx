import type { CSSProperties } from "react";
import Image from "next/image";

// Stałe losowanie (to samo na serwerze i w przeglądarce), żeby świetliki nie skakały po wczytaniu strony.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const rand = seededRandom(7);
const FIREFLIES = Array.from({ length: 26 }, () => ({
  left: `${(rand() * 100).toFixed(1)}%`,
  top: `${(6 + rand() * 88).toFixed(1)}%`,
  "--r": `${(2.5 + rand() * 3.5).toFixed(1)}px`,
  "--t": `${(5 + rand() * 6).toFixed(1)}s`,
  "--d": `${(-rand() * 10).toFixed(1)}s`,
  "--dx": `${((rand() - 0.5) * 60).toFixed(0)}px`,
  "--dy": `${((rand() - 0.5) * 50).toFixed(0)}px`,
})) as CSSProperties[];

/**
 * Baner motywu lokalu jak na stronie lokalu: noc, świetliki, znak lokalu, a pod nim nazwa (to jest <h1> strony)
 * i linijka z adresem. Nagłówek w kroju motywu (--naglowek-lokalu).
 */
export default function FireflyBanner({
  znak,
  nazwa,
  podpis,
  className = "",
}: {
  znak: string;
  nazwa: string;
  podpis: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden px-5 pt-20 pb-12 text-center sm:pt-24 sm:pb-16 ${className}`}
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 115%, rgba(34,197,94,0.18), transparent 70%), radial-gradient(ellipse 50% 40% at 50% 30%, rgba(255,255,255,0.07), transparent 70%), #0a0a0a",
      }}
    >
      {FIREFLIES.map((style, i) => (
        <span key={i} aria-hidden className="swietlik" style={style} />
      ))}
      <div className="relative flex flex-col items-center">
        <Image
          src={znak}
          alt=""
          width={456}
          height={461}
          preload
          className="h-32 w-auto animate-wjazd drop-shadow-[0_0_24px_rgba(255,255,255,0.18)] sm:h-40"
        />
        <span aria-hidden className="mt-4 h-px w-44 animate-rozwin bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <h1 className="mt-5 animate-wjazd font-[family-name:var(--naglowek-lokalu)] text-4xl leading-tight font-bold text-white [animation-delay:80ms] sm:text-5xl lg:text-6xl">
          {nazwa}
        </h1>
        <p className="mt-3 animate-wjazd text-[11px] font-bold tracking-[0.3em] text-white/80 uppercase [animation-delay:140ms] sm:text-xs">
          {podpis}
        </p>
      </div>
      {/* płynne przejście w tło strony */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-tlo to-transparent" />
    </div>
  );
}
