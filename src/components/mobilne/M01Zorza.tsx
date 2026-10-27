"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Leaf, MapPin, Navigation, Phone, Search, Truck } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import EtykietaPromo from "../EtykietaPromo";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { useLista } from "../menu/useLista";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { adresMapy } from "../szablony/wspolne";
import { TRYBY, useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import MenuZakladki from "./MenuZakladki";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 1 · Zorza — kolorowe plamy płyną pod szklanymi kartami (backdrop-filter), tytuł przelewa się gradientem.

function Zorza() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="m-zorza">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold transition active:scale-95 ${
    aktywny ? "bg-gradient-to-r from-[#ff6400] to-[#ff3d7f] text-white shadow-lg" : "m-szklo"
  }`;

export function GlownaM01({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const otwarte = lokale.filter(k.czyOtwarte).length;

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#fbf5ef]">
      <Zorza />
      <header className="m-szklo sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-5">
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
          {otwarte > 0 && (
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold text-otwarte">
              <span className="size-2 animate-pulse rounded-full bg-otwarte" /> {otwarte} otwartych
            </span>
          )}
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative pt-7">
          <SzamanM styl="zorza" className="pointer-events-none absolute top-3 -right-3 w-28 animate-wjazd [animation-delay:300ms]" />
          <p className="m-szklo inline-flex animate-wjazd items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold">
            <MapPin className="size-3.5 text-akcent-tekst" aria-hidden /> Kraśnik i okolice · {lokale.length} lokali
          </p>
          <h1 className="mt-4 animate-wjazd font-grotesk text-[3.4rem] leading-[0.92] font-bold tracking-tight [animation-delay:80ms]">
            Co dziś
            <br />
            <span className="m-gradient-tekst">szamiesz?</span>
          </h1>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="m-szklo mt-6 flex h-14 animate-wjazd items-center gap-2 rounded-full pr-1.5 pl-4 shadow-[0_12px_32px_rgba(255,100,0,0.18)] [animation-delay:140ms]"
          >
            <Search className="size-5 shrink-0 text-tekst-2" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Pizza, kebab, nazwa lokalu…"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-tekst-2"
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`flex size-11 shrink-0 items-center justify-center rounded-full transition ${
                k.tylkoWege ? "bg-[#15803d] text-white" : "bg-white/70 text-[#15803d]"
              }`}
            >
              <Leaf className="size-5" aria-hidden />
            </button>
            <button
              type="submit"
              aria-label="Pokaż wyniki"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6400] to-[#ff3d7f] text-white"
            >
              <ArrowRight className="size-5" aria-hidden />
            </button>
          </form>
          <div role="radiogroup" aria-label="Co chcesz zrobić" className="m-szklo mt-3 inline-flex gap-1 rounded-full p-1">
            {TRYBY.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={k.tryb === t.id}
                onClick={() => k.setTryb(t.id)}
                className={`rounded-full px-3 py-1.5 text-[13px] font-extrabold whitespace-nowrap transition ${
                  k.tryb === t.id ? "bg-white shadow" : "text-tekst-2"
                }`}
              >
                {t.nazwa}
              </button>
            ))}
          </div>
        </section>

        <BaneryReklamowe className="mt-6 [--promien-reklamy:1.75rem]" />

        <section aria-labelledby="kategorie" className="mt-7">
          <h2 id="kategorie" className="font-grotesk text-2xl font-bold">
            Na co masz ochotę?
          </h2>
          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pt-1 pb-2 [scrollbar-width:none]">
            {k.kategorie.map((kat) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button
                  key={kat.id}
                  type="button"
                  aria-pressed={aktywna}
                  onClick={() => k.setKategoria(kat.id)}
                  className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5"
                >
                  <span
                    className={`flex size-[4.5rem] items-center justify-center rounded-[1.6rem] transition duration-300 ${
                      aktywna
                        ? "scale-105 bg-gradient-to-br from-[#ff6400] to-[#ff3d7f] text-white shadow-[0_10px_24px_rgba(255,61,127,0.35)]"
                        : "m-szklo"
                    }`}
                  >
                    <IkonaTypu ikona={kat.ikona} className="size-8" />
                  </span>
                  <span className="text-xs font-extrabold whitespace-nowrap">{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        {k.doPozna.length > 0 && k.kategoria === "wszystko" && !k.szukaj && (
          <section aria-labelledby="pozno" className="mt-6">
            <h2 id="pozno" className="flex items-center gap-2 font-grotesk text-xl font-bold">
              <Clock className="size-5 text-akcent-tekst" aria-hidden /> Otwarte do późna
            </h2>
            <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
              {k.doPozna.map(({ lokal, doGodziny }) => (
                <Link
                  key={lokal.id}
                  href={lokalM(nr, lokal.slug)}
                  className="m-szklo flex w-60 shrink-0 items-center gap-3 rounded-[1.5rem] p-2 pr-4"
                >
                  <Miniatura lokal={lokal} className="size-16 shrink-0 rounded-[1.1rem]" dopisek={false} />
                  <span className="min-w-0">
                    <span className="block truncate font-extrabold">{lokal.nazwa}</span>
                    <span className="m-gradient-tekst block font-grotesk text-xl font-bold">do {doGodziny}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="wyniki" aria-label="Lokale" className="mt-6 scroll-mt-16">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} />
          <h2 className="mt-3 font-grotesk text-xl font-bold">
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {k.wyniki.map((l) => (
              <li key={l.id} className="pojawianie">
                <Link href={lokalM(nr, l.slug)} className="m-szklo group block rounded-[1.9rem] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                  <div className="relative">
                    <Miniatura lokal={l} className="h-40 rounded-[1.5rem]" sizes="(min-width: 640px) 320px, 100vw" />
                    <span className="absolute top-2.5 left-2.5 flex gap-1.5">
                      {l.promowany && <EtykietaPromo />}
                      {(l.cechy.wege || l.cechy.wegan) && (
                        <span className="flex size-7 items-center justify-center rounded-full bg-white/85 text-[#15803d] backdrop-blur">
                          <Leaf className="size-4" aria-label="wege" />
                        </span>
                      )}
                    </span>
                    {k.odleglosc(l) && (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-white/85 px-2.5 py-1 text-xs font-extrabold backdrop-blur">
                        {k.odleglosc(l)}
                      </span>
                    )}
                  </div>
                  <div className="px-2.5 pt-3 pb-2">
                    <h3 className="font-grotesk text-xl leading-tight font-bold">{l.nazwa}</h3>
                    <p className="truncate text-sm font-bold text-tekst-2">{opisLokalu(l)}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-sm">
                      <StatusOtwarcia godziny={l.godziny} />
                      <span className="truncate font-semibold text-tekst-2">{l.miejscowosc}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {!k.wyniki.length && (
            <div className="m-szklo mt-4 rounded-[1.75rem] p-6 text-center">
              <p className="font-extrabold">Nic tu nie ma.</p>
              <button type="button" onClick={k.wyczysc} className={`${chip(true)} mx-auto mt-3`}>
                Pokaż wszystko
              </button>
            </div>
          )}
        </section>
      </main>
      <StopkaM linki={linki} szaman="zorza" />
    </div>
  );
}

export function LokalM01({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const { liczba } = useLista(lokal.slug);
  const tydzien = parsujGodziny(lokal.godziny);
  const wege = lokal.cechy.wege || lokal.cechy.wegan;

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#fbf5ef]">
      <Zorza />
      <div className="relative h-[46vh] min-h-72 overflow-hidden rounded-b-[2.5rem]">
        <div className="m-najazd absolute inset-0">
          <Miniatura lokal={lokal} className="size-full" sizes="100vw" priorytet />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
        <Link
          href={adresM(nr)}
          aria-label="Wszystkie lokale"
          className="m-szklo absolute top-4 left-4 flex size-11 items-center justify-center rounded-full"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
      </div>

      <main id="tresc" className="mx-auto max-w-2xl px-4">
        <section className="m-szklo relative z-10 -mt-24 animate-wjazd rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          {lokal.promowany && <EtykietaPromo className="mb-2" />}
          <h1 className="font-grotesk text-[2.1rem] leading-[1.02] font-bold tracking-tight">{lokal.nazwa}</h1>
          <p className="mt-1 font-bold text-tekst-2">{opisLokalu(lokal)}</p>
          <StatusOtwarcia godziny={lokal.godziny} className="mt-2" />
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-tekst-2">
            <MapPin className="size-4 shrink-0 text-akcent-tekst" aria-hidden /> {pelnyAdres(lokal)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[13px] font-extrabold">
            {lokal.dostawa && (
              <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff6400] to-[#ff3d7f] px-3 py-1.5 text-white">
                <Truck className="size-4" aria-hidden /> Dowóz
              </span>
            )}
            {menu && (
              <a href="#menu" className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5">
                <BookOpen className="size-4 text-akcent-tekst" aria-hidden /> {menu.liczba} pozycji
              </a>
            )}
            {wege && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#15803d]/10 px-3 py-1.5 text-[#15803d]">
                <Leaf className="size-4" aria-hidden /> Wege
              </span>
            )}
          </div>
        </section>

        <div className="mt-6">
          {menu ? (
            <MenuZakladki
              menu={menu}
              dostawa={dostawa}
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              telefon={lokal.telefon}
              wyglad={{
                pasek: "m-szklo border-x-0 border-t-0",
                aktywna: "bg-gradient-to-r from-[#ff6400] to-[#ff3d7f] text-white shadow",
                nieaktywna: "bg-white/60",
                wiersz: "border-b border-white/80",
                miniatura: "rounded-[1.25rem] shadow-md",
              }}
            />
          ) : (
            <section className="m-szklo rounded-[1.75rem] p-5">
              <h2 className="font-grotesk text-2xl font-bold">Menu</h2>
              <p className="mt-1 text-sm font-semibold text-tekst-2">Tego menu jeszcze u nas nie ma — zapytaj w lokalu.</p>
            </section>
          )}
        </div>

        <section className="m-szklo mt-6 rounded-[1.75rem] p-5">
          <h2 className="flex items-center gap-2 font-grotesk text-xl font-bold">
            <Clock className="size-5 text-akcent-tekst" aria-hidden /> Godziny
          </h2>
          <div className="mt-2">
            {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="text-sm text-tekst-2">Brak informacji.</p>}
          </div>
        </section>
        <section className="m-szklo mt-4 overflow-hidden rounded-[1.75rem] p-2">
          <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="h-56 w-full rounded-[1.4rem] border-0" />
        </section>
      </main>
      <StopkaM linki={linki} szaman="zorza" className="pb-24" />

      {/* pływający pasek akcji; gdy na dole jest lista do zamówienia, podjeżdża nad nią */}
      <nav
        aria-label="Akcje"
        className={`m-szklo fixed inset-x-4 z-40 mx-auto flex max-w-md gap-2 rounded-full p-2 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-[bottom] duration-300 ${
          liczba ? "bottom-[6.25rem]" : "bottom-[max(1rem,env(safe-area-inset-bottom))]"
        }`}
      >
        {lokal.telefon && (
          <a
            href={linkTelefonu(lokal.telefon)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff6400] to-[#ff3d7f] font-black text-white"
          >
            <Phone className="size-5" aria-hidden /> Zadzwoń
          </a>
        )}
        <PrzyciskProwadz lokal={lokal} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-tekst font-black text-white">
          <Navigation className="size-5" aria-hidden /> Prowadź
        </PrzyciskProwadz>
      </nav>
    </div>
  );
}

