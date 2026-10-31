import Tricolor from "./Tricolor";

/**
 * Venue theme banner in the style of a menu on a chalkboard: a large name (the page's <h1>, font --naglowek-lokalu),
 * `haslo` in letter-spaced uppercase and a line in the Italian colors. The chalkboard is the whole page background (the
 * „kreda” texture). No venue logo (only with its consent).
 */
export default function ChalkboardBanner({ nazwa, haslo, podpis }: { nazwa: string; haslo?: string; podpis: string }) {
  return (
    <div className="pt-20 pb-6 sm:pt-24">
      <div className="mx-auto max-w-5xl px-5">
        <h1 className="w-fit animate-wjazd font-[family-name:var(--naglowek-lokalu)]">
          <span className="block text-7xl leading-none font-light sm:text-8xl">{nazwa}</span>
          {haslo && (
            <span className="mt-2 block text-center text-xl font-medium tracking-[0.3em] uppercase sm:text-2xl">{haslo}</span>
          )}
          <Tricolor className="mt-2" />
        </h1>
        <p className="mt-4 animate-wjazd text-sm font-medium text-tekst-2 [animation-delay:200ms]">{podpis}</p>
      </div>
    </div>
  );
}
