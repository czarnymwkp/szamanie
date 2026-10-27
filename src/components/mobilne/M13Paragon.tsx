"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Navigation, Phone } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import MenuLokalu from "../menu/MenuLokalu";
import { useKatalog } from "../useKatalog";
import { useTeraz } from "../useTeraz";
import FiltryM from "./FiltryM";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { kasowy } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 13 · Paragon — cała strona to wydruk z kasy na papierze termicznym: druk „wyjeżdża” z góry przy wejściu,
// kropki prowadzą do liczb, ząbkowany dolny brzeg, kod kreskowy i „DZIĘKUJEMY, SMACZNEGO!”. Pod paragonem
// szary blat. Kategorie i lokale to pozycje rachunku.

const KASA = {
  "--color-tlo": "#fffdf7",
  "--color-karta": "#fffdf7",
  "--color-krem": "#f1eee6",
  "--color-tekst": "#1f1f1f",
  "--color-tekst-2": "#5b5b5b",
  "--color-obrys": "#d7d3c9",
  "--color-obrys-2": "#9d988c",
  "--font-space-grotesk": kasowy.style.fontFamily,
  fontFamily: kasowy.style.fontFamily,
} as CSSProperties;

const DATA = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const Linia = ({ znak = "=" }: { znak?: string }) => (
  <p aria-hidden className="overflow-hidden whitespace-nowrap text-tekst-2 select-none">
    {znak.repeat(60)}
  </p>
);

function Pozycja({ lewa, prawa, aktywna = false }: { lewa: ReactNode; prawa: ReactNode; aktywna?: boolean }) {
  return (
    <span className={`flex items-baseline gap-1 ${aktywna ? "bg-tekst px-1 text-tlo" : ""}`}>
      <span className="shrink-0">{lewa}</span>
      <span aria-hidden className="min-w-3 flex-1 overflow-hidden whitespace-nowrap opacity-50">
        {".".repeat(80)}
      </span>
      <span className="shrink-0">{prawa}</span>
    </span>
  );
}

/** Paragon na blacie: papier z ząbkowanym dołem, drukuje się od góry. */
function Paragon({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto max-w-md animate-[m-druk_1.4s_steps(18)_backwards] px-3 pt-4">
      <div className="bg-tlo px-4 pt-6 pb-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">{children}</div>
      <div aria-hidden className="h-3 bg-[linear-gradient(135deg,#fffdf7_33%,transparent_33%),linear-gradient(225deg,#fffdf7_33%,transparent_33%)] bg-[length:16px_16px] drop-shadow-[0_6px_6px_rgba(0,0,0,0.12)]" />
    </div>
  );
}

const KodKreskowy = () => (
  <div
    aria-hidden
    className="mx-auto mt-4 h-14 w-56 bg-[repeating-linear-gradient(90deg,#1f1f1f_0_2px,transparent_2px_4px,#1f1f1f_4px_5px,transparent_5px_8px,#1f1f1f_8px_11px,transparent_11px_12px)]"
  />
);

export function GlownaM13({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const teraz = useTeraz();
  const otwarte = lokale.filter(k.czyOtwarte).length;
  const chip = (aktywny: boolean) =>
    `flex h-9 shrink-0 items-center gap-1.5 border border-dashed border-tekst px-3 text-sm font-bold ${aktywny ? "bg-tekst text-tlo" : ""}`;

  return (
    <div style={KASA} className="relative isolate min-h-screen overflow-x-clip bg-[#d9d5cc] pb-4 text-[15px] text-tekst uppercase">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
        <div className="m-ziarno !opacity-[0.12]" />
      </div>
      <Paragon>
        <header className="text-center">
          <SzamanM styl="termo" className="mx-auto w-24" />
          <p className="mt-2 text-2xl font-bold tracking-widest">SZAMANIE.PL</p>
          <p>KRAŚNIK I OKOLICE</p>
          <p className="text-tekst-2">PARAGON NIEFISKALNY</p>
          <p className="text-tekst-2">{teraz ? DATA.format(teraz) : " "}</p>
        </header>
        <Linia />
        <h1 className="text-center text-xl font-bold">CO DZIŚ SZAMIESZ?</h1>
        <Linia />
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="my-2 flex items-center gap-2"
        >
          <label htmlFor="szukaj-m13" className="shrink-0 font-bold">
            SZUKAJ:
          </label>
          <input
            id="szukaj-m13"
            type="search"
            value={k.szukaj}
            onChange={(e) => k.setSzukaj(e.target.value)}
            placeholder="________"
            className="min-w-0 flex-1 border-b border-dashed border-tekst bg-transparent uppercase outline-none placeholder:text-tekst-2"
          />
          <button type="button" onClick={() => k.setTylkoWege(!k.tylkoWege)} aria-pressed={k.tylkoWege} className="shrink-0 font-bold">
            [{k.tylkoWege ? "X" : " "}] WEGE
          </button>
        </form>
        <Linia znak="-" />
        <p className="text-center font-bold">*** REKLAMA ***</p>
        <BaneryReklamowe className="mt-2 [--promien-reklamy:0px]" />
        <Linia znak="-" />

        <section aria-labelledby="kategorie" className="mt-2">
          <h2 id="kategorie" className="font-bold">
            NA CO MASZ OCHOTĘ?
          </h2>
          <ul className="mt-1">
            {k.kategorie.map((kat) => (
              <li key={kat.id}>
                <button type="button" aria-pressed={k.kategoria === kat.id} onClick={() => k.setKategoria(kat.id)} className="w-full text-left">
                  <Pozycja
                    aktywna={k.kategoria === kat.id}
                    lewa={`${k.kategoria === kat.id ? ">" : " "} ${kat.nazwa}`}
                    prawa={`${k.ileWKategorii.get(kat.id)} SZT`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
        <Linia znak="-" />
        <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} />
        <Linia />

        <section id="wyniki" aria-label="Lokale" className="scroll-mt-4">
          <p className="flex justify-between font-bold">
            <span>LOKAL</span>
            <span>STATUS</span>
          </p>
          <Linia znak="-" />
          <ul className="space-y-2">
            {k.wyniki.map((l) => (
              <li key={l.id}>
                <Link href={lokalM(nr, l.slug)} className="block hover:bg-krem">
                  <Pozycja lewa={<b>{l.nazwa}</b>} prawa={k.czyOtwarte(l) ? "OTW" : "ZAMK"} />
                  <span className="block text-xs text-tekst-2 normal-case">
                    {opisLokalu(l)} · {l.miejscowosc}
                    {(l.cechy.wege || l.cechy.wegan) && " · WEGE"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Linia />
          <Pozycja lewa={<b>SUMA LOKALI</b>} prawa={<b>{k.wyniki.length}</b>} />
          <Pozycja lewa="W TYM OTWARTE" prawa={otwarte} />
          <Linia />
          <p className="mt-2 text-center font-bold">DZIĘKUJEMY, SMACZNEGO!</p>
          <KodKreskowy />
          <p className="mt-1 text-center text-xs tracking-[0.5em]">{String(lokale.length).padStart(4, "0")}{String(otwarte).padStart(4, "0")}2026</p>
        </section>
      </Paragon>
      <StopkaM linki={linki} szaman="termo" className="normal-case" />
    </div>
  );
}

export function LokalM13({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const teraz = useTeraz();
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={KASA} className="relative isolate min-h-screen overflow-x-clip bg-[#d9d5cc] pb-4 text-[15px] text-tekst">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
        <div className="m-ziarno !opacity-[0.12]" />
      </div>
      <div className="mx-auto max-w-md px-4 pt-3">
        <Link href={adresM(nr)} className="font-bold uppercase underline">
          ← wszystkie paragony
        </Link>
      </div>
      <Paragon>
        <header className="text-center uppercase">
          <SzamanM styl="termo" className="mx-auto w-20" />
          <p className="mt-2 text-sm text-tekst-2">RACHUNEK</p>
          <h1 className="text-2xl leading-tight font-bold tracking-wide">{lokal.nazwa}</h1>
          <p>{pelnyAdres(lokal)}</p>
          {lokal.telefon && <p>TEL. {lokal.telefon}</p>}
          <p className="text-tekst-2">{teraz ? DATA.format(teraz) : " "}</p>
        </header>
        <Linia />
        <p className="text-center uppercase">{opisLokalu(lokal)}</p>
        <StatusOtwarcia godziny={lokal.godziny} className="mt-1 justify-center uppercase" />
        <div className="mt-3 grid grid-cols-2 gap-2 uppercase">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className="flex h-11 items-center justify-center gap-2 bg-tekst font-bold text-tlo">
              <Phone className="size-4" aria-hidden /> [ ZADZWOŃ ]
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className="flex h-11 items-center justify-center gap-2 border border-dashed border-tekst font-bold">
            <Navigation className="size-4" aria-hidden /> [ PROWADŹ ]
          </PrzyciskProwadz>
        </div>
        <Linia />
        {menu ? (
          <div className="[&_#menu-tytul]:uppercase">
            <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} numerowane />
          </div>
        ) : (
          <p className="uppercase">MENU: BRAK DANYCH. ZADZWOŃ I ZAPYTAJ.</p>
        )}
        <Linia />
        {tydzien && (
          <section className="uppercase">
            <h2 className="font-bold">GODZINY OTWARCIA</h2>
            <TabelaGodzin tydzien={tydzien} />
          </section>
        )}
        <Linia />
        <p className="text-center font-bold uppercase">DZIĘKUJEMY, SMACZNEGO!</p>
        <KodKreskowy />
      </Paragon>
      <StopkaM linki={linki} szaman="termo" />
    </div>
  );
}
