"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, LocateFixed, MapPin, Search } from "lucide-react";
import type { Lokal } from "@/lib/lokale";
import { KATEGORIE, odmiana, opisLokalu } from "@/lib/nazwy";
import EtykietaPromo from "../EtykietaPromo";
import Miniatura from "../Miniatura";
import StatusOtwarcia from "../StatusOtwarcia";
import SzybkieAkcje from "../SzybkieAkcje";
import { TWOJA_LOKALIZACJA, useKatalog, type Katalog } from "../useKatalog";
import { StopkaPropozycji, prefiksLokalu, type PropsGlownej } from "./wspolne";

const pasuje = (id: string) => KATEGORIE.find((k) => k.id === id)!.pasuje;

const RZEDY: { tytul: string; filtr: (l: Lokal, k: Katalog) => boolean }[] = [
  { tytul: "Otwarte teraz", filtr: (l, k) => k.czyOtwarte(l) },
  { tytul: "Pizza", filtr: pasuje("pizza") },
  { tytul: "Kebab i fast food", filtr: (l) => pasuje("kebab")(l) || pasuje("fastfood")(l) },
  { tytul: "Burgery", filtr: pasuje("burgery") },
  { tytul: "Kawa i coś słodkiego", filtr: (l) => pasuje("kawiarnie")(l) || pasuje("lody")(l) },
  { tytul: "Restauracje", filtr: pasuje("restauracje") },
  { tytul: "Puby i bary", filtr: pasuje("puby") },
];

// 6 · Karuzele — jak Wolt: przewijane rzędy tematyczne; przy wyszukiwaniu zwykła siatka wyników.
export default function P06Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  const k = useKatalog(lokale, miejscowosci);
  const prefiks = prefiksLokalu(nr);
  const plasko = k.szukaj.trim() !== "" || k.kategoria !== "wszystko";

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-7 w-auto" />
        <label className="ml-auto flex h-10 min-w-0 items-center gap-1.5 rounded-full bg-tlo pr-1 pl-3 text-sm font-extrabold">
          <MapPin className="size-4 shrink-0 text-akcent-tekst" aria-hidden />
          <span className="sr-only">Miejscowość</span>
          <select
            value={k.pozycja && !k.zLokalizacja ? k.pozycja.opis : ""}
            onChange={(e) => k.wybierzMiejscowosc(e.target.value)}
            className="min-w-0 max-w-36 appearance-none truncate bg-transparent outline-none sm:max-w-none"
          >
            <option value="">{k.zLokalizacja ? TWOJA_LOKALIZACJA : "Kraśnik i okolice"}</option>
            {miejscowosci.map((m) => (
              <option key={m.nazwa} value={m.nazwa}>
                {m.nazwa}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={k.uzyjLokalizacji}
          aria-label="Blisko mnie"
          className={`flex size-10 shrink-0 items-center justify-center rounded-full transition ${k.zLokalizacja ? "bg-tekst text-white" : "bg-tlo hover:bg-krem"}`}
        >
          <LocateFixed className="size-5" aria-hidden />
        </button>
        <Link href="/dla-lokali" className="hidden text-sm font-extrabold hover:text-akcent-tekst sm:block">
          Dla lokali
        </Link>
      </header>

      <div className="sticky top-0 z-30 bg-white/90 py-2 backdrop-blur">
        <label className="mx-auto flex max-w-6xl items-center gap-2 px-5">
          <span className="flex w-full items-center gap-2 rounded-full bg-tlo px-4 py-3 transition focus-within:ring-2 focus-within:ring-akcent">
            <Search className="size-5 text-tekst-2" aria-hidden />
            <span className="sr-only">Szukaj</span>
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Szukaj lokali i kuchni"
              className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
            />
          </span>
        </label>
      </div>

      <main id="tresc" className="mx-auto max-w-6xl px-5">
        {k.bladPozycji && <p className="mt-2 text-sm font-bold text-zamkniete">{k.bladPozycji}</p>}

        <section className="relative mt-3 animate-wjazd overflow-hidden rounded-[2rem] bg-akcent p-6 lg:p-10">
          <Image src="/znak.png" alt="" width={220} height={220} className="pointer-events-none absolute -right-6 -bottom-10 w-40 rotate-12 animate-unoszenie lg:right-10 lg:w-56" />
          <p className="relative text-sm font-black tracking-wide uppercase">Kraśnik i okolica</p>
          <h1 className="relative mt-1 max-w-md text-3xl leading-tight font-black lg:text-5xl">Wszystko, co dobre do jedzenia, w jednym miejscu</h1>
        </section>

        <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
          {k.kategorie.map((kat) => (
            <button
              key={kat.id}
              type="button"
              aria-pressed={k.kategoria === kat.id}
              onClick={() => k.setKategoria(kat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${k.kategoria === kat.id ? "bg-tekst text-white" : "bg-tlo hover:bg-krem"}`}
            >
              {kat.nazwa}
            </button>
          ))}
        </div>

        {plasko ? (
          <section id="wyniki" aria-label="Wyniki" className="mt-6">
            <h2 className="text-xl font-black" aria-live="polite">
              {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {k.wyniki.map((l) => (
                <Karta key={l.id} lokal={l} prefiks={prefiks} odleglosc={k.odleglosc(l)} />
              ))}
            </ul>
            {k.wyniki.length === 0 && (
              <p className="py-10 text-center font-semibold text-tekst-2">
                Nic nie znaleźliśmy.{" "}
                <button type="button" onClick={k.wyczysc} className="font-black text-akcent-tekst underline">
                  Wyczyść
                </button>
              </p>
            )}
          </section>
        ) : (
          RZEDY.map((r) => {
            const lista = k.wyniki.filter((l) => r.filtr(l, k));
            return lista.length ? <Rzad key={r.tytul} tytul={r.tytul} lokale={lista} prefiks={prefiks} odleglosc={k.odleglosc} /> : null;
          })
        )}
      </main>
      <StopkaPropozycji className="mt-10" />
    </div>
  );
}

function Rzad(props: { tytul: string; lokale: Lokal[]; prefiks: string; odleglosc: (l: Lokal) => string | undefined }) {
  const przewijak = useRef<HTMLUListElement>(null);
  const przewin = (kierunek: number) => {
    const el = przewijak.current;
    el?.scrollBy({ left: kierunek * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const strzalka = "flex size-10 items-center justify-center rounded-full bg-tlo transition hover:bg-krem";
  return (
    <section className="mt-9">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black lg:text-2xl">
          {props.tytul} <span className="text-base font-bold text-tekst-2">{props.lokale.length}</span>
        </h2>
        <div className="hidden gap-2 md:flex">
          <button type="button" onClick={() => przewin(-1)} aria-label={`${props.tytul}: wstecz`} className={strzalka}>
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={() => przewin(1)} aria-label={`${props.tytul}: dalej`} className={strzalka}>
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
      <ul ref={przewijak} className="-mx-5 mt-3 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
        {props.lokale.map((l) => (
          <Karta key={l.id} lokal={l} prefiks={props.prefiks} odleglosc={props.odleglosc(l)} wRzedzie />
        ))}
      </ul>
    </section>
  );
}

function Karta({ lokal, prefiks, odleglosc, wRzedzie = false }: { lokal: Lokal; prefiks: string; odleglosc?: string; wRzedzie?: boolean }) {
  return (
    <li className={`group pojawianie relative ${wRzedzie ? "w-[16.5rem] shrink-0 snap-start" : ""}`}>
      <div className="relative">
        <Miniatura lokal={lokal} className="h-40 rounded-2xl" sizes="280px" />
        {lokal.promowany && <EtykietaPromo className="absolute top-2 left-2" />}
        {odleglosc && <span className="absolute top-2 right-2 rounded-full bg-white px-2 py-0.5 text-xs font-extrabold">{odleglosc}</span>}
      </div>
      <h3 className="mt-2 truncate text-[17px] font-black">
        <Link href={`${prefiks}${lokal.slug}`} className="outline-none after:absolute after:inset-0">
          {lokal.nazwa}
        </Link>
      </h3>
      <p className="truncate text-sm font-semibold text-tekst-2">{opisLokalu(lokal)}</p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <StatusOtwarcia godziny={lokal.godziny} className="min-w-0 text-xs" />
        <SzybkieAkcje lokal={lokal} />
      </div>
    </li>
  );
}
