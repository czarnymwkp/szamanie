"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Leaf, MapPin, Navigation, Phone, Search } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
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
import { kaligrafia, pedzel } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 16 · Akwarela — papier akwarelowy, po którym rozlewają się plamy farby (filtr SVG z szumem robi im
// postrzępione brzegi, plamy powoli „puchną”). Szeryfowy krój w kursywie, odręczne dopiski pędzelkiem.
// Zdjęcia w miękkich, nieregularnych kształtach.

const PAPIER = {
  "--color-tlo": "#fbf8f3",
  "--color-karta": "#fffdf9",
  "--color-krem": "#f3ede4",
  "--color-tekst": "#2b2833",
  "--color-tekst-2": "#6a6570",
  "--color-obrys": "#e8e0d5",
  "--color-obrys-2": "#d3c8ba",
  "--color-akcent": "#f2713a",
  "--color-akcent-tekst": "#b54a17",
  "--font-space-grotesk": pedzel.style.fontFamily,
} as CSSProperties;

const PLAMY = [
  { cx: 15, cy: 12, r: 26, kolor: "#ffb3a7" },
  { cx: 88, cy: 22, r: 22, kolor: "#9fd3f2" },
  { cx: 70, cy: 55, r: 28, kolor: "#ffe08a" },
  { cx: 10, cy: 70, r: 24, kolor: "#b8e0b0" },
  { cx: 80, cy: 92, r: 26, kolor: "#d5b8f0" },
];
const KSZTALTY = ["42% 58% 61% 39% / 47% 41% 59% 53%", "58% 42% 38% 62% / 55% 60% 40% 45%", "50% 50% 44% 56% / 38% 52% 48% 62%"];

function TloAkwarela() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <svg className="fixed inset-0 size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100">
        <defs>
          <filter id="m-akwarela" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="5" />
            <feDisplacementMap in="SourceGraphic" scale="9" />
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        <g filter="url(#m-akwarela)" style={{ mixBlendMode: "multiply" }}>
          {PLAMY.map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.kolor} opacity="0.45" className="m-slonce" style={{ animationDuration: `${9 + i * 2}s`, transformBox: "fill-box", transformOrigin: "center" }} />
          ))}
        </g>
      </svg>
      <div className="m-ziarno !opacity-[0.06]" />
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition ${
    aktywny ? "border-tekst bg-tekst text-tlo" : "border-obrys-2 bg-karta/70 backdrop-blur"
  }`;

export function GlownaM16({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);

  return (
    <div style={PAPIER} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloAkwarela />
      <header className="mx-auto flex h-16 max-w-2xl items-center px-5">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
        <span className={`${kaligrafia.className} ml-auto text-xl text-akcent-tekst`}>Kraśnik i okolice</span>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative pt-4 text-center">
          <SzamanM styl="akwarela" className="pointer-events-none mx-auto w-32" />
          <h1 className={`${pedzel.className} mt-2 text-[3.2rem] leading-[0.95] font-bold`}>
            Co dziś <span className="italic">szamiesz?</span>
          </h1>
          <p className={`${kaligrafia.className} mt-2 text-2xl text-akcent-tekst`}>{lokale.length} miejsc, w których dobrze zjesz</p>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mx-auto mt-6 flex h-14 max-w-md items-center gap-2 rounded-full bg-karta/80 pr-2 pl-5 shadow-[0_8px_30px_rgba(120,90,60,0.12)] ring-1 ring-obrys backdrop-blur"
          >
            <Search className="size-5 shrink-0 text-tekst-2" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Czego szukasz?"
              aria-label="Szukaj lokalu"
              className={`${pedzel.className} min-w-0 flex-1 bg-transparent text-xl italic outline-none placeholder:text-tekst-2`}
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`flex size-10 items-center justify-center rounded-full ${k.tylkoWege ? "bg-[#7cbf6e] text-white" : "text-[#4d8a42]"}`}
            >
              <Leaf className="size-5" aria-hidden />
            </button>
          </form>
        </section>

        <BaneryReklamowe className="mt-8 [--promien-reklamy:1.5rem]" />

        <section aria-labelledby="kategorie" className="mt-8">
          <h2 id="kategorie" className={`${pedzel.className} text-center text-3xl font-bold italic`}>
            Na co masz ochotę?
          </h2>
          <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
            {k.kategorie.map((kat, i) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button key={kat.id} type="button" aria-pressed={aktywna} onClick={() => k.setKategoria(kat.id)} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5">
                  <span
                    className="flex size-[4.25rem] items-center justify-center transition"
                    style={{
                      borderRadius: KSZTALTY[i % KSZTALTY.length],
                      background: `radial-gradient(circle at 40% 35%, ${aktywna ? "#f2713a" : PLAMY[i % PLAMY.length].kolor}cc, transparent 72%)`,
                    }}
                  >
                    <IkonaTypu ikona={kat.ikona} className="size-7" />
                  </span>
                  <span className={`${pedzel.className} text-[15px] font-bold whitespace-nowrap ${aktywna ? "text-akcent-tekst italic" : ""}`}>{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-6 scroll-mt-4">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="border-[#7cbf6e] bg-[#7cbf6e] text-white" />
          <h2 className={`${pedzel.className} mt-3 text-3xl font-bold`}>
            {k.wyniki.length} <span className="italic">{odmiana(k.wyniki.length, ["miejsce", "miejsca", "miejsc"])}</span>
          </h2>
          <ul className="mt-5 space-y-8">
            {k.wyniki.map((l, i) => (
              <li key={l.id} className="pojawianie">
                <Link href={lokalM(nr, l.slug)} className={`flex items-center gap-4 ${i % 2 ? "flex-row-reverse text-right" : ""}`}>
                  <div className="size-32 shrink-0 overflow-hidden shadow-[0_10px_30px_rgba(120,90,60,0.18)]" style={{ borderRadius: KSZTALTY[i % KSZTALTY.length] }}>
                    <Miniatura lokal={l} className="size-full" dopisek={false} />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className={`${pedzel.className} block text-[1.8rem] leading-[1] font-bold`}>{l.nazwa}</span>
                    <span className="mt-1 block text-sm text-tekst-2">{opisLokalu(l)}</span>
                    <StatusOtwarcia godziny={l.godziny} className={`mt-1 text-sm ${i % 2 ? "justify-end" : ""}`} />
                    {(l.cechy.wege || l.cechy.wegan) && <span className={`${kaligrafia.className} text-lg text-[#4d8a42]`}>wege ✿</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="akwarela" />
    </div>
  );
}

export function LokalM16({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={PAPIER} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloAkwarela />
      <main id="tresc" className="mx-auto max-w-2xl px-5 pt-4">
        <Link href={adresM(nr)} className={`${kaligrafia.className} inline-flex items-center gap-1 text-xl`}>
          <ArrowLeft className="size-4" aria-hidden /> wszystkie miejsca
        </Link>
        <div className="mt-4 overflow-hidden shadow-[0_20px_50px_rgba(120,90,60,0.18)]" style={{ borderRadius: KSZTALTY[0] }}>
          <Miniatura lokal={lokal} className="aspect-[4/3]" sizes="100vw" priorytet />
        </div>
        <p className={`${kaligrafia.className} mt-5 text-center text-2xl text-akcent-tekst`}>zapraszamy do</p>
        <h1 className={`${pedzel.className} text-center text-[3rem] leading-[0.95] font-bold`}>{lokal.nazwa}</h1>
        <p className="mt-2 text-center text-tekst-2">{opisLokalu(lokal)}</p>
        <StatusOtwarcia godziny={lokal.godziny} className="mt-2 justify-center" />
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-tekst-2">
          <MapPin className="size-4" aria-hidden /> {pelnyAdres(lokal)}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className="flex h-14 items-center justify-center gap-2 rounded-full bg-tekst font-semibold text-tlo">
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className="flex h-14 items-center justify-center gap-2 rounded-full bg-karta/80 font-semibold ring-1 ring-obrys-2 backdrop-blur">
            <Navigation className="size-5" aria-hidden /> Prowadź
          </PrzyciskProwadz>
        </div>

        <section className="mt-10">
          <h2 className={`${pedzel.className} text-center text-4xl font-bold italic`}>Karta</h2>
          {menu ? (
            <MenuZakladki
              menu={menu}
              dostawa={dostawa}
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              telefon={lokal.telefon}
              wyglad={{
                pasek: "bg-tlo/85 backdrop-blur",
                aktywna: "bg-tekst text-tlo",
                nieaktywna: "bg-karta/80 ring-1 ring-obrys",
                naglowek: `${pedzel.className} text-3xl font-bold italic`,
                wiersz: "border-b border-obrys",
                miniatura: "rounded-[46%_54%_50%_50%/50%_44%_56%_50%]",
              }}
            />
          ) : (
            <p className={`${kaligrafia.className} mt-3 text-center text-2xl`}>Menu jeszcze przed nami — zadzwoń i zapytaj.</p>
          )}
        </section>
        {tydzien && (
          <section className="mt-10 rounded-[2rem] bg-karta/80 p-6 ring-1 ring-obrys backdrop-blur">
            <h2 className={`${pedzel.className} text-3xl font-bold italic`}>Godziny</h2>
            <div className="mt-2">
              <TabelaGodzin tydzien={tydzien} />
            </div>
          </section>
        )}
      </main>
      <StopkaM linki={linki} szaman="akwarela" />
    </div>
  );
}
