"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Leaf, MapPin, Navigation, Phone, Rocket, Search } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { KATEGORIE, linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import MenuLokalu from "../menu/MenuLokalu";
import { adresMapy } from "../szablony/wspolne";
import { useKatalog, type Katalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { kosmiczny } from "./fonty";
import { adresM, losowe, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 15 · Kosmos — granatowa galaktyka: migające gwiazdy, mgławice, co kilka sekund spadająca gwiazda.
// Kategorie krążą po dwóch orbitach wokół wybranej „planety”, lokale to planety z poświatą.
// Na stronie lokalu jego zdjęcie jest planetą, a szaman krąży wokół niej jak księżyc.

const GALAKTYKA = {
  "--color-tlo": "#070b1f",
  "--color-karta": "#10173a",
  "--color-krem": "#19214a",
  "--color-tekst": "#eef3ff",
  "--color-tekst-2": "#9ba7d0",
  "--color-obrys": "#232d5c",
  "--color-obrys-2": "#34407a",
  "--color-akcent-tekst": "#ffa25c",
  "--color-otwarte": "#6ef0b4",
  "--color-zamkniete": "#ff8fa3",
  "--font-space-grotesk": kosmiczny.style.fontFamily,
  fontFamily: kosmiczny.style.fontFamily,
  colorScheme: "dark",
} as CSSProperties;

const los = losowe(15);
const GWIAZDY = Array.from({ length: 90 }, () => ({
  left: `${(los() * 100).toFixed(1)}%`,
  top: `${(los() * 100).toFixed(1)}%`,
  "--r": `${(1 + los() * 2).toFixed(1)}px`,
  "--t": `${(2 + los() * 5).toFixed(1)}s`,
  "--d": `${(-los() * 6).toFixed(1)}s`,
})) as CSSProperties[];

function TloGalaktyka() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="fixed inset-0 bg-[radial-gradient(60%_40%_at_80%_10%,rgba(124,58,237,0.35),transparent),radial-gradient(50%_35%_at_10%_60%,rgba(255,100,0,0.18),transparent),radial-gradient(60%_40%_at_70%_95%,rgba(56,189,248,0.2),transparent)]" />
      <div className="fixed inset-0">
        {GWIAZDY.map((s, i) => (
          <span key={i} className="m-gwiazda" style={s} />
        ))}
      </div>
      <span className="m-meteor" style={{ "--t": "7s" } as CSSProperties} />
      <span className="m-meteor" style={{ "--t": "11s", "--d": "-4s", top: "35%", left: "90%" } as CSSProperties} />
    </div>
  );
}

/** Kategorie na dwóch orbitach wokół wybranej; ikony kręcą się w przeciwną stronę, żeby stały prosto. */
function Orbity({ k }: { k: Katalog }) {
  const wybrana = KATEGORIE.find((x) => x.id === k.kategoria) ?? KATEGORIE[0];
  const reszta = k.kategorie.filter((x) => x.id !== wybrana.id);
  const pierscienie = [reszta.slice(0, 4), reszta.slice(4)];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <div className="absolute inset-[34%] flex flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffb27a,#ff6400_45%,#7a2a00)] text-black shadow-[0_0_60px_rgba(255,100,0,0.55)]">
        <IkonaTypu ikona={wybrana.ikona} className="size-9" />
        <span className="text-xs font-bold">{wybrana.nazwa}</span>
      </div>
      {pierscienie.map((planety, p) => {
        const promien = p === 0 ? 30 : 46; // % szerokości
        return (
          <div
            key={p}
            className="m-orbita absolute inset-0"
            style={{ "--t": p === 0 ? "70s" : "110s", animationDirection: p ? "reverse" : "normal" } as CSSProperties}
          >
            <div className="absolute rounded-full border border-dashed border-white/15" style={{ inset: `${50 - promien}%` }} />
            {planety.map((kat, i) => {
              const kat0 = (i / planety.length) * Math.PI * 2 + p;
              return (
                <div
                  key={kat.id}
                  className="absolute"
                  style={{ left: `${50 + promien * Math.cos(kat0)}%`, top: `${50 + promien * Math.sin(kat0)}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className="m-przeciw" style={p ? { animationDirection: "normal" } : undefined}>
                    <button
                      type="button"
                      aria-pressed={false}
                      onClick={() => k.setKategoria(kat.id)}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className="flex size-12 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#3d4a8a,#151c45)] shadow-[0_0_18px_rgba(120,160,255,0.35)] ring-1 ring-white/20">
                        <IkonaTypu ikona={kat.ikona} className="size-6" />
                      </span>
                      <span className="text-[10px] font-bold whitespace-nowrap">{kat.nazwa}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ring-1 transition active:scale-95 ${
    aktywny ? "bg-akcent text-black ring-akcent shadow-[0_0_20px_rgba(255,100,0,0.5)]" : "bg-karta/70 ring-white/15 backdrop-blur"
  }`;

export function GlownaM15({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);

  return (
    <div style={GALAKTYKA} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloGalaktyka />
      <header className="sticky top-0 z-40 bg-tlo/60 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Image src="/logo-ciemne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-tekst-2">
            <Rocket className="size-4 text-akcent-tekst" aria-hidden /> {lokale.length} planet w okolicy
          </span>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative pt-6">
          <SzamanM styl="kosmos" className="pointer-events-none absolute top-0 -right-2 w-28" />
          <p className="text-xs font-semibold tracking-[0.3em] text-tekst-2 uppercase">Misja: kolacja</p>
          <h1 className="mt-2 max-w-[72%] text-[2.6rem] leading-[0.98] font-extrabold">
            Co dziś <span className="bg-gradient-to-r from-[#ffb27a] via-[#ff6400] to-[#ff4f8b] bg-clip-text text-transparent">szamiesz?</span>
          </h1>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-6 flex h-14 items-center gap-2 rounded-full bg-white/10 pr-2 pl-4 ring-1 ring-white/20 backdrop-blur-xl"
          >
            <Search className="size-5 shrink-0 text-tekst-2" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Szukaj w galaktyce…"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-tekst-2"
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`flex size-10 items-center justify-center rounded-full ${k.tylkoWege ? "bg-otwarte text-black" : "text-otwarte"}`}
            >
              <Leaf className="size-5" aria-hidden />
            </button>
          </form>
        </section>

        <BaneryReklamowe ciemne className="mt-6" />

        <section aria-labelledby="kategorie" className="mt-8">
          <h2 id="kategorie" className="text-center text-2xl font-extrabold">
            Na co masz ochotę?
          </h2>
          <p className="text-center text-xs font-semibold text-tekst-2">Dotknij planety — przyleci do środka</p>
          <Orbity k={k} />
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-4 scroll-mt-16">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="bg-otwarte text-black ring-otwarte" />
          <h2 className="mt-3 text-xl font-extrabold">
            {k.wyniki.length} {odmiana(k.wyniki.length, ["planeta", "planety", "planet"])}
          </h2>
          <ul className="mt-4 space-y-3">
            {k.wyniki.map((l) => (
              <li key={l.id} className="pojawianie">
                <Link href={lokalM(nr, l.slug)} className="flex items-center gap-4 rounded-3xl bg-karta/70 p-3 ring-1 ring-white/10 backdrop-blur">
                  <Miniatura lokal={l} className="size-20 shrink-0 rounded-full shadow-[0_0_24px_rgba(255,140,60,0.45)] ring-2 ring-white/20" dopisek={false} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg leading-tight font-bold">{l.nazwa}</span>
                    <span className="block truncate text-sm text-tekst-2">{opisLokalu(l)}</span>
                    <StatusOtwarcia godziny={l.godziny} ciemne className="text-sm" />
                  </span>
                  {(l.cechy.wege || l.cechy.wegan) && <Leaf className="size-4 shrink-0 text-otwarte" aria-label="wege" />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="kosmos" />
    </div>
  );
}

export function LokalM15({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={GALAKTYKA} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <TloGalaktyka />
      <main id="tresc" className="mx-auto max-w-2xl px-5 pt-4">
        <Link href={adresM(nr)} aria-label="Wszystkie lokale" className="flex size-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        {/* lokal jako planeta, szaman krąży wokół jak księżyc */}
        <div className="relative mx-auto mt-2 aspect-square w-full max-w-[20rem]">
          <div className="absolute inset-[14%] overflow-hidden rounded-full shadow-[0_0_80px_rgba(255,120,40,0.45)] ring-4 ring-white/10">
            <Miniatura lokal={lokal} className="size-full" sizes="320px" priorytet />
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,transparent_40%,rgba(0,0,0,0.65))]" />
          </div>
          <div className="m-orbita absolute inset-0" style={{ "--t": "24s" } as CSSProperties}>
            <div className="absolute inset-[2%] rounded-full border border-dashed border-white/20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4">
              <div className="m-przeciw">
                <SzamanM styl="kosmos" className="w-16" />
              </div>
            </div>
          </div>
        </div>
        <h1 className="text-center text-[2.3rem] leading-[1.02] font-extrabold">{lokal.nazwa}</h1>
        <p className="mt-1 text-center font-semibold text-tekst-2">{opisLokalu(lokal)}</p>
        <StatusOtwarcia godziny={lokal.godziny} ciemne className="mt-2 justify-center" />
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-tekst-2">
          <MapPin className="size-4" aria-hidden /> {pelnyAdres(lokal)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className="flex h-14 items-center justify-center gap-2 rounded-full bg-akcent font-bold text-black shadow-[0_0_30px_rgba(255,100,0,0.5)]">
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className="flex h-14 items-center justify-center gap-2 rounded-full bg-white/10 font-bold ring-1 ring-white/25">
            <Navigation className="size-5" aria-hidden /> Leć tam
          </PrzyciskProwadz>
        </div>

        {menu ? (
          <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} />
        ) : (
          <p className="mt-8 rounded-3xl bg-karta/70 p-5 text-tekst-2">Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
        )}
        {tydzien && (
          <section className="mt-8 rounded-3xl bg-karta/70 p-5 ring-1 ring-white/10 backdrop-blur">
            <h2 className="text-xl font-extrabold">Okna startowe (godziny)</h2>
            <div className="mt-2">
              <TabelaGodzin tydzien={tydzien} />
            </div>
          </section>
        )}
        <iframe
          title={`Mapa: ${lokal.nazwa}`}
          src={adresMapy(lokal)}
          loading="lazy"
          className="mt-4 h-52 w-full rounded-3xl border-0 [filter:invert(0.9)_hue-rotate(200deg)_saturate(0.7)]"
        />
      </main>
      <StopkaM linki={linki} szaman="kosmos" />
    </div>
  );
}
