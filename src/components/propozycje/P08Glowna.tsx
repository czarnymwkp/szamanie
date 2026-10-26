"use client";

import Image from "next/image";
import Link from "next/link";
import { LocateFixed, Navigation, Phone, PhoneOff, Search } from "lucide-react";
import type { Lokal } from "@/lib/lokale";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import { useKatalog } from "../useKatalog";
import { brutal } from "./fonty";
import { ramka, ramkaHover } from "./p08styl";
import { StopkaPropozycji, prefiksLokalu, type PropsGlownej } from "./wspolne";

const TASMA = "PIZZA ✦ KEBAB ✦ BURGERY ✦ KAWA ✦ LODY ✦ OBIADY ✦ PIWO ✦ ";

// 8 · Neo-brutalizm — grube ramki, twarde cienie, naklejki, przewijana taśma.
export default function P08Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  const k = useKatalog(lokale, miejscowosci);
  return (
    <div className="min-h-screen bg-krem">
      <header className="border-b-[3px] border-tekst bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-7 w-auto" />
          <Link href="/dla-lokali" className={`${brutal.className} ${ramka} ${ramkaHover} bg-akcent px-4 py-1.5 text-sm uppercase`}>
            Dla lokali
          </Link>
        </div>
      </header>

      <main id="tresc">
        <section className="mx-auto max-w-6xl px-5 pt-10 pb-8 lg:pt-16">
          <h1 className={`${brutal.className} relative animate-wjazd text-7xl leading-[0.85] uppercase lg:text-[9rem]`}>
            Głodny?
            <span className={`${ramka} absolute -top-2 right-0 rotate-6 bg-akcent px-3 py-1 text-base sm:text-xl lg:right-24 lg:text-3xl`}>
              Kraśnik!
            </span>
          </h1>
          <p className="mt-5 max-w-lg animate-wjazd text-lg font-extrabold [animation-delay:100ms]">
            {lokale.length} {odmiana(lokale.length, ["lokal", "lokale", "lokali"])} z okolicy. Bez ściemy: godziny, telefon,
            dojazd.
          </p>
          <label className={`${ramka} mt-6 flex max-w-2xl animate-wjazd items-center gap-3 bg-white px-4 py-3 transition focus-within:shadow-[8px_8px_0_#ff6400] [animation-delay:160ms]`}>
            <Search className="size-6 shrink-0" aria-hidden />
            <span className="sr-only">Szukaj lokalu</span>
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="WPISZ: PIZZA, KEBAB…"
              className="min-w-0 flex-1 bg-transparent text-lg font-extrabold uppercase outline-none placeholder:text-tekst/40"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={k.uzyjLokalizacji} className={`${ramka} ${ramkaHover} flex items-center gap-2 px-3 py-1.5 font-black ${k.zLokalizacja ? "bg-tekst text-white" : "bg-white"}`}>
              <LocateFixed className="size-4" aria-hidden /> BLISKO MNIE
            </button>
            <button
              type="button"
              aria-pressed={k.tylkoOtwarte}
              disabled={!k.teraz}
              onClick={() => k.setTylkoOtwarte(!k.tylkoOtwarte)}
              className={`${ramka} ${ramkaHover} px-3 py-1.5 font-black ${k.tylkoOtwarte ? "bg-tekst text-white" : "bg-white"}`}
            >
              OTWARTE TERAZ
            </button>
          </div>
          {k.bladPozycji && <p className="mt-2 font-bold text-zamkniete">{k.bladPozycji}</p>}
        </section>

        <div className="overflow-hidden border-y-[3px] border-tekst bg-tekst py-2 text-akcent" aria-hidden>
          <div className={`${brutal.className} flex w-max animate-tasma text-2xl whitespace-nowrap`}>
            <span>{TASMA.repeat(4)}</span>
            <span>{TASMA.repeat(4)}</span>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5">
          <div className="mt-8 flex flex-wrap gap-3" aria-label="Kategorie">
            {k.kategorie.map((kat) => (
              <button
                key={kat.id}
                type="button"
                aria-pressed={k.kategoria === kat.id}
                onClick={() => k.setKategoria(kat.id)}
                className={`${ramka} ${ramkaHover} flex items-center gap-2 px-3 py-2 font-black uppercase ${k.kategoria === kat.id ? "bg-akcent" : "bg-white"}`}
              >
                <IkonaTypu ikona={kat.ikona} className="size-5" /> {kat.nazwa}
              </button>
            ))}
          </div>

          <section id="wyniki" aria-label="Lokale" className="mt-10">
            <h2 className={`${brutal.className} text-3xl uppercase`} aria-live="polite">
              {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {k.wyniki.map((l) => (
                <Karta key={l.id} lokal={l} prefiks={prefiksLokalu(nr)} odleglosc={k.odleglosc(l)} />
              ))}
            </ul>
            {k.wyniki.length === 0 && (
              <p className="py-10 text-center text-xl font-black uppercase">
                Pusto.{" "}
                <button type="button" onClick={k.wyczysc} className="underline decoration-akcent decoration-4">
                  Wyczyść filtry
                </button>
              </p>
            )}
          </section>
        </div>
      </main>
      <StopkaPropozycji className="mt-10" />
    </div>
  );
}

function Karta({ lokal, prefiks, odleglosc }: { lokal: Lokal; prefiks: string; odleglosc?: string }) {
  const kwadrat = `${ramka} ${ramkaHover} flex size-11 items-center justify-center`;
  return (
    <li className={`group pojawianie relative flex flex-col bg-white ${ramka} transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0_#111]`}>
      <Miniatura lokal={lokal} className="h-40 border-b-[3px] border-tekst" sizes="(min-width: 1024px) 380px, 100vw" />
      {lokal.promowany && (
        <span className={`${brutal.className} ${ramka} absolute -top-3 -right-3 rotate-6 bg-akcent px-2 py-0.5 text-sm uppercase`}>
          Promowane
        </span>
      )}
      <div className="flex flex-1 items-end gap-3 p-4">
        <div className="min-w-0 flex-1">
          <h3 className={`${brutal.className} text-xl leading-tight uppercase`}>
            <Link href={`${prefiks}${lokal.slug}`} className="outline-none after:absolute after:inset-0">
              {lokal.nazwa}
            </Link>
          </h3>
          <p className="truncate text-sm font-bold">{opisLokalu(lokal)}</p>
          <p className="truncate text-sm font-semibold text-tekst-2">
            {pelnyAdres(lokal)}
            {odleglosc && ` · ${odleglosc}`}
          </p>
          <StatusOtwarcia godziny={lokal.godziny} className="mt-1 text-sm" />
        </div>
        <div className="relative z-10 flex shrink-0 gap-2">
          <PrzyciskProwadz lokal={lokal} aria-label={`Prowadź do: ${lokal.nazwa}`} className={`${kwadrat} bg-white`}>
            <Navigation className="size-5" aria-hidden />
          </PrzyciskProwadz>
          {lokal.telefon ? (
            <a href={linkTelefonu(lokal.telefon)} aria-label={`Zadzwoń: ${lokal.nazwa}`} className={`${kwadrat} bg-akcent`}>
              <Phone className="size-5" aria-hidden />
            </a>
          ) : (
            <span role="img" aria-label="Brak numeru telefonu" title="Brak numeru telefonu" className="flex size-11 items-center justify-center border-[3px] border-tekst/30 text-tekst/30">
              <PhoneOff className="size-5" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
