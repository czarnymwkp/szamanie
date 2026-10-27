"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  Beer,
  CakeSlice,
  Carrot,
  Cherry,
  Coffee,
  Croissant,
  CupSoda,
  Donut,
  Drumstick,
  Fish,
  Hamburger,
  IceCreamCone,
  Leaf,
  MapPin,
  Navigation,
  Phone,
  Pizza,
  Salad,
  Sandwich,
  Search,
  Soup,
  Wine,
} from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import EtykietaPromo from "../EtykietaPromo";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import MenuLokalu from "../menu/MenuLokalu";
import SzamanM from "./SzamanM";
import { adresMapy } from "../szablony/wspolne";
import { useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import { reka } from "./fonty";
import { adresM, losowe, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 3 · Szkicownik — papier w kropki, w tle rysowane ikony jedzenia powoli płyną po skosie, lokale jak polaroidy
// przyklejone taśmą, „do późna” na żółtych karteczkach. Odręczne dopiski krojem Caveat.

const PAPIER = {
  "--color-tlo": "#fffdf7",
  "--color-krem": "#f6eedf",
  "--color-obrys": "#e9dfcf",
  "--color-obrys-2": "#cbbca3",
  "--color-tekst": "#1d1b19",
  "--color-tekst-2": "#5d554b",
} as CSSProperties;

const IKONY = [Pizza, Coffee, Hamburger, Soup, IceCreamCone, Croissant, Cherry, Carrot, Salad, Fish, Wine, Beer, CakeSlice, Donut, Drumstick, Sandwich, CupSoda];
const los = losowe(11);
// kafel wzoru 360×360: ikony w siatce 4×4 z rozrzutem i obrotem — powtarza się bez szwów
const RYSUNKI = Array.from({ length: 16 }, (_, i) => ({
  Ikona: IKONY[i % IKONY.length],
  x: (i % 4) * 90 + 10 + los() * 30,
  y: Math.floor(i / 4) * 90 + 10 + los() * 30,
  obrot: Math.round((los() - 0.5) * 70),
  rozmiar: 30 + Math.round(los() * 16),
}));

function TloSzkic() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <svg className="m-dryf fixed -top-[360px] -left-[360px] h-[calc(100vh+720px)] w-[calc(100vw+720px)] text-[#1d1b19] opacity-[0.07]">
        <defs>
          <pattern id="m-szkic" width="360" height="360" patternUnits="userSpaceOnUse">
            {RYSUNKI.map(({ Ikona, x, y, obrot, rozmiar }, i) => (
              <g key={i} transform={`rotate(${obrot} ${x + rozmiar / 2} ${y + rozmiar / 2})`}>
                <Ikona x={x} y={y} width={rozmiar} height={rozmiar} strokeWidth={1.6} />
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#m-szkic)" />
      </svg>
    </div>
  );
}

/** Odręczne podkreślenie, które „rysuje się” po wczytaniu. */
function Podkreslenie({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 300 24" preserveAspectRatio="none" className={`m-rysuj ${className}`}>
      <path d="M4 16 C 60 6, 120 22, 180 12 S 270 8, 296 14" fill="none" stroke="#ff6400" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

const chip = (aktywny: boolean) =>
  `m-reczna-ramka flex h-10 shrink-0 items-center gap-1.5 border-2 border-tekst px-4 text-sm font-extrabold transition active:translate-y-0.5 ${
    aktywny ? "bg-[#ffd36e] shadow-none" : "bg-white shadow-[3px_3px_0_#1d1b19]"
  }`;

export function GlownaM03({ lokale, miejscowosci, nr }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);

  return (
    <div style={PAPIER} className="m-papier relative isolate min-h-screen overflow-x-clip pb-16 text-tekst">
      <TloSzkic />
      <header className="sticky top-0 z-40 border-b-2 border-dashed border-obrys-2 bg-[#fffdf7]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
          <span className={`${reka.className} ml-auto -rotate-3 text-xl text-akcent-tekst`}>smacznego!</span>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative pt-8">
          <SzamanM styl="szkic" className="pointer-events-none absolute top-0 -right-2 w-28 rotate-3 animate-wjazd [animation-delay:300ms]" />
          <h1 className="animate-wjazd text-[2.9rem] leading-[0.95] font-black tracking-tight">
            Co dziś
            <span className={`${reka.className} relative ml-1 inline-block -rotate-2 text-[4.2rem] text-akcent-tekst`}>
              szamiesz?
              <Podkreslenie className="absolute -bottom-2 left-0 h-4 w-full" />
            </span>
          </h1>
          <p className={`${reka.className} mt-4 ml-2 rotate-[-1.5deg] text-2xl text-tekst-2`}>
            {lokale.length} miejsc w Kraśniku i okolicy ↓
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
          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none]">
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
            <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pt-2 pb-4 [scrollbar-width:none]">
              {k.doPozna.map(({ lokal, doGodziny }, i) => (
                <Link
                  key={lokal.id}
                  href={lokalM(nr, lokal.slug)}
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
          <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3">
            {k.wyniki.map((l, i) => (
              <li key={l.id} className="pojawianie">
                <Link
                  href={lokalM(nr, l.slug)}
                  className="m-tasma relative block bg-white p-2 pb-3 shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition hover:rotate-0"
                  style={{ rotate: `${[-1.6, 1.2, -0.6, 1.8][i % 4]}deg` }}
                >
                  <div className="relative">
                    <Miniatura lokal={l} className="aspect-square" sizes="50vw" dopisek={false} />
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
      </main>
    </div>
  );
}

export function LokalM03({ lokal, menu, dostawa, nr }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={PAPIER} className="m-papier relative isolate min-h-screen overflow-x-clip pb-16 text-tekst">
      <TloSzkic />
      <main id="tresc" className="mx-auto max-w-2xl px-5 pt-5">
        <Link href={adresM(nr)} className={`${reka.className} inline-flex items-center gap-1 text-2xl`}>
          <ArrowLeft className="size-5" aria-hidden /> wszystkie lokale
        </Link>

        <div className="relative mt-4 flex items-start gap-4">
          <div className="m-tasma relative w-[46%] shrink-0 -rotate-3 bg-white p-2 pb-6 shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
            <Miniatura lokal={lokal} className="aspect-[4/5]" sizes="50vw" priorytet dopisek={false} />
            <span className={`${reka.className} absolute bottom-0.5 left-2 text-lg text-tekst-2`}>zdjęcie poglądowe</span>
          </div>
          <div className="min-w-0 flex-1 pt-2">
            {lokal.promowany && <EtykietaPromo className="mb-2" />}
            <h1 className="animate-wjazd text-[1.9rem] leading-[1.02] font-black tracking-tight">
              <span className="bg-[linear-gradient(transparent_55%,#ffd36e_55%,#ffd36e_90%,transparent_90%)] box-decoration-clone">
                {lokal.nazwa}
              </span>
            </h1>
            <p className="mt-2 text-sm font-bold text-tekst-2">{opisLokalu(lokal)}</p>
            <StatusOtwarcia godziny={lokal.godziny} className="mt-2 text-sm" />
          </div>
        </div>

        <p className="mt-5 flex items-center gap-1.5 font-semibold">
          <MapPin className="size-4 shrink-0 text-akcent-tekst" aria-hidden /> {pelnyAdres(lokal)}
        </p>
        <div className="relative mt-10 flex gap-3">
          {lokal.telefon && (
            <a
              href={linkTelefonu(lokal.telefon)}
              className="m-reczna-ramka flex h-14 flex-1 items-center justify-center gap-2 border-[2.5px] border-tekst bg-akcent text-lg font-black shadow-[4px_4px_0_#1d1b19] active:translate-y-0.5 active:shadow-none"
            >
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz
            lokal={lokal}
            className="m-reczna-ramka flex h-14 flex-1 items-center justify-center gap-2 border-[2.5px] border-tekst bg-white text-lg font-black shadow-[4px_4px_0_#1d1b19]"
          >
            <Navigation className="size-5" aria-hidden /> Prowadź
          </PrzyciskProwadz>
          {lokal.telefon && (
            <span className={`${reka.className} pointer-events-none absolute -top-8 left-6 rotate-[-8deg] text-xl text-akcent-tekst`}>
              zamów tu! ↓
            </span>
          )}
        </div>

        {menu ? (
          <div className="relative mt-10 rotate-[0.4deg] bg-white px-4 pt-1 pb-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            <span aria-hidden className="m-tasma absolute inset-x-0 top-0" />
            <MenuLokalu
              menu={menu}
              dostawa={dostawa}
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              telefon={lokal.telefon}
              numerowane
            />
          </div>
        ) : (
          <p className={`${reka.className} mt-10 text-3xl`}>Menu jeszcze nie mamy — zapytaj przez telefon!</p>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <section className="rotate-[-1.2deg] bg-[#fff3a8] p-4 shadow-[2px_8px_16px_rgba(0,0,0,0.12)]">
            <h2 className={`${reka.className} text-3xl`}>Godziny</h2>
            {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="text-sm">Brak informacji.</p>}
          </section>
          <section className="m-tasma relative rotate-[1deg] bg-white p-2 pb-8 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
            <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="h-56 w-full border-0" />
            <span className={`${reka.className} absolute bottom-1 left-3 text-xl`}>tu jesteśmy ✗</span>
          </section>
        </div>
      </main>
    </div>
  );
}
