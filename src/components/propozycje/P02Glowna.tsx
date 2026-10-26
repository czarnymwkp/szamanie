"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LocateFixed, Search } from "lucide-react";
import type { Lokal } from "@/lib/lokale";
import { odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import EtykietaPromo from "../EtykietaPromo";
import Miniatura from "../Miniatura";
import StatusOtwarcia from "../StatusOtwarcia";
import SzybkieAkcje from "../SzybkieAkcje";
import { useKatalog } from "../useKatalog";
import { serif } from "./fonty";
import { StopkaPropozycji, prefiksLokalu, type PropsGlownej } from "./wspolne";

const przelacznik = (aktywny: boolean) =>
  `underline decoration-2 underline-offset-4 transition ${aktywny ? "decoration-akcent text-tekst" : "decoration-tekst/20 hover:decoration-tekst"}`;

// 2 · Krem i typografia — jak magazyn kulinarny: szeryfowe nagłówki, numerowany spis kategorii, lista zamiast kart.
export default function P02Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  const k = useKatalog(lokale, miejscowosci);
  return (
    <div className="min-h-screen bg-krem">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-7 w-auto" />
        <Link href="/dla-lokali" className="text-sm font-extrabold underline decoration-2 underline-offset-4">
          Dla lokali
        </Link>
      </header>

      <main id="tresc" className="mx-auto max-w-6xl px-5 pb-6 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <h1 className={`${serif.className} isolate animate-wjazd text-[3.3rem] leading-[0.95] lg:text-[5.4rem]`}>
            Gdzie dziś zjemy w{" "}
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-x-[-0.12em] top-[0.5em] bottom-[0.06em] -z-10 origin-left animate-rozwin bg-akcent [animation-delay:350ms]"
              />
              Kraśniku?
            </span>
          </h1>
          <p className="mt-5 max-w-sm animate-wjazd font-semibold text-tekst-2 [animation-delay:120ms]">
            {lokale.length} {odmiana(lokale.length, ["lokal", "lokale", "lokali"])} z okolicy — godziny, telefon i dojazd.
          </p>

          <label className="mt-8 flex animate-wjazd items-center gap-3 border-b-[3px] border-tekst pb-2 [animation-delay:200ms]">
            <Search className="size-6 shrink-0" aria-hidden />
            <span className="sr-only">Szukaj lokalu</span>
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Czego szukasz?"
              className={`${serif.className} min-w-0 flex-1 bg-transparent text-2xl outline-none placeholder:text-tekst/40`}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-extrabold">
            <button type="button" onClick={k.uzyjLokalizacji} className={`flex items-center gap-1.5 ${przelacznik(k.zLokalizacja)}`}>
              <LocateFixed className="size-4" aria-hidden /> Blisko mnie
            </button>
            <button
              type="button"
              aria-pressed={k.tylkoOtwarte}
              disabled={!k.teraz}
              onClick={() => k.setTylkoOtwarte(!k.tylkoOtwarte)}
              className={przelacznik(k.tylkoOtwarte)}
            >
              Otwarte teraz
            </button>
            <button
              type="button"
              aria-pressed={k.tryb === "zamowie"}
              onClick={() => k.setTryb(k.tryb === "zamowie" ? "wszystko" : "zamowie")}
              className={przelacznik(k.tryb === "zamowie")}
            >
              Na wynos / dostawa
            </button>
          </div>
          {k.bladPozycji && <p className="mt-2 text-sm font-bold text-zamkniete">{k.bladPozycji}</p>}

          <ol aria-label="Kategorie" className="mt-8 grid grid-cols-2 gap-x-5 border-t-2 border-tekst lg:block">
            {k.kategorie.map((kat, i) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <li key={kat.id}>
                  <button
                    type="button"
                    aria-pressed={aktywna}
                    onClick={() => k.setKategoria(kat.id)}
                    className={`flex w-full items-baseline gap-3 border-b border-tekst/20 py-2.5 text-left transition-all lg:py-3 ${
                      aktywna ? "bg-akcent px-3" : "hover:bg-white/60 hover:px-3"
                    }`}
                  >
                    <span className="w-6 text-xs font-black text-tekst-2 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`${serif.className} flex-1 text-xl lg:text-2xl`}>{kat.nazwa}</span>
                    <span className="text-sm font-bold text-tekst-2">{k.ileWKategorii.get(kat.id)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <section id="wyniki" aria-label="Lokale" className="mt-12 lg:mt-0">
          <div className="flex items-baseline justify-between border-b-2 border-tekst pb-3">
            <h2 className={`${serif.className} text-3xl`} aria-live="polite">
              {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
            </h2>
            <span className="text-xs font-bold text-tekst-2">Najpierw promowane</span>
          </div>
          <ul>
            {k.wyniki.map((l) => (
              <Wiersz key={l.id} lokal={l} odleglosc={k.odleglosc(l)} prefiks={prefiksLokalu(nr)} />
            ))}
          </ul>
          {k.wyniki.length === 0 && (
            <p className={`${serif.className} py-12 text-center text-2xl`}>
              Nic nie znaleźliśmy.{" "}
              <button type="button" onClick={k.wyczysc} className="underline decoration-akcent decoration-4">
                Wyczyść filtry
              </button>
            </p>
          )}
        </section>
      </main>
      <StopkaPropozycji />
    </div>
  );
}

function Wiersz({ lokal, odleglosc, prefiks }: { lokal: Lokal; odleglosc?: string; prefiks: string }) {
  return (
    <li className="group pojawianie relative flex items-center gap-4 border-b border-tekst/20 py-4 transition hover:bg-white/50">
      <Miniatura lokal={lokal} className="h-20 w-24 shrink-0 rounded-xl sm:h-24 sm:w-32" sizes="128px" />
      <div className="min-w-0 flex-1">
        {lokal.promowany && <EtykietaPromo className="mb-1" />}
        <h3 className={`${serif.className} text-2xl leading-tight`}>
          <Link href={`${prefiks}${lokal.slug}`} className="outline-none after:absolute after:inset-0">
            {lokal.nazwa}
          </Link>
        </h3>
        <p className="truncate text-sm font-bold text-tekst-2">
          {opisLokalu(lokal)} · {pelnyAdres(lokal)}
          {odleglosc && ` · ${odleglosc}`}
        </p>
        <StatusOtwarcia godziny={lokal.godziny} className="mt-0.5 text-sm" />
      </div>
      <ArrowUpRight
        className="hidden size-6 shrink-0 transition group-hover:translate-x-1 group-hover:-translate-y-1 md:block"
        aria-hidden
      />
      <SzybkieAkcje lokal={lokal} />
    </li>
  );
}
