/**
 * Baner motywu lokalu w stylu nagłówka jego karty menu: `haslo` rozstrzelonymi wersalikami, gruba czarna kreska,
 * pod nią nazwa (<h1> strony, krój --naglowek-lokalu). Nazwa „Kwadrat - Miejsce Spotkań” dzieli się na dużą część
 * przed myślnikiem i mniejszy dopisek po nim. Bez logo lokalu (tylko za jego zgodą).
 */
export default function RuleBanner({ nazwa, haslo, podpis }: { nazwa: string; haslo?: string; podpis: string }) {
  const [glowna, ...reszta] = nazwa.split(/\s+[-–—]\s+/);
  return (
    <div className="bg-tlo pt-20 pb-6 sm:pt-24">
      <div className="mx-auto max-w-5xl px-5">
        {haslo && (
          <p className="animate-wjazd font-[family-name:var(--naglowek-lokalu)] text-xl font-bold tracking-[0.28em] uppercase sm:text-2xl">{haslo}</p>
        )}
        <span aria-hidden className="mt-2 block h-3 w-44 origin-left animate-rozwin bg-tekst [animation-delay:150ms] sm:w-56" />
        <h1 className="mt-3 animate-wjazd font-[family-name:var(--naglowek-lokalu)] [animation-delay:250ms]">
          <span className="block text-4xl leading-none font-bold tracking-[0.2em] uppercase sm:text-6xl">{glowna}</span>
          {reszta.length > 0 && (
            <span className="mt-2 block text-sm font-semibold tracking-[0.3em] text-tekst-2 uppercase">
              {reszta.join(" – ")}
            </span>
          )}
        </h1>
        <p className="mt-4 animate-wjazd text-sm font-semibold text-tekst-2 [animation-delay:350ms]">
          {podpis}
        </p>
      </div>
    </div>
  );
}
