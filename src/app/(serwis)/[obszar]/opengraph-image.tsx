import { getVenues } from "@/lib/lokale";
import { venueCount } from "@/lib/nazwy";
import { SIZE, shareImage } from "@/lib/obrazekUdostepnien";
import { categoriesWithPage, areaVenues, findPage } from "@/lib/seo";

export const alt = "Gdzie zjeść — lokale z godzinami, telefonem i dojazdem na szamanie.pl";
export const size = SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ obszar: string }> }) {
  const { obszar: slug } = await params;
  const venues = await getVenues();
  const page = findPage(venues, slug);
  if (!page) return new Response(null, { status: 404 });
  const { obszar } = page;
  const categories = categoriesWithPage(venues, obszar).map((k) => k.nazwa.toLowerCase());
  return shareImage({
    tytul: `Gdzie zjeść ${obszar.w}?`,
    podtytul: `${venueCount(areaVenues(venues, obszar).w.length)}${categories.length ? `: ${categories.slice(0, 4).join(", ")} i więcej` : ""}.`,
    zdjecie: "/zdjecia/kategorie/restauracja.jpg",
    dopisek: "Godziny · telefon · dojazd",
  });
}
