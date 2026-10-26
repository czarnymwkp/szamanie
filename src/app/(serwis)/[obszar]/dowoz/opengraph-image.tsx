import { pobierzLokale } from "@/lib/lokale";
import { ROZMIAR, obrazekUdostepnien } from "@/lib/obrazekUdostepnien";
import { lokaleZDowozem, obszaryZDowozem } from "@/lib/seo";

export const alt = "Jedzenie z dowozem — kto dowozi i za ile, na szamanie.pl";
export const size = ROZMIAR;
export const contentType = "image/png";

export default async function Obrazek({ params }: { params: Promise<{ obszar: string }> }) {
  const { obszar: slug } = await params;
  const lokale = await pobierzLokale();
  const obszar = obszaryZDowozem(lokale).find((o) => o.slug === slug);
  if (!obszar) return new Response(null, { status: 404 });
  const { w } = lokaleZDowozem(lokale, obszar);
  return obrazekUdostepnien({
    tytul: `Jedzenie z dowozem ${obszar.w}`,
    podtytul: `Kto dowozi i za ile: ${w
      .slice(0, 3)
      .map((l) => l.nazwa)
      .join(", ")}${w.length > 3 ? " i inne" : ""}.`,
    zdjecie: "/zdjecia/kategorie/pizza.jpg",
    dopisek: "Ceny dostawy · minimum",
  });
}
