import Trikolor from "./Trikolor";

/**
 * Baner motywu lokalu w stylu karty na kredowej tablicy: duża nazwa (<h1> strony, krój --naglowek-lokalu),
 * `haslo` rozstrzelonymi wersalikami i kreska w barwach Włoch. Tablica to tło całej strony (tekstura „kreda”).
 * Bez logo lokalu (tylko za jego zgodą).
 */
export default function BanerTablica({ nazwa, haslo, podpis }: { nazwa: string; haslo?: string; podpis: string }) {
  return (
    <div className="pt-20 pb-6 sm:pt-24">
      <div className="mx-auto max-w-5xl px-5">
        <h1 className="w-fit animate-wjazd font-[family-name:var(--naglowek-lokalu)]">
          <span className="block text-7xl leading-none font-light sm:text-8xl">{nazwa}</span>
          {haslo && (
            <span className="mt-2 block text-center text-xl font-medium tracking-[0.3em] uppercase sm:text-2xl">{haslo}</span>
          )}
          <Trikolor className="mt-2" />
        </h1>
        <p className="mt-4 animate-wjazd text-sm font-medium text-tekst-2 [animation-delay:200ms]">{podpis}</p>
      </div>
    </div>
  );
}
