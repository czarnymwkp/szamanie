"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, Clapperboard, Leaf, MapPin, Navigation, Phone, Search, Ticket } from "lucide-react";
import { dzienTygodnia, opisDnia, parsujGodziny } from "@/lib/godziny";
import type { Lokal } from "@/lib/lokale";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { useKatalog } from "../useKatalog";
import { useTeraz } from "../useTeraz";
import FiltryM from "./FiltryM";
import MenuZakladki from "./MenuZakladki";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { afisz, neonKino } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 20 · Kino — stare kino: czerwone kurtyny po bokach, reflektory omiatają salę, ziarno taśmy filmowej,
// szyld z mrugającymi żarówkami. „Teraz grane” = otwarte teraz, lokale to plakaty filmowe, kategorie to
// gatunki, banery to „reklamy przed seansem”, menu to obsada.

const SALA = {
  "--color-tlo": "#0e0a0a",
  "--color-karta": "#1b1414",
  "--color-krem": "#271d1d",
  "--color-tekst": "#f7efe4",
  "--color-tekst-2": "#b9aa99",
  "--color-obrys": "#33262a",
  "--color-obrys-2": "#4d3a3e",
  "--color-akcent-tekst": "#ffb46b",
  "--color-otwarte": "#7ee6a1",
  "--color-zamkniete": "#ff9a9a",
  "--font-space-grotesk": afisz.style.fontFamily,
  colorScheme: "dark",
} as CSSProperties;


function TloKino() {
  const kurtyna =
    "repeating-linear-gradient(90deg,#5c0a12 0px,#8e1622 14px,#b3222f 22px,#8e1622 30px,#5c0a12 44px)";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="fixed inset-y-0 left-0 w-7 shadow-[8px_0_20px_rgba(0,0,0,0.6)]" style={{ background: kurtyna }} />
      <div className="fixed inset-y-0 right-0 w-7 shadow-[-8px_0_20px_rgba(0,0,0,0.6)]" style={{ background: kurtyna }} />
      {/* reflektory: dwa stożki światła z góry, kołyszą się */}
      <div className="fixed -top-10 left-[15%] h-[85vh] w-56 origin-top animate-[m-reflektor_9s_ease-in-out_infinite_alternate] bg-[linear-gradient(to_bottom,rgba(255,236,190,0.18),transparent)] [clip-path:polygon(45%_0,55%_0,100%_100%,0_100%)]" />
      <div className="fixed -top-10 right-[15%] h-[85vh] w-56 origin-top animate-[m-reflektor_11s_ease-in-out_infinite_alternate-reverse] bg-[linear-gradient(to_bottom,rgba(255,236,190,0.14),transparent)] [clip-path:polygon(45%_0,55%_0,100%_100%,0_100%)]" />
      <div className="m-ziarno !opacity-[0.1]" />
    </div>
  );
}

/** Szyld z żarówkami dookoła (mrugają na zmianę). */
function Szyld({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-xl border-4 border-[#b8862b] bg-[#1b1010] px-4 py-5 text-center shadow-[0_0_40px_rgba(255,180,80,0.25)]">
      <span
        aria-hidden
        className="absolute inset-1 rounded-lg [background:radial-gradient(circle,#ffe8a8_2.5px,transparent_3px)_0_0/16px_16px] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)] animate-[m-zarowki_1.2s_steps(2)_infinite] p-[6px]"
      />
      {children}
    </div>
  );
}

function Plakat({ lokal, nr, k }: { lokal: Lokal; nr: number; k: ReturnType<typeof useKatalog> }) {
  return (
    <Link href={lokalM(nr, lokal.slug)} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-md shadow-[0_14px_30px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
        <Miniatura lokal={lokal} className="size-full transition duration-500 group-hover:scale-105" sizes="50vw" dopisek={false} />
        <span className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />
        <span className={`${afisz.className} absolute top-2 left-2 text-xs tracking-[0.3em] text-white/80`}>SZAMANIE PRZEDSTAWIA</span>
        <span className="absolute inset-x-2 bottom-2">
          <span className={`${neonKino.className} block text-[1.35rem] leading-[1.05] text-white`}>{lokal.nazwa}</span>
          <span className={`${afisz.className} mt-1 block text-sm tracking-wider text-[#ffd36b]`}>{opisLokalu(lokal).split(" · ").slice(0, 2).join(" / ")}</span>
          {k.czyOtwarte(lokal) && <span className={`${afisz.className} mt-1 inline-block bg-[#7ee6a1] px-1.5 text-xs tracking-wider text-black`}>TERAZ GRANE</span>}
        </span>
        {(lokal.cechy.wege || lokal.cechy.wegan) && <Leaf className="absolute top-2 right-2 size-5 text-[#7ee6a1]" aria-label="wege" />}
      </div>
    </Link>
  );
}

const chip = (aktywny: boolean) =>
  `${afisz.className} flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-lg tracking-wider ring-1 ${aktywny ? "bg-[#ffd36b] text-black ring-[#ffd36b]" : "bg-karta ring-white/15"}`;

export function GlownaM20({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const grane = lokale.filter(k.czyOtwarte);

  return (
    <div style={SALA} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloKino />
      <main id="tresc" className="mx-auto max-w-2xl px-9 pt-5">
        <Szyld>
          <SzamanM styl="kino" className="pointer-events-none mx-auto -mt-1 w-24" />
          <p className={`${afisz.className} mt-1 text-sm tracking-[0.4em] text-[#ffd36b]`}>KINO SZAMANIE · KRAŚNIK</p>
          <h1 className={`${neonKino.className} mt-1 text-[2.3rem] leading-[1.05] text-[#fff4dc] [text-shadow:0_0_14px_rgba(255,200,120,0.75)]`}>Co dziś szamiesz?</h1>
          <p className={`${afisz.className} mt-2 text-lg tracking-wider text-tekst-2`}>W repertuarze {lokale.length} lokali</p>
        </Szyld>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-5 flex h-14 items-center gap-2 rounded-full bg-karta pr-2 pl-4 ring-1 ring-[#b8862b]/60"
        >
          <Search className="size-5 shrink-0 text-[#ffd36b]" aria-hidden />
          <input
            type="search"
            value={k.szukaj}
            onChange={(e) => k.setSzukaj(e.target.value)}
            placeholder="Szukaj w repertuarze…"
            aria-label="Szukaj lokalu"
            className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-tekst-2"
          />
          <button
            type="button"
            onClick={() => k.setTylkoWege(!k.tylkoWege)}
            aria-pressed={k.tylkoWege}
            aria-label="Tylko wege"
            className={`flex size-10 items-center justify-center rounded-full ${k.tylkoWege ? "bg-[#7ee6a1] text-black" : "text-[#7ee6a1]"}`}
          >
            <Leaf className="size-5" aria-hidden />
          </button>
        </form>

        <section aria-label="Reklamy przed seansem" className="mt-6">
          <p className={`${afisz.className} mb-2 text-lg tracking-[0.25em] text-tekst-2`}>REKLAMY PRZED SEANSEM</p>
          <BaneryReklamowe ciemne className="[--promien-reklamy:0.5rem]" />
        </section>

        {grane.length > 0 && (
          <section aria-labelledby="grane" className="mt-7">
            <h2 id="grane" className={`${neonKino.className} flex items-center gap-2 text-2xl text-[#fff4dc]`}>
              <Clapperboard className="size-6 text-[#ffd36b]" aria-hidden /> Teraz grane
            </h2>
            <div className="-mx-9 mt-3 flex gap-3 overflow-x-auto px-9 pb-3 [scrollbar-width:none]">
              {grane.map((l) => (
                <div key={l.id} className="w-36 shrink-0">
                  <Plakat lokal={l} nr={nr} k={k} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="kategorie" className="mt-6">
          <h2 id="kategorie" className={`${neonKino.className} text-2xl text-[#fff4dc]`}>
            Na co masz ochotę?
          </h2>
          <p className={`${afisz.className} text-base tracking-[0.25em] text-tekst-2`}>WYBIERZ GATUNEK</p>
          <div className="-mx-9 mt-2 flex gap-2 overflow-x-auto px-9 pb-2 [scrollbar-width:none]">
            {k.kategorie.map((kat) => (
              <button key={kat.id} type="button" aria-pressed={k.kategoria === kat.id} onClick={() => k.setKategoria(kat.id)} className={`${chip(k.kategoria === kat.id)} pl-3`}>
                <IkonaTypu ikona={kat.ikona} className="size-5" /> {kat.nazwa.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-6 scroll-mt-4">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="!bg-[#7ee6a1] !text-black" />
          <h2 className={`${neonKino.className} mt-3 text-2xl text-[#fff4dc]`}>
            Repertuar · {k.wyniki.length} {odmiana(k.wyniki.length, ["tytuł", "tytuły", "tytułów"])}
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-4">
            {k.wyniki.map((l) => (
              <li key={l.id} className="pojawianie">
                <Plakat lokal={l} nr={nr} k={k} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="kino" />
    </div>
  );
}

export function LokalM20({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const teraz = useTeraz();
  const tydzien = parsujGodziny(lokal.godziny);
  const dzis = tydzien && teraz ? opisDnia(tydzien[dzienTygodnia(teraz)]) : null;

  return (
    <div style={SALA} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloKino />
      <main id="tresc" className="mx-auto max-w-2xl px-9 pt-4">
        <Link href={adresM(nr)} className={`${afisz.className} inline-flex items-center gap-1 text-lg tracking-wider text-tekst-2`}>
          <ArrowLeft className="size-4" aria-hidden /> CAŁY REPERTUAR
        </Link>
        <div className="relative mx-auto mt-3 aspect-[2/3] max-w-xs overflow-hidden rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          <Miniatura lokal={lokal} className="size-full" sizes="320px" priorytet dopisek={false} />
          <span className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />
          <span className={`${afisz.className} absolute inset-x-0 top-3 text-center text-sm tracking-[0.35em] text-white/80`}>SZAMANIE PRZEDSTAWIA</span>
          <div className="absolute inset-x-4 bottom-4 text-center">
            <h1 className={`${neonKino.className} text-[2.1rem] leading-[1.05] text-white [text-shadow:0_0_16px_rgba(255,200,120,0.6)]`}>{lokal.nazwa}</h1>
            <p className={`${afisz.className} mt-1 text-lg tracking-wider text-[#ffd36b]`}>{opisLokalu(lokal).split(" · ").slice(0, 3).join(" / ")}</p>
          </div>
        </div>
        <div className="mt-5 text-center">
          <StatusOtwarcia godziny={lokal.godziny} ciemne className="justify-center" />
          {dzis && <p className={`${afisz.className} mt-1 text-xl tracking-wider`}>SEANSE DZIŚ: {dzis}</p>}
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-tekst-2">
            <MapPin className="size-4" aria-hidden /> {pelnyAdres(lokal)}
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className={`${afisz.className} flex h-14 items-center justify-center gap-2 rounded-md bg-[#ffd36b] text-2xl tracking-wider text-black shadow-[0_0_30px_rgba(255,211,107,0.35)]`}>
              <Ticket className="size-5" aria-hidden /> REZERWUJ
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className={`${afisz.className} flex h-14 items-center justify-center gap-2 rounded-md text-2xl tracking-wider ring-1 ring-white/25`}>
            <Navigation className="size-5" aria-hidden /> DOJAZD
          </PrzyciskProwadz>
        </div>
        {lokal.telefon && (
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-tekst-2">
            <Phone className="size-3.5" aria-hidden /> „Rezerwuj” dzwoni do lokalu: {lokal.telefon}
          </p>
        )}

        <section className="mt-10">
          <h2 className={`${neonKino.className} text-3xl text-[#fff4dc]`}>Obsada (menu)</h2>
          {menu ? (
            <MenuZakladki
              menu={menu}
              dostawa={dostawa}
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              telefon={lokal.telefon}
              wyglad={{
                pasek: "bg-tlo/90 backdrop-blur",
                aktywna: "bg-[#ffd36b] text-black",
                nieaktywna: "bg-karta ring-1 ring-white/10",
                naglowek: `${neonKino.className} text-2xl text-[#fff4dc]`,
                wiersz: "border-b border-white/10",
                miniatura: "rounded-md",
              }}
            />
          ) : (
            <p className="mt-2 text-tekst-2">Obsada jeszcze nieznana — zadzwoń i zapytaj.</p>
          )}
        </section>
        {tydzien && (
          <section className="mt-10 rounded-md bg-karta p-5 ring-1 ring-white/10">
            <h2 className={`${neonKino.className} text-2xl text-[#fff4dc]`}>Repertuar tygodnia</h2>
            <div className="mt-2">
              <TabelaGodzin tydzien={tydzien} />
            </div>
          </section>
        )}
      </main>
      <StopkaM linki={linki} szaman="kino" />
    </div>
  );
}

