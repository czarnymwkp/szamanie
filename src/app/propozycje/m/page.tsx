import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Smartphone, Store } from "lucide-react";
import { GOTOWE } from "@/components/mobilne";
import { LOKALE_DO_PODGLADU, PROPOZYCJE_M, PRZYKLADOWY_LOKAL_M, adresM, lokalM } from "@/components/mobilne/wspolne";

export default function ListaPropozycjiM() {
  return (
    <main id="tresc" className="mx-auto w-full max-w-3xl px-5 py-8">
      <Image src="/logo-jasne-tlo.png" alt="szamanie" width={148} height={32} className="h-8 w-auto" priority />
      <h1 className="mt-6 flex animate-wjazd items-center gap-2 text-3xl font-black lg:text-4xl">
        <Smartphone className="size-8 text-akcent-tekst" aria-hidden /> 10 propozycji na telefon
      </h1>
      <p className="mt-3 animate-wjazd font-semibold text-tekst-2 [animation-delay:80ms]">
        Cały wygląd: strona główna i strona lokalu, na prawdziwych danych. Każda ma inne tło, układ i animacje. Na
        każdej stronie głównej pod wyszukiwarką jest miejsce na banery reklamowe, a przy wyszukiwaniu listek „Wege”.
        Przełącznik przy prawej krawędzi ekranu: ▲ ▼ zmienia propozycję, pomarańczowy przycisk przechodzi między
        stroną główną a stroną lokalu.
      </p>
      <ol className="mt-7 grid gap-3 sm:grid-cols-2">
        {PROPOZYCJE_M.map((p) => (
          <li key={p.nr} className="pojawianie flex flex-col rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-akcent font-black">{p.nr}</span>
              <h2 className="text-xl font-black">{p.nazwa}</h2>
              {!GOTOWE.has(p.nr) && (
                <span className="ml-auto rounded-full bg-krem px-2.5 py-1 text-xs font-extrabold text-tekst-2">w budowie</span>
              )}
            </div>
            <p className="mt-2 flex-1 text-sm font-semibold text-tekst-2">{p.opis}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={adresM(p.nr)}
                className="inline-flex items-center gap-1.5 rounded-full bg-tekst px-4 py-2 text-sm font-black text-white"
              >
                Strona główna <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={lokalM(p.nr, PRZYKLADOWY_LOKAL_M)}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-tekst px-4 py-2 text-sm font-black"
              >
                <Store className="size-4" aria-hidden /> Strona lokalu
              </Link>
            </div>
          </li>
        ))}
      </ol>
      <h2 className="mt-10 text-xl font-black">Strona lokalu na innych lokalach</h2>
      <p className="mt-1 text-sm font-semibold text-tekst-2">Ten sam wygląd, inna kuchnia i długość menu (propozycja 1):</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {LOKALE_DO_PODGLADU.map((l) => (
          <Link key={l.slug} href={lokalM(1, l.slug)} className="rounded-full bg-krem px-4 py-2 text-sm font-extrabold">
            {l.nazwa}
          </Link>
        ))}
      </div>
    </main>
  );
}
