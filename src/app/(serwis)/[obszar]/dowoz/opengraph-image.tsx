import { getVenues } from "@/lib/venues";
import { SIZE, shareImage } from "@/lib/shareImage";
import { venuesWithDelivery, areasWithDelivery } from "@/lib/seo";

export const alt = "Jedzenie z dowozem — kto dowozi i za ile, na szamanie.pl";
export const size = SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ obszar: string }> }) {
  const { obszar: slug } = await params;
  const venues = await getVenues();
  const area = areasWithDelivery(venues).find((o) => o.slug === slug);
  if (!area) return new Response(null, { status: 404 });
  const { w } = venuesWithDelivery(venues, area);
  return shareImage({
    tytul: `Jedzenie z dowozem ${area.w}`,
    podtytul: `Kto dowozi i za ile: ${w
      .slice(0, 3)
      .map((l) => l.nazwa)
      .join(", ")}${w.length > 3 ? " i inne" : ""}.`,
    zdjecie: "/zdjecia/kategorie/pizza.jpg",
    dopisek: "Ceny dostawy · minimum",
  });
}
