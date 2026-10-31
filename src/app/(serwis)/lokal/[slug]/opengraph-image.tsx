import { getVenue } from "@/lib/venues";
import { getMenu } from "@/lib/menu";
import { venueTheme } from "@/lib/categoryTheme";
import { venueDescription, fullAddress } from "@/lib/format";
import { SIZE, shareImage } from "@/lib/shareImage";

export const alt = "Lokal na szamanie.pl — menu, godziny otwarcia, telefon i dojazd";
export const size = SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return new Response(null, { status: 404 });
  const menu = await getMenu(venue.id);
  return shareImage({
    tytul: venue.nazwa,
    podtytul: [venueDescription(venue), fullAddress(venue)].filter(Boolean).join(" · "),
    zdjecie: venueTheme(venue).zdjecie?.plik,
    dopisek: menu ? `Menu z cenami · ${menu.liczba} pozycji` : venue.dostawa ? "Dowóz" : "Godziny · telefon · dojazd",
  });
}
