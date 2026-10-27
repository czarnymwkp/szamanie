"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Leaf, Navigation, Phone, Search } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, nazwaKuchni, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import MenuLokalu from "../menu/MenuLokalu";
import { useLista } from "../menu/useLista";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { adresMapy } from "../szablony/wspolne";
import { useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import { plakat } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 4 · Wielkie litery — typografia jak na plakacie: ogromne obrysowane słowa suną w tle w przeciwne strony,
// tytuł wskakuje literka po literce, kategorie to spis treści, lokale ponumerowane jak w magazynie.

const PLAKAT = {
  "--color-tlo": "#f1ede6",
  "--color-krem": "#e6e0d6",
  "--color-tekst": "#0d0d0d",
  "--color-tekst-2": "#55504a",
  "--color-obrys": "#d9d2c6",
  "--color-obrys-2": "#0d0d0d",
  "--color-akcent": "#ff4d00",
  "--color-akcent-tekst": "#c23a00",
  // nagłówki menu i sekcji krojem plakatu
  "--font-space-grotesk": plakat.style.fontFamily,
} as CSSProperties;

function TloLitery({ slowa }: { slowa: string[] }) {
  const tekst = `${slowa.join(" • ")} • `;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className={`m-tasmy ${plakat.className}`}>
        {["", "wstecz pelna", "", "wstecz"].map((klasa, i) => (
          <div key={i} className={`m-tasma-tekst ${klasa}`}>
            <span className="pr-[0.3em]">{tekst.repeat(2)}</span>
            <span className="pr-[0.3em]">{tekst.repeat(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Litery({ tekst, opoznienie = 0 }: { tekst: string; opoznienie?: number }) {
  return (
    <>
      {[...tekst].map((z, i) =>
        z === " " ? (
          <span key={i} className="inline-block w-[0.28em]" />
        ) : (
          <span key={i} className="m-litera" style={{ animationDelay: `${opoznienie + i * 45}ms` }}>
            {z}
          </span>
        ),
      )}
    </>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 border-2 border-tekst px-4 text-sm font-black uppercase transition ${
    aktywny ? "bg-tekst text-tlo" : "bg-tlo"
  }`;

export function GlownaM04({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const otwarte = lokale.filter(k.czyOtwarte).length;
  const pasek = [
    `Otwarte teraz: ${otwarte}`,
    ...k.doPozna.slice(0, 5).map((p) => `${p.lokal.nazwa} do ${p.doGodziny}`),
    `${lokale.length} lokali w okolicy`,
    "Dodaj menu swojego lokalu — szamanie.pl",
  ].join("   ✦   ");

  return (
    <div style={PLAKAT} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloLitery slowa={["PIZZA", "KEBAB", "BURGERY", "KAWA", "PIEROGI", "LODY"]} />
      <div className="overflow-hidden bg-tekst py-1.5 text-tlo">
        <div className={`${plakat.className} flex w-max animate-tasma text-sm tracking-wide uppercase`}>
          <span className="pr-12">{pasek}</span>
          <span className="pr-12">{pasek}</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b-2 border-tekst bg-tlo">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
          <Link href="/dla-lokali" className={`${plakat.className} ml-auto bg-akcent px-3 py-1 text-sm uppercase`}>
            Dla lokali
          </Link>
        </div>
      </header>

      <main id="tresc" className="relative mx-auto max-w-2xl px-5">
        <SzamanM styl="plakat" className="pointer-events-none absolute top-2 right-2 w-24 animate-wjazd [animation-delay:700ms]" />
        <h1 className={`${plakat.className} pt-6 text-[19vw] leading-[0.86] uppercase sm:text-8xl`}>
          <Litery tekst="Co dziś" />
          <br />
          <span className="text-akcent">
            <Litery tekst="szamiesz?" opoznienie={300} />
          </span>
        </h1>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-6 flex h-16 animate-wjazd items-stretch border-[3px] border-tekst bg-tekst [animation-delay:600ms]"
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 px-4 text-tlo">
            <Search className="size-6 shrink-0" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="SZUKAJ…"
              aria-label="Szukaj lokalu"
              className={`${plakat.className} min-w-0 flex-1 bg-transparent text-2xl uppercase outline-none placeholder:text-tlo/50`}
            />
          </label>
          <button
            type="button"
            onClick={() => k.setTylkoWege(!k.tylkoWege)}
            aria-pressed={k.tylkoWege}
            aria-label="Tylko wege"
            className={`flex w-14 items-center justify-center border-l-[3px] border-tekst ${k.tylkoWege ? "bg-[#22c55e]" : "bg-tlo"}`}
          >
            <Leaf className="size-6" aria-hidden />
          </button>
          <button type="submit" aria-label="Pokaż wyniki" className="flex w-16 items-center justify-center bg-akcent">
            <ArrowRight className="size-7" aria-hidden />
          </button>
        </form>

        <BaneryReklamowe className="mt-6 [--promien-reklamy:0px]" />

        <section aria-labelledby="kategorie" className="mt-8">
          <h2 id="kategorie" className={`${plakat.className} text-4xl uppercase`}>
            Na co masz ochotę?
          </h2>
          <ol className="mt-3 grid grid-cols-2 border-t-2 border-tekst">
            {k.kategorie.map((kat, i) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <li key={kat.id} className={`border-b-2 border-tekst ${i % 2 ? "" : "border-r-2"}`}>
                  <button
                    type="button"
                    aria-pressed={aktywna}
                    onClick={() => k.setKategoria(kat.id)}
                    className={`flex w-full items-baseline gap-2 px-2 py-2 text-left transition ${aktywna ? "bg-akcent" : "hover:bg-krem"}`}
                  >
                    <span className={`${plakat.className} min-w-0 flex-1 truncate text-2xl uppercase`}>{kat.nazwa}</span>
                    <span className="text-sm font-black tabular-nums">{k.ileWKategorii.get(kat.id)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-8 scroll-mt-16">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="bg-[#22c55e]" />
          <h2 className={`${plakat.className} mt-4 text-5xl uppercase`}>
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ol className="mt-3 border-t-[3px] border-tekst">
            {k.wyniki.map((l, i) => (
              <li key={l.id} className="pojawianie border-b-2 border-tekst">
                <Link href={lokalM(nr, l.slug)} className="group flex items-center gap-3 py-4">
                  <span
                    className={`${plakat.className} w-12 shrink-0 text-4xl text-transparent [-webkit-text-stroke:1.5px_#0d0d0d] group-hover:text-akcent`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`${plakat.className} block text-[1.7rem] leading-none uppercase`}>{l.nazwa}</span>
                    <span className="mt-1 block truncate text-sm font-bold text-tekst-2">
                      {opisLokalu(l)} · {l.miejscowosc}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-sm">
                      <StatusOtwarcia godziny={l.godziny} />
                      {(l.cechy.wege || l.cechy.wegan) && <Leaf className="size-4 text-[#15803d]" aria-label="wege" />}
                    </span>
                  </span>
                  <Miniatura lokal={l} className="size-20 shrink-0 border-2 border-tekst" dopisek={false} />
                </Link>
              </li>
            ))}
          </ol>
          {!k.wyniki.length && (
            <button type="button" onClick={k.wyczysc} className={`${plakat.className} mt-6 w-full bg-tekst py-4 text-2xl text-tlo uppercase`}>
              Nic nie ma — pokaż wszystko
            </button>
          )}
        </section>
      </main>
      <StopkaM linki={linki} szaman="plakat" />
    </div>
  );
}

export function LokalM04({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const { liczba } = useLista(lokal.slug);
  const tydzien = parsujGodziny(lokal.godziny);
  const naglowek = (numer: string, tekst: string) => (
    <h2 className={`${plakat.className} flex items-baseline gap-3 border-b-[3px] border-tekst pb-1 text-5xl uppercase`}>
      <span className="text-2xl text-akcent">{numer}</span> {tekst}
    </h2>
  );

  return (
    <div style={PLAKAT} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloLitery slowa={[lokal.nazwa.toUpperCase(), ...lokal.kuchnie.slice(0, 3).map((x) => nazwaKuchni(x).toUpperCase())]} />
      <div className="flex items-center border-b-2 border-tekst bg-tlo px-5 py-3">
        <Link href={adresM(nr)} className={`${plakat.className} flex items-center gap-2 text-lg uppercase`}>
          <ArrowLeft className="size-5" aria-hidden /> Wszystkie
        </Link>
      </div>
      <div className="overflow-hidden border-b-[3px] border-tekst bg-akcent py-2">
        <div className={`${plakat.className} flex w-max animate-tasma text-7xl leading-none uppercase`}>
          <span className="pr-8">{`${lokal.nazwa} ✦ `.repeat(4)}</span>
          <span className="pr-8">{`${lokal.nazwa} ✦ `.repeat(4)}</span>
        </div>
      </div>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-4">
          <div className="min-w-0">
            <h1
              className={`${plakat.className} leading-[0.9] uppercase ${
                lokal.nazwa.length > 14 ? "text-[2.3rem]" : lokal.nazwa.length > 9 ? "text-[2.8rem]" : "text-[3.3rem]"
              }`}
            >
              {lokal.nazwa.replace(/s*&s*/g, " & ")}
            </h1>
            <p className="mt-2 font-bold text-tekst-2">{opisLokalu(lokal)}</p>
          </div>
          <Miniatura lokal={lokal} className="h-36 w-28 rotate-3 border-[3px] border-tekst shadow-[6px_6px_0_#0d0d0d]" sizes="120px" priorytet />
        </div>
        <div className="mt-4 border-y-2 border-tekst py-2 text-sm">
          <StatusOtwarcia godziny={lokal.godziny} />
          <p className="mt-1 font-bold">{pelnyAdres(lokal)}</p>
        </div>

        <section className="mt-10">
          {naglowek("01", "Menu")}
          {menu ? (
            // nagłówek „01 Menu” zastępuje własny tytuł menu
            <div className="[&_#menu-tytul]:sr-only">
              <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} numerowane belki />
            </div>
          ) : (
            <p className="mt-4 text-lg font-bold">Menu jeszcze nie ma. Dzwoń i pytaj.</p>
          )}
        </section>
        <section className="mt-12">
          {naglowek("02", "Godziny")}
          <div className="mt-3 text-base">
            {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="font-bold">Brak informacji.</p>}
          </div>
        </section>
        <section className="mt-12">
          {naglowek("03", "Dojazd")}
          <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="mt-4 h-60 w-full border-[3px] border-tekst grayscale" />
        </section>
      </main>
      <StopkaM linki={linki} szaman="plakat" className="pb-24" />

      <nav
        aria-label="Akcje"
        className={`fixed inset-x-0 z-40 grid grid-cols-2 border-t-[3px] border-tekst transition-[bottom] duration-300 ${liczba ? "bottom-[5.5rem]" : "bottom-0"}`}
      >
        {lokal.telefon ? (
          <a href={linkTelefonu(lokal.telefon)} className={`${plakat.className} flex h-16 items-center justify-center gap-2 bg-akcent text-2xl uppercase`}>
            <Phone className="size-6" aria-hidden /> Zadzwoń
          </a>
        ) : (
          <span className={`${plakat.className} flex h-16 items-center justify-center bg-krem text-xl text-tekst-2 uppercase`}>Brak telefonu</span>
        )}
        <PrzyciskProwadz lokal={lokal} className={`${plakat.className} flex h-16 items-center justify-center gap-2 bg-tekst text-2xl text-tlo uppercase`}>
          <Navigation className="size-6" aria-hidden /> Prowadź <ArrowUpRight className="size-5" aria-hidden />
        </PrzyciskProwadz>
      </nav>
    </div>
  );
}
