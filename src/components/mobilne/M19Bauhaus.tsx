"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Leaf, Navigation, Phone, Search } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import MenuLokalu from "../menu/MenuLokalu";
import { useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { spartan } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 19 · Bauhaus — szkoła z Dessau: koło, kwadrat i trójkąt w kolorach podstawowych powoli krążą w tle,
// geometryczny krój, ostre krawędzie, asymetria. Każda kategoria ma swój kształt i kolor.

const CZERWONY = "#e63323";
const NIEBIESKI = "#1f4fa3";
const ZOLTY = "#f7c600";

const BAUHAUS = {
  "--color-tlo": "#f3eee3",
  "--color-karta": "#ffffff",
  "--color-krem": "#e9e2d3",
  "--color-tekst": "#1d1d1b",
  "--color-tekst-2": "#4a4944",
  "--color-obrys": "#d9d1c1",
  "--color-obrys-2": "#1d1d1b",
  "--color-akcent": CZERWONY,
  "--color-akcent-tekst": "#b3241a",
  "--color-na-akcencie": "#ffffff",
  "--font-space-grotesk": spartan.style.fontFamily,
  fontFamily: spartan.style.fontFamily,
} as CSSProperties;

const KSZTALTY = [
  { kolor: ZOLTY, ksztalt: "rounded-full" },
  { kolor: CZERWONY, ksztalt: "" },
  { kolor: NIEBIESKI, ksztalt: "[clip-path:polygon(50%_0,100%_100%,0_100%)]" },
];

function TloBauhaus() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(29,29,27,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(29,29,27,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <span className="fixed -top-20 -right-24 size-72 animate-[obrot_60s_linear_infinite] rounded-full border-[28px] opacity-25" style={{ borderColor: ZOLTY, borderRightColor: "transparent" }} />
      <span className="fixed top-[38%] -left-16 size-40 animate-[obrot_45s_linear_infinite_reverse] opacity-20" style={{ background: NIEBIESKI }} />
      <span className="fixed right-4 bottom-[12%] size-44 animate-unoszenie opacity-20 [clip-path:polygon(50%_0,100%_100%,0_100%)]" style={{ background: CZERWONY }} />
      <span className="fixed bottom-[40%] left-[45%] h-1 w-56 rotate-[-30deg] bg-tekst opacity-15" />
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 px-4 text-sm font-bold uppercase tracking-wide ${aktywny ? "bg-tekst text-white" : "bg-karta ring-2 ring-tekst"}`;

export function GlownaM19({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);

  return (
    <div style={BAUHAUS} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloBauhaus />
      <header className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-5">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
        <span aria-hidden className="ml-auto flex gap-1.5">
          <span className="size-4 rounded-full" style={{ background: ZOLTY }} />
          <span className="size-4" style={{ background: CZERWONY }} />
          <span className="size-4 [clip-path:polygon(50%_0,100%_100%,0_100%)]" style={{ background: NIEBIESKI }} />
        </span>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative grid grid-cols-[1fr_auto] items-end pt-4">
          <div className="relative">
            <span aria-hidden className="absolute -top-4 -left-6 size-40 rounded-full" style={{ background: ZOLTY }} />
            <h1 className="relative text-[2.8rem] leading-[0.88] font-black tracking-tight uppercase">
              Co dziś
              <br />
              <span className="whitespace-nowrap">
                <span className="inline-block px-2 pt-2 text-white" style={{ background: CZERWONY }}>
                  szamiesz
                </span>
                <span style={{ color: NIEBIESKI }}>?</span>
              </span>
            </h1>
          </div>
          <SzamanM styl="bauhaus" className="w-28" />
        </section>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-6 flex h-14 items-stretch bg-tekst text-white"
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 px-4">
            <Search className="size-5 shrink-0" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="SZUKAJ"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-bold tracking-wide uppercase outline-none placeholder:text-white/50"
            />
          </label>
          <button
            type="button"
            onClick={() => k.setTylkoWege(!k.tylkoWege)}
            aria-pressed={k.tylkoWege}
            aria-label="Tylko wege"
            className="flex w-14 items-center justify-center rounded-full"
            style={{ background: k.tylkoWege ? "#2e8b3a" : ZOLTY, color: "#1d1d1b" }}
          >
            <Leaf className="size-6" aria-hidden />
          </button>
          <button type="submit" aria-label="Pokaż wyniki" className="flex w-14 items-center justify-center" style={{ background: NIEBIESKI }}>
            <ArrowRight className="size-6" aria-hidden />
          </button>
        </form>

        <BaneryReklamowe className="mt-6 [--promien-reklamy:0px]" />

        <section aria-labelledby="kategorie" className="mt-8">
          <h2 id="kategorie" className="text-2xl font-black tracking-tight uppercase">
            Na co masz ochotę?
          </h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {k.kategorie.map((kat, i) => {
              const aktywna = k.kategoria === kat.id;
              const { kolor, ksztalt } = KSZTALTY[i % KSZTALTY.length];
              return (
                <button key={kat.id} type="button" aria-pressed={aktywna} onClick={() => k.setKategoria(kat.id)} className="flex flex-col items-center gap-1">
                  <span
                    className={`flex aspect-square w-full items-center justify-center pt-1 transition ${ksztalt} ${aktywna ? "scale-110" : ""}`}
                    style={{ background: aktywna ? "#1d1d1b" : kolor, color: aktywna || kolor !== ZOLTY ? "#fff" : "#1d1d1b" }}
                  >
                    <IkonaTypu ikona={kat.ikona} className="size-6" />
                  </span>
                  <span className="w-full truncate text-center text-[10px] font-bold tracking-wide uppercase">{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-8 scroll-mt-4">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="!bg-[#2e8b3a] !text-white !ring-[#2e8b3a]" />
          <h2 className="mt-3 text-2xl font-black uppercase">
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {k.wyniki.map((l, i) => {
              const { kolor } = KSZTALTY[i % KSZTALTY.length];
              return (
                <li key={l.id} className={`pojawianie ${i % 5 === 0 ? "col-span-2" : ""}`}>
                  <Link href={lokalM(nr, l.slug)} className="block bg-karta ring-2 ring-tekst">
                    <div className="relative">
                      <Miniatura lokal={l} className={i % 5 === 0 ? "h-44" : "aspect-square"} sizes={i % 5 === 0 ? "100vw" : "50vw"} dopisek={false} />
                      <span aria-hidden className={`absolute -bottom-4 ${i % 2 ? "left-3" : "right-3"} size-8 ${KSZTALTY[(i + 1) % 3].ksztalt}`} style={{ background: kolor }} />
                    </div>
                    <div className="border-t-2 border-tekst p-3">
                      <h3 className="text-lg leading-none font-black uppercase">{l.nazwa}</h3>
                      <p className="mt-1 truncate text-xs font-semibold text-tekst-2">{opisLokalu(l)}</p>
                      <StatusOtwarcia godziny={l.godziny} className="mt-1 text-xs" />
                      {(l.cechy.wege || l.cechy.wegan) && <Leaf className="mt-1 size-4 text-[#2e8b3a]" aria-label="wege" />}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="bauhaus" />
    </div>
  );
}

export function LokalM19({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={BAUHAUS} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloBauhaus />
      <main id="tresc" className="mx-auto max-w-2xl px-5 pt-4">
        <Link href={adresM(nr)} className="inline-flex items-center gap-2 text-sm font-black tracking-wide uppercase">
          <ArrowLeft className="size-4" aria-hidden /> Wszystkie
        </Link>
        <div className="relative mt-5 grid grid-cols-[1fr_1fr] gap-0">
          <div className="aspect-square overflow-hidden rounded-full ring-4 ring-tekst">
            <Miniatura lokal={lokal} className="size-full" sizes="50vw" priorytet />
          </div>
          <div className="flex flex-col justify-between p-3" style={{ background: ZOLTY }}>
            <span className="size-10" style={{ background: CZERWONY }} />
            <StatusOtwarcia godziny={lokal.godziny} className="text-sm" />
          </div>
          <span aria-hidden className="absolute -bottom-5 left-1/3 size-12 [clip-path:polygon(50%_0,100%_100%,0_100%)]" style={{ background: NIEBIESKI }} />
        </div>
        <h1 className="mt-8 text-[2.9rem] leading-[0.9] font-black tracking-tight uppercase">{lokal.nazwa}</h1>
        <p className="mt-2 font-semibold text-tekst-2">{opisLokalu(lokal)}</p>
        <p className="mt-1 text-sm font-semibold">{pelnyAdres(lokal)}</p>
        <div className="mt-5 grid grid-cols-2">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className="flex h-16 items-center justify-center gap-2 font-black tracking-wide text-white uppercase" style={{ background: CZERWONY }}>
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className="flex h-16 items-center justify-center gap-2 font-black tracking-wide text-white uppercase" aria-label="Prowadź do lokalu">
            <span className="flex size-full items-center justify-center gap-2" style={{ background: NIEBIESKI }}>
              <Navigation className="size-5" aria-hidden /> Prowadź
            </span>
          </PrzyciskProwadz>
        </div>

        {menu ? (
          <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} numerowane belki />
        ) : (
          <p className="mt-8 font-bold">Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
        )}
        {tydzien && (
          <section className="mt-10 ring-2 ring-tekst">
            <h2 className="bg-tekst px-4 py-2 font-black tracking-wide text-white uppercase">Godziny</h2>
            <div className="bg-karta p-4">
              <TabelaGodzin tydzien={tydzien} />
            </div>
          </section>
        )}
      </main>
      <StopkaM linki={linki} szaman="bauhaus" />
    </div>
  );
}
