"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, Leaf, Navigation, Phone, Search } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import type { Lokal } from "@/lib/lokale";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import MenuKafle from "./MenuKafle";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { komiksowy } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 18 · Komiks — pop-art: żółty papier w kropki rastra, kadry z grubą czarną kreską, linie ruchu za tytułem,
// dymki („MNIAM!”), gwiazdy-wybuchy („BAM!”). Wszystko lekko przekrzywione, jak wklejone ręcznie.

const KOMIKS = {
  "--color-tlo": "#fff3c4",
  "--color-karta": "#ffffff",
  "--color-krem": "#ffe58a",
  "--color-tekst": "#111111",
  "--color-tekst-2": "#3f3a2c",
  "--color-obrys": "#111111",
  "--color-obrys-2": "#111111",
  "--color-akcent": "#ff5a1f",
  "--color-akcent-tekst": "#c2310a",
  "--font-space-grotesk": komiksowy.style.fontFamily,
} as CSSProperties;

const WYBUCH =
  "polygon(50% 0%,61% 20%,82% 8%,79% 31%,100% 38%,82% 54%,96% 77%,72% 75%,66% 100%,50% 83%,34% 100%,28% 75%,4% 77%,18% 54%,0% 38%,21% 31%,18% 8%,39% 20%)";
const kadr = "border-[3px] border-tekst bg-karta shadow-[5px_5px_0_#111]";

function Wybuch({ children, className = "", kolor = "#ffd400" }: { children: ReactNode; className?: string; kolor?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      <span aria-hidden className="absolute inset-0 bg-tekst" style={{ clipPath: WYBUCH, transform: "scale(1.08)" }} />
      <span aria-hidden className="absolute inset-0" style={{ clipPath: WYBUCH, background: kolor }} />
      <span className={`${komiksowy.className} relative text-tekst`}>{children}</span>
    </span>
  );
}

/** Zdjęcie w kadrze z kropkami rastra. */
function Kadr({ lokal, className = "" }: { lokal: Lokal; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Miniatura lokal={lokal} className="size-full [filter:saturate(1.5)_contrast(1.15)]" dopisek={false} />
      <span className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.35)_1px,transparent_1.6px)] bg-[length:6px_6px] mix-blend-multiply" />
    </div>
  );
}

function TloKomiks() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,61,139,0.22)_1.6px,transparent_2px)] bg-[length:14px_14px] [mask-image:linear-gradient(160deg,black,transparent_60%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(rgba(41,197,246,0.25)_1.6px,transparent_2px)] bg-[length:14px_14px] [mask-image:linear-gradient(-20deg,black,transparent_55%)]" />
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `${komiksowy.className} flex h-10 shrink-0 items-center gap-1.5 border-[3px] border-tekst px-3 text-base tracking-wide ${aktywny ? "bg-akcent shadow-none" : "bg-karta shadow-[3px_3px_0_#111]"}`;

export function GlownaM18({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);

  return (
    <div style={KOMIKS} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloKomiks />
      <header className="mx-auto flex h-16 max-w-2xl items-center px-5">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
        <span className={`${komiksowy.className} ml-auto -rotate-3 bg-tekst px-2 py-0.5 text-lg text-[#ffd400]`}>ZESZYT #47</span>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className={`${kadr} relative -rotate-1 overflow-hidden px-5 pt-5 pb-6`}>
          {/* linie ruchu z rogu */}
          <span aria-hidden className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg_at_85%_80%,#ffe58a_0deg_6deg,#ffffff_6deg_12deg)]" />
          <div className="relative">
            <p className={`${komiksowy.className} inline-block border-2 border-tekst bg-[#ffd400] px-2 text-sm`}>TYMCZASEM W KRAŚNIKU…</p>
            <h1 className={`${komiksowy.className} mt-3 max-w-[70%] text-[3.4rem] leading-[0.9] tracking-wide text-akcent [-webkit-text-stroke:2px_#111] [paint-order:stroke_fill] [text-shadow:4px_4px_0_#111]`}>
              CO DZIŚ SZAMIESZ?!
            </h1>
            <div className="absolute -top-2 -right-3 w-32">
              <SzamanM styl="komiks" className="w-full" />
              <span className={`${komiksowy.className} absolute -top-3 -left-12 rounded-[50%] border-[3px] border-tekst bg-karta px-3 py-1 text-xl after:absolute after:-right-2 after:bottom-0 after:h-4 after:w-4 after:rotate-45 after:border-r-[3px] after:border-b-[3px] after:border-tekst after:bg-karta`}>
                MNIAM!
              </span>
            </div>
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-5 flex h-14 items-center gap-2 rounded-full border-[3px] border-tekst bg-karta pr-1.5 pl-4 shadow-[4px_4px_0_#111]"
            >
              <Search className="size-5 shrink-0" aria-hidden />
              <input
                type="search"
                value={k.szukaj}
                onChange={(e) => k.setSzukaj(e.target.value)}
                placeholder="Pizza? Kebab? Burger?"
                aria-label="Szukaj lokalu"
                className="min-w-0 flex-1 bg-transparent font-bold outline-none placeholder:text-tekst-2"
              />
              <button type="button" onClick={() => k.setTylkoWege(!k.tylkoWege)} aria-pressed={k.tylkoWege} aria-label="Tylko wege">
                {k.tylkoWege ? (
                  <Wybuch className="size-14 text-sm" kolor="#7ee081">
                    WEGE!
                  </Wybuch>
                ) : (
                  <span className="flex size-11 items-center justify-center rounded-full border-[3px] border-tekst bg-[#c9f7c6]">
                    <Leaf className="size-5" aria-hidden />
                  </span>
                )}
              </button>
            </form>
          </div>
        </section>

        <div className={`${kadr} mt-6 rotate-1 p-3`}>
          <p className={`${komiksowy.className} mb-2 text-lg`}>OGŁOSZENIE!</p>
          <BaneryReklamowe className="[--promien-reklamy:0px]" />
        </div>

        <section aria-labelledby="kategorie" className="mt-8">
          <h2 id="kategorie" className={`${komiksowy.className} text-4xl tracking-wide`}>
            NA CO MASZ OCHOTĘ?
          </h2>
          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pt-2 pb-4 [scrollbar-width:none]">
            {k.kategorie.map((kat, i) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button key={kat.id} type="button" aria-pressed={aktywna} onClick={() => k.setKategoria(kat.id)} className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1">
                  {aktywna ? (
                    <Wybuch className="size-[4.5rem]" kolor="#ff8a3d">
                      <IkonaTypu ikona={kat.ikona} className="size-7" />
                    </Wybuch>
                  ) : (
                    <span className={`${kadr} flex size-16 items-center justify-center`} style={{ rotate: `${i % 2 ? 4 : -4}deg` }}>
                      <IkonaTypu ikona={kat.ikona} className="size-7" />
                    </span>
                  )}
                  <span className={`${komiksowy.className} text-base whitespace-nowrap`}>{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-4 scroll-mt-4">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="!bg-[#7ee081]" />
          <h2 className={`${komiksowy.className} mt-3 text-3xl`}>
            {k.wyniki.length} {odmiana(k.wyniki.length, ["LOKAL", "LOKALE", "LOKALI"])}!
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
            {k.wyniki.map((l, i) => (
              <li key={l.id} className="pojawianie">
                <Link href={lokalM(nr, l.slug)} className={`${kadr} relative block`} style={{ rotate: `${[-1.5, 1.2, 0.8, -1][i % 4]}deg` }}>
                  <Kadr lokal={l} className="aspect-square border-b-[3px] border-tekst" />
                  <div className="p-2">
                    <h3 className={`${komiksowy.className} text-xl leading-none tracking-wide`}>{l.nazwa}</h3>
                    <p className="mt-0.5 truncate text-xs font-bold text-tekst-2">{opisLokalu(l)}</p>
                    <StatusOtwarcia godziny={l.godziny} className="mt-1 text-xs" />
                  </div>
                  {(l.cechy.wege || l.cechy.wegan) && (
                    <Wybuch className="absolute -top-3 -right-3 size-12 text-xs" kolor="#7ee081">
                      WEGE
                    </Wybuch>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="komiks" />
    </div>
  );
}

export function LokalM18({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={KOMIKS} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloKomiks />
      <main id="tresc" className="mx-auto max-w-2xl px-5 pt-4">
        <Link href={adresM(nr)} className={`${komiksowy.className} inline-flex items-center gap-1 text-xl`}>
          <ArrowLeft className="size-5" aria-hidden /> WRACAMY!
        </Link>
        <div className={`${kadr} relative mt-3 -rotate-1`}>
          <Kadr lokal={lokal} className="aspect-[4/3]" />
          <p className={`${komiksowy.className} absolute top-2 left-2 border-2 border-tekst bg-[#ffd400] px-2 text-sm`}>
            {lokal.miejscowosc?.toUpperCase()}, {lokal.adres?.toUpperCase()}
          </p>
        </div>
        <h1 className={`${komiksowy.className} mt-5 text-[3.2rem] leading-[0.9] tracking-wide text-akcent [-webkit-text-stroke:2px_#111] [paint-order:stroke_fill] [text-shadow:4px_4px_0_#111]`}>
          {lokal.nazwa}
        </h1>
        <p className="mt-2 font-bold text-tekst-2">{opisLokalu(lokal)}</p>
        <StatusOtwarcia godziny={lokal.godziny} className="mt-1" />
        <p className="mt-1 text-sm font-bold text-tekst-2">{pelnyAdres(lokal)}</p>
        <div className="relative mt-5 grid grid-cols-2 gap-3">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className={`${komiksowy.className} flex h-14 items-center justify-center gap-2 border-[3px] border-tekst bg-akcent text-2xl tracking-wide shadow-[4px_4px_0_#111] active:translate-x-1 active:translate-y-1 active:shadow-none`}>
              <Phone className="size-5" aria-hidden /> DRYŃ!
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className={`${komiksowy.className} flex h-14 items-center justify-center gap-2 border-[3px] border-tekst bg-[#29c5f6] text-2xl tracking-wide shadow-[4px_4px_0_#111]`}>
            <Navigation className="size-5" aria-hidden /> W DROGĘ!
          </PrzyciskProwadz>
          <Wybuch className="pointer-events-none absolute -top-8 -left-3 size-14 -rotate-12 text-base">BAM!</Wybuch>
        </div>

        <section className="mt-10">
          <h2 className={`${komiksowy.className} mb-3 text-4xl tracking-wide`}>MENU!</h2>
          {menu ? (
            <div className={`${kadr} p-3`}>
              <MenuKafle menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} />
            </div>
          ) : (
            <p className="font-bold">Menu jeszcze nie ma — zadzwoń i zapytaj!</p>
          )}
        </section>
        {tydzien && (
          <section className={`${kadr} mt-8 rotate-1 p-4`}>
            <h2 className={`${komiksowy.className} text-2xl tracking-wide`}>KIEDY OTWARTE?</h2>
            <TabelaGodzin tydzien={tydzien} />
          </section>
        )}
      </main>
      <StopkaM linki={linki} szaman="komiks" />
    </div>
  );
}
