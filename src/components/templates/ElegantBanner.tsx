/**
 * Venue theme banner in the style of an elegant menu: on the page background (e.g. marble) the name in large italics in
 * the decorative font (the page's <h1>, --ozdobny-lokalu), a thin line in the accent-text color with a diamond, `haslo`
 * in letter-spaced uppercase and the address. No venue logo (only with its consent).
 */
export default function ElegantBanner({ nazwa, haslo, podpis }: { nazwa: string; haslo?: string; podpis: string }) {
  return (
    <div className="px-5 pt-20 pb-8 text-center sm:pt-24">
      <h1 className="animate-wjazd font-[family-name:var(--ozdobny-lokalu,var(--naglowek-lokalu))] text-6xl leading-none italic sm:text-8xl">
        {nazwa}
      </h1>
      <p aria-hidden className="mx-auto mt-4 flex w-56 animate-wjazd items-center gap-2 text-akcent-tekst [animation-delay:150ms]">
        <span className="h-px flex-1 bg-current" />
        <span className="size-2 rotate-45 border border-current" />
        <span className="h-px flex-1 bg-current" />
      </p>
      {haslo && (
        <p className="mt-3 animate-wjazd text-xs font-semibold tracking-[0.35em] text-akcent-tekst uppercase [animation-delay:200ms] sm:text-sm">
          {haslo}
        </p>
      )}
      <p className="mt-2 animate-wjazd text-sm text-tekst-2 [animation-delay:250ms]">{podpis}</p>
    </div>
  );
}
