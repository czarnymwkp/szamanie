import Image from "next/image";
import Link from "next/link";
import { pobierzLokale } from "@/lib/lokale";
import { obszaryZDowozem, wszystkieStrony } from "@/lib/seo";

export default async function Stopka() {
  // Linki do stron fraz (/krasnik/pizza…) z każdej podstrony — Google trafia po nich do wszystkich.
  const lokale = await pobierzLokale();
  const zDowozem = obszaryZDowozem(lokale);
  const popularne = wszystkieStrony(lokale)
    .flatMap(({ obszar, kategoria }) => [
      {
        nazwa: kategoria ? `${kategoria.nazwa} ${obszar.w}` : `Gdzie zjeść ${obszar.w}`,
        adres: `/${obszar.slug}${kategoria ? `/${kategoria.slug}` : ""}`,
      },
      // zaraz po „Gdzie zjeść w Kraśniku” — „Jedzenie z dowozem w Kraśniku”
      ...(!kategoria && zDowozem.includes(obszar)
        ? [{ nazwa: `Jedzenie z dowozem ${obszar.w}`, adres: `/${obszar.slug}/dowoz` }]
        : []),
    ])
    .slice(0, 10);
  return (
    <footer className="mt-16 bg-krem">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={111} height={24} className="h-6 w-auto" />
          <p className="mt-3 max-w-xs text-sm font-semibold text-tekst-2">
            Katalog lokali gastronomicznych w Kraśniku i powiecie kraśnickim.
          </p>
        </div>
        <nav aria-label="Dla gości">
          <h2 className="text-sm font-black">Dla gości</h2>
          <ul className="mt-2 space-y-1.5 text-sm font-bold">
            <li>
              <Link href="/#wyniki" className="hover:text-akcent-tekst">
                Wszystkie lokale
              </Link>
            </li>
            {popularne.map((p) => (
              <li key={p.adres}>
                <Link href={p.adres} className="hover:text-akcent-tekst">
                  {p.nazwa}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Dla lokali">
          <h2 className="text-sm font-black">Dla lokali</h2>
          <ul className="mt-2 space-y-1.5 text-sm font-bold">
            <li>
              <Link href="/dla-lokali" className="hover:text-akcent-tekst">
                Pakiety i wyróżnienia
              </Link>
            </li>
            <li>
              <Link href="/dla-lokali#wpis" className="hover:text-akcent-tekst">
                Dodaj lub popraw lokal
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-black/10">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs font-semibold text-tekst-2">
          Dane o lokalach: ©{" "}
          <a href="https://www.openstreetmap.org/copyright" className="underline hover:text-tekst">
            współtwórcy OpenStreetMap
          </a>{" "}
          (licencja ODbL).{" "}
          <Link href="/autorzy-zdjec" className="underline hover:text-tekst">
            Autorzy zdjęć
          </Link>{" "}
          ·{" "}
          <Link href="/polityka-prywatnosci" className="underline hover:text-tekst">
            Polityka prywatności
          </Link>
        </p>
      </div>
    </footer>
  );
}
