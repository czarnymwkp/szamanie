"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, Leaf, Navigation, Phone, Search } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import type { Lokal } from "@/lib/lokale";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import MenuLokalu from "../menu/MenuLokalu";
import { useKatalog } from "../useKatalog";
import { useTeraz } from "../useTeraz";
import FiltryM from "./FiltryM";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { gazetowy, winieta } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 12 · Gazeta — „Kurier Szamański”: papier gazetowy, winieta, kreski, działy jak w gazecie. Banery to
// „ogłoszenia płatne”, lokal otwarty najdłużej to artykuł na pierwszej stronie, reszta to ogłoszenia drobne
// w dwóch szpaltach. Zdjęcia w rastrze druku. Strona lokalu to artykuł z menu jak cennik w ramce.

const PAPIER = {
  "--color-tlo": "#f1ece1",
  "--color-karta": "#f7f3ea",
  "--color-krem": "#e6dfd0",
  "--color-tekst": "#171411",
  "--color-tekst-2": "#4d483f",
  "--color-obrys": "#cfc5b3",
  "--color-obrys-2": "#171411",
  "--color-akcent": "#e2541a",
  "--color-akcent-tekst": "#a83a0c",
  "--font-space-grotesk": gazetowy.style.fontFamily,
  fontFamily: gazetowy.style.fontFamily,
} as CSSProperties;

const DATA = new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function TloGazeta() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="m-ziarno !opacity-[0.07]" />
      {/* zgięcie gazety na środku */}
      <div className="fixed inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent" />
    </div>
  );
}

/** Zdjęcie jak w gazecie: szarość, kontrast i siatka rastra. */
function Raster({ lokal, className = "" }: { lokal: Lokal; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Miniatura lokal={lokal} className="size-full [filter:grayscale(1)_contrast(1.35)_brightness(1.05)]" dopisek={false} />
      <span className="absolute inset-0 bg-[radial-gradient(#171411_0.9px,transparent_1.3px)] bg-[length:4px_4px] opacity-35 mix-blend-multiply" />
    </div>
  );
}

const Kreska = ({ podwojna = false }: { podwojna?: boolean }) => (
  <div aria-hidden className={podwojna ? "my-2 h-1.5 border-y border-tekst" : "my-2 border-t border-tekst"} />
);

function Dzial({ tytul, children }: { tytul: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="border-y-2 border-tekst py-1 text-center text-xs font-bold tracking-[0.3em] uppercase">{tytul}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function GlownaM12({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const teraz = useTeraz();
  const otwarte = lokale.filter(k.czyOtwarte).length;
  const czolowka = k.doPozna[0];
  const chip = (aktywny: boolean) =>
    `flex h-9 shrink-0 items-center gap-1.5 border px-3 text-sm font-bold transition ${aktywny ? "border-tekst bg-tekst text-tlo" : "border-tekst/40 bg-transparent"}`;

  return (
    <div style={PAPIER} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloGazeta />
      <main id="tresc" className="mx-auto max-w-2xl px-4 pt-5">
        <header className="relative text-center">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase">Wydanie internetowe · Cena 0 zł</p>
          <h1 className={`${winieta.className} mt-1 text-[2.6rem] leading-none tracking-tight`}>Kurier Szamański</h1>
          <Kreska podwojna />
          <p className="flex justify-between text-[11px] font-bold">
            <span>{teraz ? DATA.format(teraz) : " "}</span>
            <span>Kraśnik i okolice</span>
          </p>
          <Kreska />
        </header>

        <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <SzamanM styl="druk" className="w-16" />
          <p className="text-[1.45rem] leading-[1.05] font-bold text-balance">Co dziś szamiesz? Redakcja sprawdziła {lokale.length} lokali</p>
          <div className="border-2 border-tekst px-3 py-2 text-center">
            <p className="text-[9px] font-bold tracking-widest uppercase">Prognoza</p>
            <p className="text-3xl leading-none font-bold">{otwarte}</p>
            <p className="text-[10px] font-bold">otwartych</p>
          </div>
        </div>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-4 flex h-12 items-center gap-2 border-b-2 border-tekst"
        >
          <Search className="size-5 shrink-0" aria-hidden />
          <input
            type="search"
            value={k.szukaj}
            onChange={(e) => k.setSzukaj(e.target.value)}
            placeholder="Szukaj w ogłoszeniach…"
            aria-label="Szukaj lokalu"
            className="min-w-0 flex-1 bg-transparent text-lg italic outline-none placeholder:text-tekst-2"
          />
          <button
            type="button"
            onClick={() => k.setTylkoWege(!k.tylkoWege)}
            aria-pressed={k.tylkoWege}
            className={`flex h-8 items-center gap-1 border px-2 text-xs font-bold ${k.tylkoWege ? "border-[#15803d] bg-[#15803d] text-white" : "border-[#15803d] text-[#15803d]"}`}
          >
            <Leaf className="size-3.5" aria-hidden /> wege
          </button>
        </form>

        <Dzial tytul="Ogłoszenia płatne">
          <BaneryReklamowe className="[--promien-reklamy:0px]" />
        </Dzial>

        <Dzial tytul="Działy">
          <p className="flex flex-wrap justify-center gap-x-1 gap-y-1 text-[15px]">
            {k.kategorie.map((kat, i) => (
              <span key={kat.id} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden>·</span>}
                <button
                  type="button"
                  aria-pressed={k.kategoria === kat.id}
                  onClick={() => k.setKategoria(kat.id)}
                  className={`px-1 font-bold ${k.kategoria === kat.id ? "bg-tekst text-tlo" : "underline decoration-tekst/30 underline-offset-4"}`}
                >
                  {kat.nazwa}
                </button>
              </span>
            ))}
          </p>
        </Dzial>

        {czolowka && k.kategoria === "wszystko" && !k.szukaj && (
          <Dzial tytul="Z ostatniej chwili">
            <Link href={lokalM(nr, czolowka.lokal.slug)} className="block">
              <Raster lokal={czolowka.lokal} className="aspect-[16/9]" />
              <p className="mt-1 text-[11px] italic text-tekst-2">Fot. poglądowa</p>
              <h3 className="mt-2 text-[1.9rem] leading-[1.05] font-bold">
                {czolowka.lokal.nazwa} otwarte dziś aż do {czolowka.doGodziny}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed first-letter:float-left first-letter:mr-1.5 first-letter:text-5xl first-letter:leading-[0.85] first-letter:font-bold">
                Nocni głodomorzy mogą odetchnąć. W Kraśniku i okolicy {k.doPozna.length}{" "}
                {odmiana(k.doPozna.length, ["lokal działa", "lokale działają", "lokali działa"])} do późna. Na czele zestawienia:{" "}
                {czolowka.lokal.nazwa} ({opisLokalu(czolowka.lokal).toLowerCase()}). Czytaj dalej →
              </p>
            </Link>
          </Dzial>
        )}

        <section id="wyniki" aria-label="Lokale" className="mt-6 scroll-mt-4">
          <h2 className="border-y-2 border-tekst py-1 text-center text-xs font-bold tracking-[0.3em] uppercase">
            Ogłoszenia drobne · {k.wyniki.length}
          </h2>
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} className="mt-3" wegeWlaczone="border-[#15803d] bg-[#15803d] text-white" />
          <ul className="mt-3 columns-2 gap-4 [column-rule:1px_solid_#171411]">
            {k.wyniki.map((l) => (
              <li key={l.id} className="mb-4 break-inside-avoid border-b border-dashed border-tekst/40 pb-3">
                <Link href={lokalM(nr, l.slug)} className="block">
                  {l.promowany && <p className="text-[10px] font-bold tracking-widest text-akcent-tekst uppercase">★ Wyróżnione</p>}
                  <h3 className="text-[17px] leading-tight font-bold uppercase">{l.nazwa}</h3>
                  <p className="mt-0.5 text-[13px] leading-snug">
                    {opisLokalu(l)}. {pelnyAdres(l)}.{l.telefon && ` Tel. ${l.telefon}.`}
                    {(l.cechy.wege || l.cechy.wegan) && " Dania wege."}
                  </p>
                  <StatusOtwarcia godziny={l.godziny} className="mt-1 text-xs" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="druk" />
    </div>
  );
}

export function LokalM12({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);
  const [rodzaj] = opisLokalu(lokal).split(" · ");

  return (
    <div style={PAPIER} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloGazeta />
      <main id="tresc" className="mx-auto max-w-2xl px-4 pt-4">
        <div className="flex items-center justify-between">
          <Link href={adresM(nr)} className="flex items-center gap-1 text-sm font-bold">
            <ArrowLeft className="size-4" aria-hidden /> Strona główna
          </Link>
          <span className={`${winieta.className} text-lg`}>Kurier Szamański</span>
        </div>
        <Kreska podwojna />
        <p className="mt-3 text-xs font-bold tracking-[0.25em] text-akcent-tekst uppercase">Gastronomia · {lokal.miejscowosc}</p>
        <h1 className="mt-1 text-[2.7rem] leading-[1] font-bold tracking-tight">{lokal.nazwa}</h1>
        <p className="mt-2 text-lg leading-snug italic text-tekst-2">
          {rodzaj} przy {lokal.adres ?? "—"}. Sprawdziliśmy menu, ceny i godziny otwarcia.
        </p>
        <p className="mt-2 text-xs font-bold">Redakcja szamanie.pl</p>
        <Raster lokal={lokal} className="mt-4 aspect-[4/3]" />
        <p className="mt-1 text-[11px] italic text-tekst-2">Fot. poglądowa</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className="flex h-12 items-center justify-center gap-2 bg-tekst font-bold text-tlo">
              <Phone className="size-4" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className="flex h-12 items-center justify-center gap-2 border-2 border-tekst font-bold">
            <Navigation className="size-4" aria-hidden /> Prowadź
          </PrzyciskProwadz>
        </div>
        <div className="mt-4 text-[15px] leading-relaxed first-letter:float-left first-letter:mr-1.5 first-letter:text-5xl first-letter:leading-[0.85] first-letter:font-bold">
          {lokal.nazwa} mieści się pod adresem {pelnyAdres(lokal)}.{" "}
          {lokal.dostawa ? "Lokal dowozi jedzenie. " : ""}
          {menu ? `W karcie znajdziemy ${menu.liczba} pozycji w ${menu.sekcje.length} działach.` : "Karty dań jeszcze nie publikujemy."}{" "}
          <StatusOtwarcia godziny={lokal.godziny} className="!inline text-[15px]" />
        </div>
        <blockquote className="my-6 border-y-2 border-tekst py-3 text-center text-2xl leading-snug font-bold italic">
          „Zanim zadzwonisz, zbierz zamówienie na liście — zamówisz szybciej.”
        </blockquote>

        {menu && (
          <section className="border-2 border-tekst bg-karta px-3 pb-4">
            <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} numerowane />
          </section>
        )}
        {tydzien && (
          <section className="mt-6">
            <h2 className="border-y-2 border-tekst py-1 text-center text-xs font-bold tracking-[0.3em] uppercase">Godziny otwarcia</h2>
            <div className="mt-2">
              <TabelaGodzin tydzien={tydzien} />
            </div>
          </section>
        )}
      </main>
      <StopkaM linki={linki} szaman="druk" />
    </div>
  );
}
