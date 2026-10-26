"use client";

import Link from "next/link";
import { LocateFixed, Search } from "lucide-react";
import type { Lokal } from "@/lib/lokale";
import { odmiana, opisLokalu } from "@/lib/nazwy";
import EtykietaPromo from "../EtykietaPromo";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import StatusOtwarcia from "../StatusOtwarcia";
import SzybkieAkcje from "../SzybkieAkcje";
import { TRYBY, useKatalog } from "../useKatalog";
import { useUlubione } from "../useUlubione";
import { PowlokaAplikacji, PrzyciskSerca } from "./P10Wspolne";
import { StopkaPropozycji, prefiksLokalu, type PropsGlownej } from "./wspolne";

function powitanie(teraz: Date | null) {
  if (!teraz) return "Cześć!";
  const h = teraz.getHours();
  return h < 11 ? "Dzień dobry!" : h < 18 ? "Smacznego dnia!" : "Dobry wieczór!";
}

// 10 · Aplikacja — jak aplikacja na telefon: powitanie, kafelki kategorii, ulubione, dolne menu.
export default function P10Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  const k = useKatalog(lokale, miejscowosci);
  const { ulubione } = useUlubione();
  const prefiks = prefiksLokalu(nr);
  const otwarte = k.teraz ? k.wyniki.filter(k.czyOtwarte) : [];
  const moje = lokale.filter((l) => ulubione.has(l.slug));

  return (
    <PowlokaAplikacji nr={nr}>
      <main id="tresc" className="mx-auto max-w-4xl px-5 pt-6 lg:pt-10">
        <p className="animate-wjazd font-extrabold text-tekst-2">{powitanie(k.teraz)}</p>
        <h1 className="animate-wjazd text-3xl font-black [animation-delay:60ms] lg:text-4xl">Co dziś szamiesz?</h1>

        <div className="mt-4 flex animate-wjazd items-center gap-2 [animation-delay:120ms]">
          <label className="flex flex-1 items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <Search className="size-5 text-tekst-2" aria-hidden />
            <span className="sr-only">Szukaj</span>
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Szukaj lokalu lub kuchni"
              className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
            />
          </label>
          <button
            type="button"
            onClick={k.uzyjLokalizacji}
            aria-label="Blisko mnie"
            aria-pressed={k.zLokalizacja}
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition ${k.zLokalizacja ? "bg-tekst text-white" : "bg-white"}`}
          >
            <LocateFixed className="size-5" aria-hidden />
          </button>
        </div>
        {k.bladPozycji && <p className="mt-2 text-sm font-bold text-zamkniete">{k.bladPozycji}</p>}

        <div role="radiogroup" aria-label="Co chcesz zrobić" className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-obrys p-1">
          {TRYBY.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={k.tryb === t.id}
              onClick={() => k.setTryb(t.id)}
              className={`rounded-xl py-2 text-sm font-extrabold transition ${k.tryb === t.id ? "bg-white shadow-sm" : ""}`}
            >
              {t.nazwa}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2.5 sm:grid-cols-5 lg:grid-cols-10" aria-label="Kategorie">
          {k.kategorie.slice(0, 10).map((kat, i) => {
            const aktywna = k.kategoria === kat.id;
            return (
              <button
                key={kat.id}
                type="button"
                aria-pressed={aktywna}
                onClick={() => k.setKategoria(kat.id)}
                className={`flex aspect-square animate-wjazd flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-extrabold transition active:scale-95 sm:text-xs ${
                  aktywna ? "bg-akcent" : "bg-white shadow-sm hover:bg-krem"
                }`}
                style={{ animationDelay: `${150 + i * 30}ms` }}
              >
                <IkonaTypu ikona={kat.ikona} className={`size-7 ${aktywna ? "" : "text-akcent-tekst"}`} />
                {kat.nazwa}
              </button>
            );
          })}
        </div>

        {otwarte.length > 0 && k.kategoria === "wszystko" && !k.szukaj && (
          <Rzad tytul="Otwarte teraz" lokale={otwarte} prefiks={prefiks} />
        )}

        <section id="ulubione" aria-labelledby="ulubione-tytul" className="mt-8 scroll-mt-6">
          <h2 id="ulubione-tytul" className="text-xl font-black">
            Ulubione
          </h2>
          {moje.length ? (
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {moje.map((l) => (
                <Karta key={l.id} lokal={l} prefiks={prefiks} odleglosc={k.odleglosc(l)} />
              ))}
            </ul>
          ) : (
            <p className="mt-2 rounded-2xl bg-white p-4 text-sm font-semibold text-tekst-2">
              Dotknij serduszka przy lokalu, a pojawi się tutaj. Zapamiętujemy je na tym telefonie, bez zakładania konta.
            </p>
          )}
        </section>

        <section id="wyniki" aria-label="Wszystkie lokale" className="mt-8">
          <h2 className="text-xl font-black" aria-live="polite">
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </main>
      <StopkaPropozycji className="[&>div]:max-w-4xl" />
    </PowlokaAplikacji>
  );
}

function Rzad({ tytul, lokale, prefiks }: { tytul: string; lokale: Lokal[]; prefiks: string }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-black">{tytul}</h2>
      <ul className="-mx-5 mt-3 flex snap-x gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none]">
        {lokale.map((l) => (
          <li key={l.id} className="group relative w-44 shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm">
            <Miniatura lokal={l} className="h-24" sizes="176px" />
            <div className="p-3">
              <Link href={`${prefiks}${l.slug}`} className="line-clamp-1 font-black outline-none after:absolute after:inset-0">
                {l.nazwa}
              </Link>
              <StatusOtwarcia godziny={l.godziny} className="text-xs" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Karta({ lokal, prefiks, odleglosc }: { lokal: Lokal; prefiks: string; odleglosc?: string }) {
  return (
    <li className="group pojawianie relative flex gap-3 rounded-2xl bg-white p-2.5 shadow-sm transition active:scale-[0.99]">
      <div className="relative shrink-0">
        <Miniatura lokal={lokal} className="size-24 rounded-xl" sizes="96px" />
        <PrzyciskSerca slug={lokal.slug} nazwa={lokal.nazwa} className="absolute -top-1 -left-1 !size-8 [&_svg]:!size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        {lokal.promowany && <EtykietaPromo className="mb-1 self-start scale-90 origin-left" />}
        <h3 className="truncate font-black">
          <Link href={`${prefiks}${lokal.slug}`} className="outline-none after:absolute after:inset-0">
            {lokal.nazwa}
          </Link>
        </h3>
        <p className="truncate text-xs font-bold text-tekst-2">
          {opisLokalu(lokal)}
          {odleglosc && ` · ${odleglosc}`}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2">
          <StatusOtwarcia godziny={lokal.godziny} className="min-w-0 text-xs" />
          <SzybkieAkcje lokal={lokal} />
        </div>
      </div>
    </li>
  );
}
