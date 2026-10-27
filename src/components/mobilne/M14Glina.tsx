"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Clock, Leaf, MapPin, Navigation, Phone, Search } from "lucide-react";
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
import { okragly } from "./fonty";
import { adresM, losowe, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 14 · Glina — „claymorphism”: wszystko wygląda jak miękka, napompowana plastelina (cień wewnętrzny z jasnym
// brzegiem u góry i ciemnym u dołu), cukierkowe kolory, zaokrąglony krój. W tle unoszą się kulki gliny.
// Przyciski sprężynują pod palcem.

const CUKIERKI = {
  "--color-tlo": "#f2ebff",
  "--color-karta": "#ffffff",
  "--color-krem": "#fbeaff",
  "--color-tekst": "#2b2046",
  "--color-tekst-2": "#6b5f86",
  "--color-obrys": "#e4d9f6",
  "--color-obrys-2": "#cbbdea",
  "--color-na-akcencie": "#2b2046",
  "--font-space-grotesk": okragly.style.fontFamily,
  fontFamily: okragly.style.fontFamily,
} as CSSProperties;

const KOLORY = ["#ffd6e8", "#d6f0ff", "#ffeab8", "#d9f7e3", "#e5dcff", "#ffdccc"];
const glina = (kolor?: string) => ({ ["--kolor-gliny" as string]: kolor }) as CSSProperties;
const sprezyna = "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.93]";

const los = losowe(14);
const KULKI = Array.from({ length: 7 }, (_, i) => ({
  left: `${Math.round(los() * 92)}%`,
  top: `${Math.round(los() * 92)}%`,
  size: 50 + Math.round(los() * 90),
  kolor: ["#ff9ec7", "#8fd3ff", "#ffd36e", "#8be3b0", "#b9a8ff", "#ffb38a", "#ff6400"][i],
  opoznienie: `${-Math.round(los() * 6)}s`,
}));

function TloKulki() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      {KULKI.map((k, i) => (
        <span
          key={i}
          className="fixed animate-unoszenie rounded-full"
          style={{
            left: k.left,
            top: k.top,
            width: k.size,
            height: k.size,
            animationDelay: k.opoznienie,
            animationDuration: `${6 + i}s`,
            background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${k.kolor} 34%, color-mix(in oklab, ${k.kolor} 70%, #2b2046) 100%)`,
            boxShadow: "0 18px 30px rgba(43,32,70,0.15)",
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `m-glina flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ${sprezyna} ${aktywny ? "[--kolor-gliny:#ff8a3d]" : ""}`;

export function GlownaM14({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);

  return (
    <div style={CUKIERKI} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloKulki />
      <header className="sticky top-0 z-40 px-4 pt-3">
        <div className="m-glina mx-auto flex h-14 max-w-2xl items-center rounded-full px-5" style={glina("#ffffff")}>
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-4">
        <section className="m-glina relative mt-5 overflow-hidden rounded-[2.5rem] p-6" style={glina("#ffe3c7")}>
          <SzamanM styl="glina" className="pointer-events-none absolute -right-2 -bottom-1 w-32" />
          <h1 className="max-w-[70%] text-[2.5rem] leading-[1] font-bold">Co dziś szamiesz?</h1>
          <p className="mt-2 max-w-[60%] font-medium text-tekst-2">{lokale.length} lokali, wszystkie mięciutkie.</p>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="m-glina relative mt-5 flex h-14 max-w-[85%] items-center gap-2 rounded-full pr-1.5 pl-4"
            style={glina("#ffffff")}
          >
            <Search className="size-5 shrink-0 text-tekst-2" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Pizza, kebab…"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:text-tekst-2"
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`m-glina flex size-11 items-center justify-center rounded-full ${sprezyna}`}
              style={glina(k.tylkoWege ? "#4ade80" : "#d9f7e3")}
            >
              <Leaf className="size-5 text-[#166534]" aria-hidden />
            </button>
          </form>
        </section>

        <BaneryReklamowe className="mt-6 [--promien-reklamy:2.25rem]" />

        <section aria-labelledby="kategorie" className="mt-6">
          <h2 id="kategorie" className="text-2xl font-bold">
            Na co masz ochotę?
          </h2>
          <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pt-2 pb-4 [scrollbar-width:none]">
            {k.kategorie.map((kat, i) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button key={kat.id} type="button" aria-pressed={aktywna} onClick={() => k.setKategoria(kat.id)} className={`flex w-[4.75rem] shrink-0 flex-col items-center gap-2 ${sprezyna}`}>
                  <span
                    className={`m-glina flex size-[4.5rem] items-center justify-center rounded-[1.8rem] transition ${aktywna ? "scale-110" : ""}`}
                    style={glina(aktywna ? "#ff8a3d" : KOLORY[i % KOLORY.length])}
                  >
                    <IkonaTypu ikona={kat.ikona} className="size-8" />
                  </span>
                  <span className="text-xs font-semibold whitespace-nowrap">{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-2 scroll-mt-20">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="[--kolor-gliny:#4ade80]" />
          <h2 className="mt-3 text-2xl font-bold">
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2">
            {k.wyniki.map((l, i) => (
              <li key={l.id} className="pojawianie">
                <Link href={lokalM(nr, l.slug)} className={`m-glina block rounded-[2.25rem] p-3 ${sprezyna}`} style={glina(KOLORY[i % KOLORY.length])}>
                  <Miniatura lokal={l} className="h-40 rounded-[1.75rem] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.6)]" sizes="(min-width: 640px) 320px, 100vw" />
                  <div className="px-2 pt-3 pb-1">
                    <h3 className="text-xl leading-tight font-bold">{l.nazwa}</h3>
                    <p className="truncate text-sm font-medium text-tekst-2">{opisLokalu(l)}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <StatusOtwarcia godziny={l.godziny} />
                      {(l.cechy.wege || l.cechy.wegan) && <Leaf className="size-4 text-[#15803d]" aria-label="wege" />}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="glina" />
    </div>
  );
}

export function LokalM14({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={CUKIERKI} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloKulki />
      <main id="tresc" className="mx-auto max-w-2xl px-4 pt-4">
        <Link href={adresM(nr)} aria-label="Wszystkie lokale" className={`m-glina flex size-12 items-center justify-center rounded-full ${sprezyna}`} style={glina("#ffffff")}>
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <section className="m-glina mt-4 rounded-[2.5rem] p-3" style={glina("#ffe3c7")}>
          <Miniatura lokal={lokal} className="h-56 rounded-[2rem]" sizes="100vw" priorytet />
          <div className="px-3 pt-4 pb-2">
            <h1 className="text-[2.2rem] leading-[1.02] font-bold">{lokal.nazwa}</h1>
            <p className="mt-1 font-medium text-tekst-2">{opisLokalu(lokal)}</p>
            <StatusOtwarcia godziny={lokal.godziny} className="mt-2" />
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-tekst-2">
              <MapPin className="size-4" aria-hidden /> {pelnyAdres(lokal)}
            </p>
          </div>
        </section>
        <div className="mt-5 grid grid-cols-2 gap-4">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className={`m-glina flex h-16 items-center justify-center gap-2 rounded-[1.75rem] text-lg font-bold ${sprezyna}`} style={glina("#ff8a3d")}>
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className={`m-glina flex h-16 items-center justify-center gap-2 rounded-[1.75rem] text-lg font-bold ${sprezyna}`}>
            <Navigation className="size-5" aria-hidden /> Prowadź
          </PrzyciskProwadz>
        </div>

        <section className="m-glina mt-6 rounded-[2.25rem] px-5 pt-2 pb-5" style={glina("#ffffff")}>
          {menu ? (
            <MenuZakladki
              menu={menu}
              dostawa={dostawa}
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              telefon={lokal.telefon}
              wyglad={{
                pasek: "bg-white/90 backdrop-blur rounded-b-3xl",
                aktywna: "m-glina [--kolor-gliny:#ff8a3d]",
                nieaktywna: "m-glina [--kolor-gliny:#f2ebff]",
                naglowek: "text-2xl font-bold",
                wiersz: "border-b-2 border-dotted border-obrys",
                miniatura: "rounded-[1.5rem] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.7)]",
              }}
            />
          ) : (
            <p className="pt-3 font-medium text-tekst-2">Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
          )}
        </section>
        {tydzien && (
          <section className="m-glina mt-5 rounded-[2.25rem] p-5" style={glina("#d6f0ff")}>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Clock className="size-5" aria-hidden /> Godziny
            </h2>
            <div className="mt-2">
              <TabelaGodzin tydzien={tydzien} />
            </div>
          </section>
        )}
      </main>
      <StopkaM linki={linki} szaman="glina" />
    </div>
  );
}
