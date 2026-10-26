import { pobierzLokal } from "@/lib/lokale";
import { pobierzMenu } from "@/lib/menu";
import { motywLokalu } from "@/lib/motyw";
import { opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { ROZMIAR, obrazekUdostepnien } from "@/lib/obrazekUdostepnien";

export const alt = "Lokal na szamanie.pl — menu, godziny otwarcia, telefon i dojazd";
export const size = ROZMIAR;
export const contentType = "image/png";

export default async function Obrazek({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lokal = await pobierzLokal(slug);
  if (!lokal) return new Response(null, { status: 404 });
  const menu = await pobierzMenu(lokal.id);
  return obrazekUdostepnien({
    tytul: lokal.nazwa,
    podtytul: [opisLokalu(lokal), pelnyAdres(lokal)].filter(Boolean).join(" · "),
    zdjecie: motywLokalu(lokal).zdjecie?.plik,
    dopisek: menu ? `Menu z cenami · ${menu.liczba} pozycji` : lokal.dostawa ? "Dowóz" : "Godziny · telefon · dojazd",
  });
}
