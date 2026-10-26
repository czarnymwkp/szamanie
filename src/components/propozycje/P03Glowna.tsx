"use client";

import Image from "next/image";
import Link from "next/link";
import { LocateFixed, MoonStar, Search } from "lucide-react";
import { formatGodz, parsujGodziny, statusOtwarcia } from "@/lib/godziny";
import type { Lokal } from "@/lib/lokale";
import { odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import EtykietaPromo from "../EtykietaPromo";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import StatusOtwarcia from "../StatusOtwarcia";
import SzybkieAkcje from "../SzybkieAkcje";
import { TRYBY, useKatalog } from "../useKatalog";
import { grotesk } from "./fonty";
import { StopkaPropozycji, prefiksLokalu, type PropsGlownej } from "./wspolne";

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition disabled:opacity-40 ${
    aktywny ? "bg-akcent text-tekst" : "bg-white/[0.07] text-white hover:bg-white/15"
  }`;

/** Lokale otwarte teraz i czynne co najmniej do 23:00 (albo po północy). */
function doPozna(lokale: Lokal[], teraz: Date | null) {
  if (!teraz) return [];
  return lokale.flatMap((l) => {
    const tydzien = parsujGodziny(l.godziny);
    const s = tydzien && statusOtwarcia(tydzien, teraz);
    if (!s || !s.otwarte) return [];
    const doMin = s.doMin > 24 * 60 ? s.doMin - 24 * 60 : s.doMin;
    return doMin >= 23 * 60 || doMin <= 6 * 60 ? [{ lokal: l, doGodziny: formatGodz(s.doMin) }] : [];
  });
}

// 3 · Tryb nocny — ciemne tło, pomarańczowe akcenty, sekcja „Otwarte do późna”.
export default function P03Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  const k = useKatalog(lokale, miejscowosci);
  const pozne = doPozna(lokale, k.teraz);
  const prefiks = prefiksLokalu(nr);
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Image src="/logo-ciemne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-7 w-auto" />
        <Link href="/dla-lokali" className="rounded-full border border-white/30 px-4 py-1.5 text-sm font-bold transition hover:bg-white hover:text-tekst">
          Dla lokali
        </Link>
      </header>

      <main id="tresc" className="mx-auto max-w-6xl px-5">
        <section className="relative py-10 lg:py-16">
          <div aria-hidden className="pointer-events-none absolute -top-20 right-0 size-72 rounded-full bg-akcent/25 blur-3xl lg:size-[28rem]" />
          <h1 className={`${grotesk.className} relative animate-wjazd text-6xl leading-[0.9] font-bold tracking-tight lg:text-8xl`}>
            Co dziś
            <br />
            <span className="text-akcent">szamiesz?</span>
          </h1>
          <p className="relative mt-4 max-w-md animate-wjazd text-white/70 [animation-delay:90ms]">
            {lokale.length} {odmiana(lokale.length, ["lokal", "lokale", "lokali"])} z Kraśnika i okolic, od śniadania po
            późny kebab.
          </p>
          <div className="relative mt-6 flex max-w-2xl animate-wjazd flex-col gap-3 [animation-delay:160ms]">
            <div role="radiogroup" aria-label="Co chcesz zrobić" className="flex w-fit gap-1 rounded-full bg-white/[0.07] p-1">
              {TRYBY.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={k.tryb === t.id}
                  onClick={() => k.setTryb(t.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition ${k.tryb === t.id ? "bg-white text-tekst" : "text-white/80 hover:text-white"}`}
                >
                  {t.nazwa}
                </button>
              ))}
            </div>
            <label className="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 transition focus-within:border-akcent focus-within:shadow-[0_0_0_4px_rgba(255,100,0,0.25)]">
              <Search className="size-5 text-white/50" aria-hidden />
              <span className="sr-only">Szukaj lokalu</span>
              <input
                type="search"
                value={k.szukaj}
                onChange={(e) => k.setSzukaj(e.target.value)}
                placeholder="Pizza, kebab, nazwa lokalu…"
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={k.uzyjLokalizacji} className={chip(k.zLokalizacja)}>
                <LocateFixed className="size-4" aria-hidden /> Blisko mnie
              </button>
              <button
                type="button"
                aria-pressed={k.tylkoOtwarte}
                disabled={!k.teraz}
                onClick={() => k.setTylkoOtwarte(!k.tylkoOtwarte)}
                className={chip(k.tylkoOtwarte)}
              >
                Otwarte teraz
              </button>
            </div>
            {k.bladPozycji && <p className="text-sm font-bold text-[#fca5a5]">{k.bladPozycji}</p>}
          </div>
        </section>

        <section aria-label="Kategorie" className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-10">
          {k.kategorie.map((kat, i) => {
            const aktywna = k.kategoria === kat.id;
            return (
              <button
                key={kat.id}
                type="button"
                aria-pressed={aktywna}
                onClick={() => k.setKategoria(kat.id)}
                className={`group flex aspect-square animate-wjazd flex-col items-center justify-center gap-1.5 rounded-2xl border text-xs font-bold transition ${
                  aktywna
                    ? "border-akcent bg-akcent text-tekst"
                    : "border-white/5 bg-[#171717] hover:border-akcent/60 hover:bg-[#1f1f1f]"
                }`}
                style={{ animationDelay: `${200 + i * 35}ms` }}
              >
                <IkonaTypu ikona={kat.ikona} className={`size-7 transition group-hover:scale-110 ${aktywna ? "" : "text-akcent"}`} />
                {kat.nazwa}
              </button>
            );
          })}
        </section>

        {pozne.length > 0 && k.kategoria === "wszystko" && !k.szukaj && (
          <section aria-labelledby="do-pozna" className="mt-12">
            <h2 id="do-pozna" className={`${grotesk.className} flex items-center gap-2 text-2xl font-bold`}>
              <MoonStar className="size-6 text-akcent" aria-hidden /> Otwarte do późna
            </h2>
            <ul className="-mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
              {pozne.map(({ lokal, doGodziny }) => (
                <li key={lokal.id} className="group pojawianie relative w-60 shrink-0 snap-start overflow-hidden rounded-2xl bg-[#161616]">
                  <Miniatura lokal={lokal} className="h-32" sizes="240px" />
                  <div className="p-4">
                    <Link href={`${prefiks}${lokal.slug}`} className="font-bold outline-none after:absolute after:inset-0">
                      {lokal.nazwa}
                    </Link>
                    <p className={`${grotesk.className} mt-1 text-3xl font-bold text-akcent`}>do {doGodziny}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="wyniki" aria-label="Lokale" className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className={`${grotesk.className} text-2xl font-bold`} aria-live="polite">
              {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
            </h2>
            <span className="text-xs font-bold text-white/50">Najpierw promowane</span>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {k.wyniki.map((l) => (
              <li key={l.id} className="group pojawianie relative flex overflow-hidden rounded-2xl border border-white/5 bg-[#161616] transition hover:border-white/15">
                <Miniatura lokal={l} className="w-28 shrink-0 sm:w-36" sizes="144px" />
                <div className="flex min-w-0 flex-1 items-end gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    {l.promowany && <EtykietaPromo className="mb-1.5 !bg-akcent !text-tekst" />}
                    <h3 className="truncate text-lg font-bold">
                      <Link href={`${prefiks}${l.slug}`} className="outline-none after:absolute after:inset-0">
                        {l.nazwa}
                      </Link>
                    </h3>
                    <p className="truncate text-sm text-white/60">{opisLokalu(l)}</p>
                    <p className="truncate text-sm text-white/60">
                      {pelnyAdres(l)}
                      {k.odleglosc(l) && ` · ${k.odleglosc(l)}`}
                    </p>
                    <StatusOtwarcia godziny={l.godziny} ciemne className="mt-1 text-sm" />
                  </div>
                  <SzybkieAkcje lokal={l} ciemne />
                </div>
              </li>
            ))}
          </ul>
          {k.wyniki.length === 0 && (
            <p className="py-12 text-center text-white/60">
              Nic nie znaleźliśmy.{" "}
              <button type="button" onClick={k.wyczysc} className="font-bold text-akcent underline">
                Wyczyść filtry
              </button>
            </p>
          )}
        </section>
      </main>
      <StopkaPropozycji ciemna className="mt-10" />
    </div>
  );
}
