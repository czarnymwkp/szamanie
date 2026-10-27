import type { Lokal } from "@/lib/lokale";
import { obszaryZDowozem, wszystkieStrony } from "@/lib/seo";
import type { LinkStopki } from "./StopkaM";

/** Linki do stron „Pizza w Kraśniku”, „Jedzenie z dowozem…” w stopce propozycji (jak w stopce serwisu). */
export function linkiStopki(lokale: Lokal[]): LinkStopki[] {
  const zDowozem = obszaryZDowozem(lokale);
  return wszystkieStrony(lokale)
    .flatMap(({ obszar, kategoria }) => [
      { nazwa: kategoria ? `${kategoria.nazwa} ${obszar.w}` : `Gdzie zjeść ${obszar.w}`, adres: `/${obszar.slug}${kategoria ? `/${kategoria.slug}` : ""}` },
      ...(!kategoria && zDowozem.includes(obszar) ? [{ nazwa: `Jedzenie z dowozem ${obszar.w}`, adres: `/${obszar.slug}/dowoz` }] : []),
    ])
    .slice(0, 8);
}
