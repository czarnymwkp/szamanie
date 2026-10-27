"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Clock, Leaf, MapPin, Navigation, Phone, Search, X } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import MapaLokali from "../MapaLokali";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import MenuLokalu from "../menu/MenuLokalu";
import { useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import SzamanM from "./SzamanM";
import { adresM, losowe, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 6 · Mapa — najpierw mapa z pinezkami wszystkich lokali (przykleja się u góry), lista wjeżdża na nią jak
// arkusz w Mapach Google. W tle arkusza warstwice jak na mapie turystycznej, powoli płyną.

const PIASEK = {
  "--color-tlo": "#f4efe6",
  "--color-krem": "#ebe3d6",
  "--color-obrys": "#e2d8c8",
  "--color-obrys-2": "#cdbfa8",
} as CSSProperties;

// warstwice: kilka „wzgórz”, wokół każdego pierścienie zniekształcone sinusami (stałe losowanie)
const WARSTWICE = (() => {
  const los = losowe(42);
  const sciezki: string[] = [];
  for (const [cx, cy] of [
    [80, 150],
    [340, 480],
    [70, 780],
    [320, 60],
    [210, 980],
  ]) {
    const faza = los() * 6.28;
    const a1 = 0.1 + los() * 0.1;
    const a2 = 0.05 + los() * 0.07;
    for (let k = 1; k <= 10; k++) {
      const r = k * 24;
      const punkty: string[] = [];
      for (let i = 0; i < 72; i++) {
        const t = (i / 72) * Math.PI * 2;
        const rr = r * (1 + a1 * Math.sin(3 * t + faza) + a2 * Math.sin(5 * t - faza * 0.7 + k * 0.35));
        punkty.push(`${(cx + rr * Math.cos(t)).toFixed(1)} ${(cy + rr * Math.sin(t)).toFixed(1)}`);
      }
      sciezki.push(`M${punkty.join("L")}Z`);
    }
  }
  return sciezki;
})();

function TloWarstwice() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <svg viewBox="0 0 400 1100" preserveAspectRatio="xMidYMid slice" className="m-warstwice fixed -inset-[15%] h-[130%] w-[130%]">
        {WARSTWICE.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#a88a5c" strokeOpacity={i % 5 === 4 ? 0.35 : 0.18} strokeWidth={i % 5 === 4 ? 1.4 : 0.8} />
        ))}
      </svg>
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold shadow-sm transition active:scale-95 ${
    aktywny ? "bg-[#1a73e8] text-white" : "bg-white"
  }`;

export function GlownaM06({ lokale, miejscowosci, nr }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const [wybrany, setWybrany] = useState<number | null>(null);
  const lokalNaMapie = k.wyniki.find((l) => l.id === wybrany) ?? null;

  return (
    <div style={PIASEK} className="relative isolate min-h-screen overflow-x-clip bg-tlo pb-16">
      <div className="sticky top-0 h-[58vh]">
        <MapaLokali lokale={k.wyniki} wybrany={wybrany} onWybierz={setWybrany} className="size-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] px-4 pt-3">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="pointer-events-auto mx-auto flex h-14 max-w-xl items-center gap-2 rounded-full bg-white pr-2 pl-3 shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
          >
            <Image src="/znak.png" alt="szamanie" width={32} height={32} className="size-8" />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Szukaj w Kraśniku i okolicy"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-tekst-2"
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`flex size-10 items-center justify-center rounded-full ${k.tylkoWege ? "bg-[#15803d] text-white" : "bg-[#e6f4ea] text-[#15803d]"}`}
            >
              <Leaf className="size-5" aria-hidden />
            </button>
            <button type="submit" aria-label="Pokaż wyniki" className="flex size-10 items-center justify-center rounded-full bg-[#1a73e8] text-white">
              <Search className="size-5" aria-hidden />
            </button>
          </form>
        </div>
        {lokalNaMapie && (
          <div className="absolute inset-x-4 bottom-14 z-[500] mx-auto flex max-w-md animate-wysun items-center gap-3 rounded-3xl bg-white p-2 pr-3 shadow-xl">
            <Miniatura lokal={lokalNaMapie} className="size-16 shrink-0 rounded-2xl" dopisek={false} />
            <Link href={lokalM(nr, lokalNaMapie.slug)} className="min-w-0 flex-1">
              <span className="block truncate font-extrabold">{lokalNaMapie.nazwa}</span>
              <StatusOtwarcia godziny={lokalNaMapie.godziny} className="text-xs" />
              <span className="flex items-center gap-1 text-xs font-extrabold text-[#1a73e8]">
                Otwórz <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </Link>
            <button type="button" onClick={() => setWybrany(null)} aria-label="Zamknij" className="text-tekst-2">
              <X className="size-5" aria-hidden />
            </button>
          </div>
        )}
      </div>

      <main id="tresc" className="relative z-10 -mt-8 rounded-t-[2rem] bg-tlo shadow-[0_-10px_30px_rgba(0,0,0,0.15)]">
        <TloWarstwice />
        {/* szaman stoi na krawędzi arkusza, nad mapą */}
        <SzamanM styl="pinezka" className="pointer-events-none absolute -top-[7rem] right-5 w-24" />
        <div className="mx-auto max-w-2xl px-5 pt-3">
          <span aria-hidden className="mx-auto block h-1.5 w-12 rounded-full bg-obrys-2" />
          <h1 className="mt-4 font-grotesk text-2xl font-bold">
            {lokale.length} miejsc na mapie Kraśnika <span className="text-akcent-tekst">i okolicy</span>
          </h1>

          <BaneryReklamowe className="mt-4" />

          <section aria-labelledby="kategorie" className="mt-6">
            <h2 id="kategorie" className="font-grotesk text-xl font-bold">
              Na co masz ochotę?
            </h2>
            <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
              {k.kategorie.map((kat) => {
                const aktywna = k.kategoria === kat.id;
                return (
                  <button
                    key={kat.id}
                    type="button"
                    aria-pressed={aktywna}
                    onClick={() => k.setKategoria(kat.id)}
                    className={`${chip(aktywna)} pl-2.5`}
                  >
                    <IkonaTypu ikona={kat.ikona} className="size-5" /> {kat.nazwa}
                  </button>
                );
              })}
            </div>
          </section>

          <section id="wyniki" aria-label="Lokale" className="mt-4 scroll-mt-4">
            <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} />
            <h2 className="mt-3 text-sm font-extrabold text-tekst-2">
              {k.wyniki.length} {odmiana(k.wyniki.length, ["wynik", "wyniki", "wyników"])} · dotknij pinezki na mapie
            </h2>
            <ul className="mt-2 divide-y divide-obrys">
              {k.wyniki.map((l) => (
                <li key={l.id} className="pojawianie">
                  <Link href={lokalM(nr, l.slug)} className="flex gap-3 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg leading-tight font-extrabold">{l.nazwa}</span>
                      <span className="block truncate text-sm font-semibold text-tekst-2">{opisLokalu(l)}</span>
                      <StatusOtwarcia godziny={l.godziny} className="text-sm" />
                      <span className="flex items-center gap-1 text-xs font-bold text-tekst-2">
                        <MapPin className="size-3.5" aria-hidden /> {pelnyAdres(l)}
                        {k.odleglosc(l) && <span className="ml-1 text-[#1a73e8]">· {k.odleglosc(l)}</span>}
                        {(l.cechy.wege || l.cechy.wegan) && <Leaf className="ml-1 size-3.5 text-[#15803d]" aria-label="wege" />}
                      </span>
                    </span>
                    <Miniatura lokal={l} className="size-24 shrink-0 rounded-2xl" dopisek={false} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

export function LokalM06({ lokal, menu, dostawa, nr }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={PIASEK} className="relative isolate min-h-screen overflow-x-clip bg-tlo pb-16">
      <div className="sticky top-0 h-[48vh]">
        <MapaLokali lokale={[lokal]} wybrany={lokal.id} onWybierz={() => {}} className="size-full" />
        <Link
          href={adresM(nr)}
          aria-label="Wszystkie lokale"
          className="absolute top-3 left-3 z-[500] flex size-11 items-center justify-center rounded-full bg-white shadow-lg"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
      </div>

      <main id="tresc" className="relative z-10 -mt-10 rounded-t-[2rem] bg-tlo shadow-[0_-10px_30px_rgba(0,0,0,0.15)]">
        <TloWarstwice />
        <div className="mx-auto max-w-2xl px-5 pt-3">
          <span aria-hidden className="mx-auto block h-1.5 w-12 rounded-full bg-obrys-2" />
          <div className="mt-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="font-grotesk text-[2rem] leading-tight font-bold">{lokal.nazwa}</h1>
              <p className="font-semibold text-tekst-2">{opisLokalu(lokal)}</p>
              <StatusOtwarcia godziny={lokal.godziny} className="mt-1" />
            </div>
            <Miniatura lokal={lokal} className="size-20 shrink-0 rounded-2xl" sizes="80px" priorytet dopisek={false} />
          </div>
          <p className="mt-3 flex items-center gap-1.5 font-semibold">
            <MapPin className="size-4 shrink-0 text-[#1a73e8]" aria-hidden /> {pelnyAdres(lokal)}
          </p>
          <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
            <PrzyciskProwadz lokal={lokal} className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#1a73e8] px-5 font-extrabold text-white">
              <Navigation className="size-5" aria-hidden /> Trasa
            </PrzyciskProwadz>
            {lokal.telefon && (
              <a href={linkTelefonu(lokal.telefon)} className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-obrys-2 bg-white px-5 font-extrabold text-[#1a73e8]">
                <Phone className="size-5" aria-hidden /> Zadzwoń
              </a>
            )}
            {menu && (
              <a href="#menu" className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-obrys-2 bg-white px-5 font-extrabold text-[#1a73e8]">
                Menu · {menu.liczba}
              </a>
            )}
          </div>

          <section className="mt-6 rounded-3xl bg-white/80 p-4 backdrop-blur">
            <h2 className="flex items-center gap-2 font-extrabold">
              <Clock className="size-5 text-[#1a73e8]" aria-hidden /> Godziny otwarcia
            </h2>
            <div className="mt-2">{tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="text-sm text-tekst-2">Brak informacji.</p>}</div>
          </section>

          {menu ? (
            <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} />
          ) : (
            <p className="mt-6 rounded-3xl bg-white/80 p-4 font-semibold text-tekst-2">Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
          )}
        </div>
      </main>
    </div>
  );
}
