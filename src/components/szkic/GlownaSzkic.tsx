"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Leaf, Search, Truck } from "lucide-react";
import type { Lokal, Miejscowosc } from "@/lib/lokale";
import { motywLokalu } from "@/lib/motyw";
import { odmiana, opisLokalu } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import StatusOtwarcia from "../StatusOtwarcia";
import FiltryM from "../mobilne/FiltryM";
import SzamanM from "../mobilne/SzamanM";
import { useKatalog } from "../useKatalog";
import { Podkreslenie, chip, reka } from "./szkic";

/** Strona główna serwisu w wyglądzie „Szkicownik”: wyszukiwarka, banery, kategorie, „do późna” i lokale-polaroidy. */
export default function GlownaSzkic({ lokale, miejscowosci }: { lokale: Lokal[]; miejscowosci: Miejscowosc[] }) {
  const k = useKatalog(lokale, miejscowosci);

  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="relative pt-8">
        <SzamanM styl="szkic" className="pointer-events-none absolute top-0 -right-2 w-28 rotate-3 animate-wjazd [animation-delay:300ms] lg:right-6 lg:w-40" />
        <h1 className="animate-wjazd text-[2.9rem] leading-[0.95] font-black tracking-tight lg:text-6xl">
          Co dziś
          <span className={`${reka.className} relative ml-1 inline-block -rotate-2 text-[4.2rem] text-akcent-tekst lg:text-[5.5rem]`}>
            szamiesz?
            <Podkreslenie className="absolute -bottom-2 left-0 h-4 w-full" />
          </span>
        </h1>
        <p className={`${reka.className} mt-4 ml-2 rotate-[-1.5deg] text-2xl text-tekst-2`}>
          {lokale.length} {odmiana(lokale.length, ["miejsce", "miejsca", "miejsc"])} w Kraśniku i okolicy ↓
        </p>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="m-reczna-ramka mt-3 flex h-14 rotate-[-0.6deg] items-center gap-2 border-[2.5px] border-tekst bg-white pr-2 pl-4 shadow-[5px_5px_0_#1d1b19]"
        >
          <Search className="size-5 shrink-0" aria-hidden />
          <input
            type="search"
            value={k.szukaj}
            onChange={(e) => k.setSzukaj(e.target.value)}
            placeholder="pizza, kebab, nazwa…"
            aria-label="Szukaj lokalu"
            className="min-w-0 flex-1 bg-transparent text-lg font-bold outline-none placeholder:text-tekst-2/70"
          />
          <button
            type="button"
            onClick={() => k.setTylkoWege(!k.tylkoWege)}
            aria-pressed={k.tylkoWege}
            aria-label="Tylko wege"
            className={`flex size-10 rotate-6 items-center justify-center rounded-full border-2 border-tekst transition ${
              k.tylkoWege ? "bg-[#86efac]" : "bg-white"
            }`}
          >
            <Leaf className="size-5 text-[#15803d]" aria-hidden />
          </button>
        </form>
      </section>

      <BaneryReklamowe className="mt-7 [--promien-reklamy:0.6rem]" />

      <section aria-labelledby="kategorie" className="mt-7">
        <h2 id="kategorie" className={`${reka.className} text-[2.1rem] leading-none`}>
          Na co masz ochotę?
        </h2>
        {/* telefon: przesuwanie palcem; komputer: wszystkie w rzędach, bo myszką nie da się przewinąć w bok */}
        <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {k.kategorie.map((kat, i) => {
            const aktywna = k.kategoria === kat.id;
            return (
              <button
                key={kat.id}
                type="button"
                aria-pressed={aktywna}
                onClick={() => k.setKategoria(kat.id)}
                className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1"
              >
                <span
                  className={`m-reczna-ramka flex size-16 items-center justify-center border-2 border-tekst transition ${
                    aktywna ? "bg-[#ffd36e]" : "bg-white"
                  }`}
                  style={{ rotate: `${i % 2 ? 3 : -3}deg` }}
                >
                  <IkonaTypu ikona={kat.ikona} className="size-7" />
                </span>
                <span className={`${reka.className} text-xl leading-tight whitespace-nowrap`}>{kat.nazwa}</span>
              </button>
            );
          })}
        </div>
      </section>

      {k.doPozna.length > 0 && k.kategoria === "wszystko" && !k.szukaj && (
        <section aria-labelledby="pozno" className="mt-5">
          <h2 id="pozno" className={`${reka.className} text-[2.1rem] leading-none`}>
            Głodny w nocy? Tu jeszcze otwarte:
          </h2>
          <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pt-2 pb-4 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:gap-5 lg:overflow-visible lg:px-0">
            {k.doPozna.map(({ lokal, doGodziny }, i) => (
              <Link
                key={lokal.id}
                href={`/lokal/${lokal.slug}`}
                className="w-36 shrink-0 bg-[#fff3a8] p-3 shadow-[2px_6px_12px_rgba(0,0,0,0.12)]"
                style={{ rotate: `${i % 2 ? 2.5 : -2}deg` }}
              >
                <span className="block truncate font-black">{lokal.nazwa}</span>
                <span className={`${reka.className} mt-1 block text-3xl leading-none text-akcent-tekst`}>do {doGodziny}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="wyniki" aria-label="Lokale" className="mt-5 scroll-mt-16">
        <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="bg-[#86efac] shadow-none" />
        <h2 className={`${reka.className} mt-3 text-3xl`}>
          {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {k.wyniki.map((l, i) => (
            <li key={l.id} className="pojawianie">
              <Link
                href={`/lokal/${l.slug}`}
                className="m-tasma relative block bg-white p-2 pb-3 shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition hover:rotate-0"
                style={{ rotate: `${[-1.6, 1.2, -0.6, 1.8][i % 4]}deg` }}
              >
                <div className="relative">
                  {/* pierwsze dwa rzędy od razu, reszta dopiero przy przewijaniu */}
                  <ZdjecieKarty lokal={l} odRazu={i < 4} />
                  {l.dostawa && (
                    // jak plakietka „Dowóz” ze starej karty: autko podskakuje, za nim smużki (.dowoz-auto w globals.css)
                    <span
                      role="img"
                      aria-label="Dowozi"
                      className="absolute -bottom-2 -left-2 flex h-8 -rotate-3 items-center gap-1.5 overflow-hidden rounded-full border-2 border-tekst bg-akcent pr-2.5 pl-3 text-xs font-black text-na-akcencie"
                    >
                      <span aria-hidden className="dowoz-auto relative flex">
                        <Truck className="size-4" />
                      </span>
                      <span aria-hidden>Dowóz</span>
                    </span>
                  )}
                  {(l.cechy.wege || l.cechy.wegan) && (
                    <span className="absolute -right-2 -bottom-2 flex size-8 rotate-12 items-center justify-center rounded-full border-2 border-tekst bg-[#86efac]">
                      <Leaf className="size-4 text-[#15803d]" aria-label="wege" />
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-[15px] leading-tight font-black">{l.nazwa}</h3>
                <p className="truncate text-xs font-semibold text-tekst-2">{opisLokalu(l)}</p>
                <StatusOtwarcia godziny={l.godziny} className="mt-1 text-xs" />
                {l.promowany && <span className={`${reka.className} absolute -top-5 -right-1 rotate-6 text-xl text-akcent-tekst`}>polecam!</span>}
              </Link>
            </li>
          ))}
        </ul>
        {!k.wyniki.length && (
          <p className={`${reka.className} mt-6 text-center text-3xl`}>
            Pusto… <button type="button" onClick={k.wyczysc} className="text-akcent-tekst underline">pokaż wszystko</button>
          </p>
        )}
      </section>
    </div>
  );
}

/**
 * Zdjęcie karty lokalu. Każdy lokal ma inne zdjęcie, więc przeglądarka nie bierze ich z pamięci — a leniwe ładowanie
 * przeglądarki i tak pobiera kilkanaście kart naprzód (Lighthouse: 22 zdjęcia i ok. 570 KB przy wejściu). Dlatego
 * zdjęcie dalszych kart wstawiamy dopiero, gdy karta jest ok. 300 px od ekranu; do tego czasu kolor kategorii.
 */
function ZdjecieKarty({ lokal, odRazu }: { lokal: Lokal; odRazu: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [widoczne, setWidoczne] = useState(odRazu);
  useEffect(() => {
    const el = ref.current;
    if (widoczne || !el) return;
    const obserwator = new IntersectionObserver(
      ([wpis]) => {
        if (wpis.isIntersecting) {
          setWidoczne(true);
          obserwator.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    obserwator.observe(el);
    return () => obserwator.disconnect();
  }, [widoczne]);
  return widoczne ? (
    <Miniatura lokal={lokal} className="aspect-square" sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw" dopisek={false} />
  ) : (
    <div ref={ref} className="aspect-square" style={{ backgroundColor: motywLokalu(lokal).kolor }} />
  );
}
