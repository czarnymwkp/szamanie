/**
 * Venue theme banner in the style of its menu card: cream background, the tagline in the small label font
 * (--etykiety-lokalu), the name in uppercase (the page's <h1>, font --naglowek-lokalu), the address and a
 * black-and-white checkered strip at the bottom. The checkerboard is a CSS pattern, not a venue graphic.
 */
export default function CheckerBanner({ nazwa, haslo, podpis }: { nazwa: string; haslo?: string; podpis: string }) {
  return (
    <div className="relative overflow-hidden bg-krem pt-20 sm:pt-24">
      <div className="mx-auto max-w-5xl px-5 pb-8">
        {haslo && (
          <p className="animate-wjazd font-[family-name:var(--etykiety-lokalu)] text-[11px] font-medium tracking-[0.2em] text-akcent-tekst uppercase">
            {haslo}
          </p>
        )}
        <h1 className="mt-2 animate-wjazd font-[family-name:var(--naglowek-lokalu)] text-5xl leading-none font-medium tracking-tight uppercase [animation-delay:100ms] sm:text-6xl lg:text-7xl">
          {nazwa}
        </h1>
        <p className="mt-3 animate-wjazd text-sm font-medium text-tekst-2 [animation-delay:200ms]">{podpis}</p>
      </div>
      <div
        aria-hidden
        className="h-5 bg-[repeating-conic-gradient(var(--color-tekst)_0_25%,var(--color-karta)_0_50%)] bg-[length:20px_20px]"
      />
    </div>
  );
}
