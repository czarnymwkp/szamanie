/**
 * Venue theme banner in the style of its website: a dark strip, the name centered in letter-spaced uppercase (the
 * page's <h1>, font --naglowek-lokalu), a short line and `haslo` in the `obrys-2` color, the address below. No venue
 * logo (only with its consent).
 */
export default function StripBanner({ nazwa, haslo, podpis }: { nazwa: string; haslo?: string; podpis: string }) {
  return (
    <div className="bg-akcent px-5 pt-20 pb-10 text-center text-na-akcencie sm:pt-24">
      <h1 className="animate-wjazd font-[family-name:var(--ozdobny-lokalu,var(--naglowek-lokalu))] text-4xl font-semibold tracking-[0.25em] uppercase sm:text-6xl">
        {nazwa}
      </h1>
      <span aria-hidden className="mx-auto mt-4 block h-0.5 w-16 origin-center animate-rozwin bg-obrys-2 [animation-delay:150ms]" />
      {haslo && (
        <p className="mt-3 animate-wjazd text-xs font-semibold tracking-[0.3em] text-obrys-2 uppercase [animation-delay:200ms] sm:text-sm">
          {haslo}
        </p>
      )}
      <p className="mt-2 animate-wjazd text-sm opacity-70 [animation-delay:250ms]">{podpis}</p>
    </div>
  );
}
