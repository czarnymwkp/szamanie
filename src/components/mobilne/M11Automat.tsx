"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { ArrowLeft, Leaf, Navigation, Phone, Search } from "lucide-react";
import { zl } from "@/lib/ceny";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import MenuZakladki from "./MenuZakladki";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { pikseleTekst, pikselowy } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 11 · Automat — salon gier z lat 80.: pikselowe litery, gwiazdy lecą w trzech warstwach, linie kineskopu,
// „PRESS START”. Kategorie wybiera się jak postać w grze, lokale to poziomy z numerem LVL.

const ARCADE = {
  "--color-tlo": "#0b0820",
  "--color-karta": "#16123a",
  "--color-krem": "#221d52",
  "--color-tekst": "#f3f0ff",
  "--color-tekst-2": "#aaa3d8",
  "--color-obrys": "#2c2666",
  "--color-obrys-2": "#4a42a0",
  "--color-akcent": "#ff6400",
  "--color-akcent-tekst": "#ffb347",
  "--color-na-akcencie": "#0b0820",
  "--color-otwarte": "#5dffb0",
  "--color-zamkniete": "#ff6b8a",
  "--font-space-grotesk": pikseleTekst.style.fontFamily,
  colorScheme: "dark",
  fontFamily: pikseleTekst.style.fontFamily,
} as CSSProperties;

// pikselowa ramka: schodkowe narożniki z cieni
const ramka = "shadow-[0_-4px_0_0_#4a42a0,0_4px_0_0_#4a42a0,-4px_0_0_0_#4a42a0,4px_0_0_0_#4a42a0]";
const ramkaAkcent = "shadow-[0_-4px_0_0_#ff6400,0_4px_0_0_#ff6400,-4px_0_0_0_#ff6400,4px_0_0_0_#ff6400]";

function TloAutomat() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      {[
        ["40px", "8s", "0.9"],
        ["70px", "14s", "0.6"],
        ["110px", "24s", "0.35"],
      ].map(([rozmiar, czas, krycie]) => (
        <div
          key={rozmiar}
          className="fixed inset-0 animate-[m-spad_linear_infinite]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1.6px)",
            backgroundSize: `${rozmiar} ${rozmiar}`,
            animationDuration: czas,
            opacity: krycie,
            ["--krok" as string]: rozmiar,
          }}
        />
      ))}
      {/* linie kineskopu i przyciemnione rogi */}
      <div className="fixed inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0px,rgba(0,0,0,0.25)_1px,transparent_1px,transparent_3px)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6))]" />
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 px-3 text-sm font-bold transition active:translate-y-0.5 ${aktywny ? `bg-akcent text-black ${ramkaAkcent}` : `bg-karta ${ramka}`}`;

export function GlownaM11({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const pole = useRef<HTMLInputElement>(null);
  const otwarte = lokale.filter(k.czyOtwarte).length;

  return (
    <div style={ARCADE} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloAutomat />
      <header className="sticky top-0 z-40 border-b-4 border-obrys-2 bg-tlo/90">
        <div className={`${pikselowy.className} mx-auto flex h-14 max-w-2xl items-center justify-between px-4 text-[10px] leading-relaxed`}>
          <span>
            <span className="text-akcent-tekst">1UP</span>
            <br />
            {String(lokale.length).padStart(6, "0")}
          </span>
          <Image src="/logo-ciemne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-5 w-auto" />
          <span className="text-right">
            <span className="text-otwarte">OTWARTE</span>
            <br />
            {String(otwarte).padStart(6, "0")}
          </span>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative pt-8 text-center">
          <SzamanM styl="crt" className="pointer-events-none mx-auto w-32" />
          <h1 className={`${pikselowy.className} mt-3 text-[1.45rem] leading-[1.5] text-akcent [text-shadow:4px_4px_0_#4a1d00]`}>
            CO DZIŚ
            <br />
            SZAMIESZ?
          </h1>
          <button
            type="button"
            onClick={() => pole.current?.focus()}
            className={`${pikselowy.className} mt-4 animate-[m-mruganie_1.2s_steps(1)_infinite] text-xs text-tekst`}
          >
            ▶ PRESS START
          </button>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`mx-auto mt-5 flex h-14 items-center gap-2 bg-karta px-3 ${ramka}`}
          >
            <Search className="size-5 shrink-0 text-akcent-tekst" aria-hidden />
            <input
              ref={pole}
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="WPISZ: pizza, kebab…"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-tekst-2"
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`flex size-10 items-center justify-center ${k.tylkoWege ? "bg-otwarte text-black" : "text-otwarte"}`}
            >
              <Leaf className="size-5" aria-hidden />
            </button>
          </form>
        </section>

        <BaneryReklamowe ciemne className="mt-8 [--promien-reklamy:0px]" />

        <section aria-labelledby="kategorie" className="mt-8">
          <h2 id="kategorie" className={`${pikselowy.className} text-center text-[11px] leading-loose text-akcent-tekst`}>
            NA CO MASZ OCHOTĘ?
            <br />
            <span className="text-tekst-2">WYBIERZ POSTAĆ</span>
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {k.kategorie.map((kat) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button
                  key={kat.id}
                  type="button"
                  aria-pressed={aktywna}
                  onClick={() => k.setKategoria(kat.id)}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 bg-karta p-1 ${aktywna ? `${ramkaAkcent} animate-[m-mruganie_0.8s_steps(1)_3]` : ramka}`}
                >
                  <IkonaTypu ikona={kat.ikona} className={`size-7 ${aktywna ? "text-akcent" : ""}`} />
                  <span className="w-full truncate text-center text-[11px] leading-tight">{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-10 scroll-mt-16">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone={`bg-otwarte text-black ${ramkaAkcent}`} />
          <h2 className={`${pikselowy.className} mt-4 text-xs leading-loose`}>
            POZIOMY: <span className="text-akcent-tekst">{k.wyniki.length}</span>
          </h2>
          <ul className="mt-4 space-y-5">
            {k.wyniki.map((l, i) => (
              <li key={l.id} className="pojawianie">
                <Link href={lokalM(nr, l.slug)} className={`group flex gap-3 bg-karta p-3 transition hover:-translate-y-0.5 ${ramka}`}>
                  <div className="relative size-20 shrink-0">
                    <Miniatura lokal={l} className="size-full" dopisek={false} />
                    <span className={`${pikselowy.className} absolute -top-2 -left-2 bg-akcent px-1 text-[8px] leading-4 text-black`}>
                      LVL {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xl leading-tight font-bold">{l.nazwa}</span>
                    <span className="block truncate text-sm text-tekst-2">{opisLokalu(l)}</span>
                    <StatusOtwarcia godziny={l.godziny} ciemne className="text-sm font-normal" />
                    {(l.cechy.wege || l.cechy.wegan) && (
                      <span className={`${pikselowy.className} mt-1 inline-flex items-center gap-1 text-[8px] text-otwarte`}>
                        <Leaf className="size-3" aria-hidden /> WEGE BONUS
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {!k.wyniki.length && (
            <button type="button" onClick={k.wyczysc} className={`${pikselowy.className} mx-auto mt-6 block text-xs text-zamkniete`}>
              GAME OVER — CONTINUE? ▶
            </button>
          )}
        </section>
      </main>
      <StopkaM linki={linki} szaman="crt" />
    </div>
  );
}

export function LokalM11({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);
  const ceny = menu?.sekcje.flatMap((s) => s.pozycje.flatMap((p) => p.ceny.map((c) => c.gr))) ?? [];
  const staty: [string, string][] = [
    ["MENU", menu ? String(menu.liczba) : "—"],
    ["OD", ceny.length ? zl(Math.min(...ceny)) : "—"],
    ["DOWÓZ", lokal.dostawa ? "TAK" : "—"],
    ["WEGE", lokal.cechy.wege || lokal.cechy.wegan ? "TAK" : "—"],
  ];

  return (
    <div style={ARCADE} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloAutomat />
      <main id="tresc" className="mx-auto max-w-2xl px-5 pt-5">
        <Link href={adresM(nr)} className={`${pikselowy.className} inline-flex items-center gap-2 text-[10px]`}>
          <ArrowLeft className="size-4" aria-hidden /> WYBÓR POZIOMU
        </Link>
        <div className={`mt-5 bg-karta p-3 ${ramka}`}>
          <Miniatura lokal={lokal} className="h-48" sizes="100vw" priorytet />
          <p className={`${pikselowy.className} mt-4 text-[10px] text-akcent-tekst`}>LEVEL</p>
          <h1 className={`${pikselowy.className} mt-2 text-[1.3rem] leading-[1.5] [text-shadow:3px_3px_0_#4a1d00]`}>{lokal.nazwa.toUpperCase()}</h1>
          <p className="mt-1 text-base text-tekst-2">{opisLokalu(lokal)}</p>
          <StatusOtwarcia godziny={lokal.godziny} ciemne className="mt-1 font-normal" />
          <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
            {staty.map(([nazwa, wartosc]) => (
              <div key={nazwa} className="bg-krem px-1 py-2">
                <dt className={`${pikselowy.className} text-[7px] text-tekst-2`}>{nazwa}</dt>
                <dd className="mt-1 text-base font-bold text-akcent-tekst">{wartosc}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-4 text-base text-tekst-2">{pelnyAdres(lokal)}</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className={`${pikselowy.className} flex h-14 items-center justify-center gap-2 bg-akcent text-[10px] text-black ${ramkaAkcent} active:translate-y-1`}>
              <Phone className="size-4" aria-hidden /> ZADZWOŃ
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className={`${pikselowy.className} flex h-14 items-center justify-center gap-2 bg-karta text-[10px] ${ramka} active:translate-y-1`}>
            <Navigation className="size-4" aria-hidden /> PROWADŹ
          </PrzyciskProwadz>
        </div>

        <section className="mt-10">
          <h2 className={`${pikselowy.className} mb-2 text-xs text-akcent-tekst`}>EKWIPUNEK (MENU)</h2>
          {menu ? (
            <MenuZakladki
              menu={menu}
              dostawa={dostawa}
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              telefon={lokal.telefon}
              wyglad={{
                pasek: "bg-tlo/95",
                aktywna: `rounded-none bg-akcent text-black ${ramkaAkcent}`,
                nieaktywna: `rounded-none bg-karta ${ramka}`,
                naglowek: "text-2xl font-bold text-akcent-tekst",
                wiersz: "border-b-2 border-dashed border-obrys-2",
                miniatura: "rounded-none [image-rendering:pixelated]",
              }}
            />
          ) : (
            <p className="text-tekst-2">Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
          )}
        </section>
        {tydzien && (
          <section className={`mt-10 bg-karta p-4 ${ramka}`}>
            <h2 className={`${pikselowy.className} mb-3 text-[10px] text-akcent-tekst`}>GODZINY GRY</h2>
            <TabelaGodzin tydzien={tydzien} />
          </section>
        )}
      </main>
      <StopkaM linki={linki} szaman="crt" />
    </div>
  );
}
