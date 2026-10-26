import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { PROPOZYCJE, PRZYKLADOWY_LOKAL, adresPropozycji, prefiksLokalu } from "@/components/propozycje/wspolne";

export default function ListaPropozycji() {
  return (
    <main id="tresc" className="mx-auto w-full max-w-6xl px-5 py-10">
      <Image src="/logo-jasne-tlo.png" alt="szamanie" width={148} height={32} className="h-8 w-auto" priority />
      <h1 className="mt-6 animate-wjazd text-3xl font-black lg:text-5xl">10 propozycji wyglądu</h1>
      <p className="mt-3 max-w-2xl animate-wjazd font-semibold text-tekst-2 [animation-delay:80ms]">
        Każda propozycja ma stronę główną i stronę restauracji, na prawdziwych lokalach. Działają na komputerze i na
        telefonie. Na dole ekranu jest przełącznik ‹ › do przeskakiwania między propozycjami. Wygląd strony restauracji
        to zarazem szablon, który lokal będzie mógł wybrać w abonamencie.
      </p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROPOZYCJE.map((p) => (
          <li key={p.nr} className="pojawianie flex flex-col rounded-2xl bg-white p-5 shadow-sm">
            <span className="flex size-10 items-center justify-center rounded-full bg-akcent font-black">{p.nr}</span>
            <h2 className="mt-3 text-xl font-black">{p.nazwa}</h2>
            <p className="mt-1 flex-1 text-sm font-semibold text-tekst-2">{p.opis}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={adresPropozycji(p.nr)}
                className="inline-flex items-center gap-1.5 rounded-full bg-tekst px-4 py-2 text-sm font-black text-white transition hover:gap-2.5"
              >
                Strona główna <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={`${prefiksLokalu(p.nr)}${PRZYKLADOWY_LOKAL}`}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-tekst px-4 py-2 text-sm font-black transition hover:bg-tekst hover:text-white"
              >
                <Store className="size-4" aria-hidden /> Strona lokalu
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
