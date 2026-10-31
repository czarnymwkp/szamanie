import { Hamburger, Pizza } from "lucide-react";

/**
 * Venue theme banner in the style of its menu card: the name in uppercase on a black bar that slides in from the left,
 * below it a line in the accent color, the tagline and the address. The name is the page's <h1>, in the theme font
 * (--naglowek-lokalu). The sketches in the background are icons, not graphics from the venue's card (those only with
 * its consent).
 */
export default function BarBanner({ nazwa, haslo, podpis }: { nazwa: string; haslo?: string; podpis: string }) {
  return (
    <div className="relative overflow-hidden bg-tlo pt-20 pb-2 sm:pt-24">
      <Hamburger
        aria-hidden
        strokeWidth={0.75}
        className="absolute top-8 -right-8 size-48 rotate-[-12deg] animate-unoszenie text-tekst/10 sm:right-[6%] sm:size-64"
      />
      <Pizza
        aria-hidden
        strokeWidth={0.75}
        className="absolute right-20 -bottom-4 size-28 rotate-[18deg] animate-unoszenie text-tekst/10 [animation-delay:-3s] sm:right-[28%] sm:size-36"
      />
      <div className="mx-auto max-w-5xl">
        <div className="relative w-fit max-w-[calc(100%-1.25rem)] py-3 pr-6 pl-5 sm:ml-5 sm:pl-6">
          <span aria-hidden className="absolute inset-0 origin-left animate-rozwin bg-tekst" />
          <h1 className="relative animate-wjazd font-[family-name:var(--naglowek-lokalu)] text-5xl leading-[0.95] font-black tracking-tight text-tlo uppercase [animation-delay:250ms] sm:text-6xl lg:text-7xl">
            {nazwa.replace(/\s*&\s*/g, " & ")}
          </h1>
        </div>
        <div className="px-5">
          <span aria-hidden className="mt-4 block h-1 w-48 origin-left animate-rozwin bg-akcent [animation-delay:350ms]" />
          {haslo && (
            <p className="mt-2 animate-wjazd text-lg font-black tracking-wide uppercase [animation-delay:400ms]">
              {haslo}
            </p>
          )}
          <p className="animate-wjazd text-sm font-bold text-tekst-2 [animation-delay:450ms]">{podpis}</p>
        </div>
      </div>
    </div>
  );
}
