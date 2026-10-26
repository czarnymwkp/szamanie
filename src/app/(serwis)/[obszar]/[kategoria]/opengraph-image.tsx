import { zl } from "@/lib/ceny";
import { pobierzLokale } from "@/lib/lokale";
import { ileLokali } from "@/lib/nazwy";
import { ROZMIAR, obrazekUdostepnien } from "@/lib/obrazekUdostepnien";
import { daniaKategorii, lokaleKategorii, znajdzStrone } from "@/lib/seo";
import { ZDJECIA_KATEGORII } from "@/lib/zdjeciaKategorii";

export const alt = "Lokale z kategorii na szamanie.pl — godziny, telefon, ceny";
export const size = ROZMIAR;
export const contentType = "image/png";

export default async function Obrazek({ params }: { params: Promise<{ obszar: string; kategoria: string }> }) {
  const { obszar: o, kategoria: k } = await params;
  const lokale = await pobierzLokale();
  const strona = znajdzStrone(lokale, o, k);
  if (!strona?.kategoria) return new Response(null, { status: 404 });
  const { obszar, kategoria } = strona;
  const { w } = lokaleKategorii(lokale, obszar, kategoria);
  const zObszaru = new Set(w.map((l) => l.id));
  const ceny = (await daniaKategorii(kategoria))
    .filter((d) => zObszaru.has(d.lokalId))
    .flatMap((d) => d.ceny.map((c) => c.gr));
  return obrazekUdostepnien({
    tytul: `${kategoria.nazwa} ${obszar.w}`,
    podtytul: `${ileLokali(w.length)}: ${w
      .slice(0, 3)
      .map((l) => l.nazwa)
      .join(", ")}${w.length > 3 ? " i inne" : ""}.`,
    zdjecie: ZDJECIA_KATEGORII[kategoria.zdjecie]?.plik,
    dopisek: ceny.length ? `Ceny od ${zl(Math.min(...ceny))}` : "Godziny · telefon · dojazd",
  });
}
