import { formatPln } from "@/lib/ceny";
import { getVenues } from "@/lib/lokale";
import { venueCount } from "@/lib/nazwy";
import { SIZE, shareImage } from "@/lib/obrazekUdostepnien";
import { categoryDishes, categoryVenues, findPage } from "@/lib/seo";
import { CATEGORY_PHOTOS } from "@/lib/zdjeciaKategorii";

export const alt = "Lokale z kategorii na szamanie.pl — godziny, telefon, ceny";
export const size = SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ obszar: string; kategoria: string }> }) {
  const { obszar: o, kategoria: k } = await params;
  const venues = await getVenues();
  const page = findPage(venues, o, k);
  if (!page?.kategoria) return new Response(null, { status: 404 });
  const { obszar, kategoria } = page;
  const { w } = categoryVenues(venues, obszar, kategoria);
  const fromArea = new Set(w.map((l) => l.id));
  const prices = (await categoryDishes(kategoria))
    .filter((d) => fromArea.has(d.lokalId))
    .flatMap((d) => d.ceny.map((c) => c.gr));
  return shareImage({
    tytul: `${kategoria.nazwa} ${obszar.w}`,
    podtytul: `${venueCount(w.length)}: ${w
      .slice(0, 3)
      .map((l) => l.nazwa)
      .join(", ")}${w.length > 3 ? " i inne" : ""}.`,
    zdjecie: CATEGORY_PHOTOS[kategoria.zdjecie]?.plik,
    dopisek: prices.length ? `Ceny od ${formatPln(Math.min(...prices))}` : "Godziny · telefon · dojazd",
  });
}
