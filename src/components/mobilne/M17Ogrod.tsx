"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Leaf, MapPin, Navigation, Phone, Search, Sprout } from "lucide-react";
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
import { ogrodowy, tablica } from "./fonty";
import { adresM, losowe, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 17 · Ogród — zielono i świeżo: w tle powoli opadają i kołyszą się liście, u góry przebija słońce.
// Wege jest na pierwszym miejscu: duży przełącznik i rząd „Zielony wybór”. Na stronie lokalu menu jest
// napisane kredą na zielonej tablicy.

const ZIELEN = {
  "--color-tlo": "#f0f6ea",
  "--color-karta": "#ffffff",
  "--color-krem": "#e2eed9",
  "--color-tekst": "#1c2a1e",
  "--color-tekst-2": "#526352",
  "--color-obrys": "#d2e1c6",
  "--color-obrys-2": "#a8c398",
  "--color-otwarte": "#2e7d32",
  "--font-space-grotesk": ogrodowy.style.fontFamily,
  fontFamily: ogrodowy.style.fontFamily,
} as CSSProperties;

// tablica kredowa: ciemnozielone tło, kreda zamiast tekstu
const TABLICA = {
  "--color-tlo": "#1f3a2c",
  "--color-karta": "#24412f",
  "--color-krem": "#2b4c38",
  "--color-tekst": "#f3f1e7",
  "--color-tekst-2": "#c3d1bd",
  "--color-obrys": "rgba(255,255,255,0.14)",
  "--color-obrys-2": "rgba(255,255,255,0.3)",
  "--color-akcent-tekst": "#ffc58f",
  "--font-space-grotesk": tablica.style.fontFamily,
  colorScheme: "dark",
} as CSSProperties;

const los = losowe(17);
const LISCIE = Array.from({ length: 14 }, () => ({
  left: `${Math.round(los() * 100)}%`,
  size: 18 + Math.round(los() * 22),
  kolor: ["#4d8a42", "#7cbf6e", "#a3d17a", "#2e6b3a"][Math.floor(los() * 4)],
  czas: `${14 + Math.round(los() * 14)}s`,
  opoznienie: `${-Math.round(los() * 28)}s`,
}));

function TloOgrod() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="fixed inset-x-0 top-0 h-[60vh] bg-[radial-gradient(70%_60%_at_80%_0%,rgba(255,236,150,0.55),transparent)]" />
      {LISCIE.map((l, i) => (
        <span
          key={i}
          className="fixed top-0 animate-[m-lisc_linear_infinite]"
          style={{ left: l.left, animationDuration: l.czas, animationDelay: l.opoznienie }}
        >
          <Leaf style={{ width: l.size, height: l.size, color: l.kolor }} strokeWidth={1.5} className="fill-current opacity-60" />
        </span>
      ))}
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-95 ${
    aktywny ? "bg-[#2e6b3a] text-white" : "bg-white ring-1 ring-obrys"
  }`;

export function GlownaM17({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const zielone = lokale.filter((l) => l.cechy.wege || l.cechy.wegan);

  return (
    <div style={ZIELEN} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloOgrod />
      <header className="mx-auto flex h-16 max-w-2xl items-center px-5">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
        <span className={`${tablica.className} ml-auto text-2xl text-[#2e6b3a]`}>świeżo z okolicy</span>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative pt-2">
          <SzamanM styl="ogrod" className="pointer-events-none absolute -top-2 -right-2 w-28" />
          <h1 className="max-w-[72%] text-[2.6rem] leading-[1] font-bold">
            Co dziś <span className="text-[#2e6b3a]">szamiesz?</span>
          </h1>
          {/* przełącznik wege — duży, na samej górze */}
          <button
            type="button"
            role="switch"
            aria-checked={k.tylkoWege}
            onClick={() => k.setTylkoWege(!k.tylkoWege)}
            className="mt-5 flex w-full items-center gap-3 rounded-3xl bg-white p-3 text-left shadow-sm ring-1 ring-obrys"
          >
            <span className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition ${k.tylkoWege ? "bg-[#2e7d32]" : "bg-obrys-2"}`}>
              <span className={`flex size-6 items-center justify-center rounded-full bg-white shadow transition ${k.tylkoWege ? "translate-x-6" : ""}`}>
                <Leaf className="size-4 text-[#2e7d32]" aria-hidden />
              </span>
            </span>
            <span>
              <span className="block font-bold">Tylko wege</span>
              <span className="block text-sm text-tekst-2">{k.ileWege} lokali z daniami wegetariańskimi</span>
            </span>
          </button>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-3 flex h-14 items-center gap-2 rounded-3xl bg-white px-4 shadow-sm ring-1 ring-obrys"
          >
            <Search className="size-5 shrink-0 text-tekst-2" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Pizza, sałatka, nazwa lokalu…"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-tekst-2"
            />
          </form>
        </section>

        <BaneryReklamowe className="mt-6" />

        <section aria-labelledby="kategorie" className="mt-7">
          <h2 id="kategorie" className="text-2xl font-bold">
            Na co masz ochotę?
          </h2>
          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
            {k.kategorie.map((kat) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button key={kat.id} type="button" aria-pressed={aktywna} onClick={() => k.setKategoria(kat.id)} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5">
                  {/* kształt liścia */}
                  <span
                    className={`flex size-16 items-center justify-center rounded-tl-[2.2rem] rounded-br-[2.2rem] transition ${
                      aktywna ? "bg-[#2e6b3a] text-white shadow-lg" : "bg-white ring-1 ring-obrys"
                    }`}
                  >
                    <IkonaTypu ikona={kat.ikona} className="size-7" />
                  </span>
                  <span className="text-xs font-semibold whitespace-nowrap">{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        {zielone.length > 0 && !k.tylkoWege && (
          <section aria-labelledby="zielony" className="mt-6">
            <h2 id="zielony" className={`${tablica.className} flex items-center gap-2 text-3xl text-[#2e6b3a]`}>
              <Sprout className="size-6" aria-hidden /> Zielony wybór
            </h2>
            <div className="-mx-5 mt-2 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
              {zielone.map((l) => (
                <Link key={l.id} href={lokalM(nr, l.slug)} className="w-40 shrink-0 overflow-hidden rounded-3xl bg-white ring-1 ring-obrys">
                  <Miniatura lokal={l} className="h-24" sizes="160px" dopisek={false} />
                  <span className="block truncate px-3 pt-2 text-sm font-bold">{l.nazwa}</span>
                  <span className="flex items-center gap-1 px-3 pb-3 text-xs font-semibold text-[#2e7d32]">
                    <Leaf className="size-3.5" aria-hidden /> dania wege
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="wyniki" aria-label="Lokale" className="mt-6 scroll-mt-4">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="bg-[#2e7d32] text-white ring-0" />
          <h2 className="mt-3 text-2xl font-bold">
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-3 space-y-3">
            {k.wyniki.map((l) => (
              <li key={l.id} className="pojawianie">
                <Link href={lokalM(nr, l.slug)} className="flex items-center gap-3 rounded-3xl rounded-tl-[3rem] bg-white p-2.5 shadow-sm ring-1 ring-obrys">
                  <Miniatura lokal={l} className="size-20 shrink-0 rounded-2xl rounded-tl-[2.4rem]" dopisek={false} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-bold">{l.nazwa}</span>
                    <span className="block truncate text-sm text-tekst-2">{opisLokalu(l)}</span>
                    <StatusOtwarcia godziny={l.godziny} className="text-sm" />
                  </span>
                  {(l.cechy.wege || l.cechy.wegan) && (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e2f2dc]">
                      <Leaf className="size-5 text-[#2e7d32]" aria-label="wege" />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="ogrod" />
    </div>
  );
}

export function LokalM17({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);
  const wege = lokal.cechy.wege || lokal.cechy.wegan;

  return (
    <div style={ZIELEN} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloOgrod />
      <main id="tresc" className="mx-auto max-w-2xl px-5 pt-4">
        <Link href={adresM(nr)} aria-label="Wszystkie lokale" className="flex size-11 items-center justify-center rounded-full bg-white ring-1 ring-obrys">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="mt-4 overflow-hidden rounded-[2rem] rounded-tl-[4rem] shadow-md">
          <Miniatura lokal={lokal} className="h-60" sizes="100vw" priorytet />
        </div>
        <h1 className="mt-5 text-[2.4rem] leading-[1] font-bold">{lokal.nazwa}</h1>
        <p className="mt-1 text-tekst-2">{opisLokalu(lokal)}</p>
        {wege && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e2f2dc] px-3 py-1 text-sm font-bold text-[#2e7d32]">
            <Leaf className="size-4" aria-hidden /> Są dania wege
          </p>
        )}
        <StatusOtwarcia godziny={lokal.godziny} className="mt-2" />
        <p className="mt-1 flex items-center gap-1.5 text-sm text-tekst-2">
          <MapPin className="size-4" aria-hidden /> {pelnyAdres(lokal)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#2e6b3a] font-bold text-white">
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className="flex h-14 items-center justify-center gap-2 rounded-full bg-white font-bold ring-1 ring-obrys-2">
            <Navigation className="size-5" aria-hidden /> Prowadź
          </PrzyciskProwadz>
        </div>

        {menu ? (
          <section style={TABLICA} className="relative mt-8 overflow-hidden rounded-[1.25rem] border-[10px] border-[#8a5a32] bg-tlo px-4 pb-6 text-tekst shadow-xl">
            <div aria-hidden className="m-ziarno pointer-events-none !absolute !inset-0 !opacity-[0.12]" />
            <div className="[&_#menu-tytul]:text-5xl">
              <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} numerowane />
            </div>
          </section>
        ) : (
          <p className={`${tablica.className} mt-8 text-3xl`}>Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
        )}
        {tydzien && (
          <section className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-obrys">
            <h2 className="text-xl font-bold">Godziny otwarcia</h2>
            <div className="mt-2">
              <TabelaGodzin tydzien={tydzien} />
            </div>
          </section>
        )}
      </main>
      <StopkaM linki={linki} szaman="ogrod" />
    </div>
  );
}
