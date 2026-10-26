import { pobierzLokale } from "@/lib/lokale";
import { ileLokali } from "@/lib/nazwy";
import { ROZMIAR, obrazekUdostepnien } from "@/lib/obrazekUdostepnien";
import { kategorieZeStrona, lokaleObszaru, znajdzStrone } from "@/lib/seo";

export const alt = "Gdzie zjeść — lokale z godzinami, telefonem i dojazdem na szamanie.pl";
export const size = ROZMIAR;
export const contentType = "image/png";

export default async function Obrazek({ params }: { params: Promise<{ obszar: string }> }) {
  const { obszar: slug } = await params;
  const lokale = await pobierzLokale();
  const strona = znajdzStrone(lokale, slug);
  if (!strona) return new Response(null, { status: 404 });
  const { obszar } = strona;
  const kategorie = kategorieZeStrona(lokale, obszar).map((k) => k.nazwa.toLowerCase());
  return obrazekUdostepnien({
    tytul: `Gdzie zjeść ${obszar.w}?`,
    podtytul: `${ileLokali(lokaleObszaru(lokale, obszar).w.length)}${kategorie.length ? `: ${kategorie.slice(0, 4).join(", ")} i więcej` : ""}.`,
    zdjecie: "/zdjecia/kategorie/restauracja.jpg",
    dopisek: "Godziny · telefon · dojazd",
  });
}
