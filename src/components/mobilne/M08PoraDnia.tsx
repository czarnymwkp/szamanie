"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, Leaf, MapPin, Moon, Navigation, Phone, Search, Sun, Sunrise, Sunset } from "lucide-react";
import { formatGodz, parsujGodziny, statusOtwarcia, dzienTygodnia } from "@/lib/godziny";
import type { Lokal } from "@/lib/lokale";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import MenuLokalu from "../menu/MenuLokalu";
import { useKatalog } from "../useKatalog";
import { useTeraz } from "../useTeraz";
import FiltryM from "./FiltryM";
import SzamanM from "./SzamanM";
import { fraunces } from "./fonty";
import { adresM, losowe, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 8 · Pora dnia — niebo w tle zmienia się z godziną: rano brzoskwiniowe, w dzień jasne z chmurami, wieczorem
// zachód słońca, w nocy granat z migającymi gwiazdami i księżycem (strona przechodzi wtedy w ciemne kolory).
// Powitanie i podpowiedzi dopasowane do pory. Do podglądu: przełącznik pory w prawym górnym rogu.

type Pora = "rano" | "dzien" | "wieczor" | "noc";

const PORY: Record<Pora, { ikona: typeof Sun; nazwa: string; niebo: string; powitanie: string; pytanie: string; tokeny: CSSProperties }> = {
  rano: {
    ikona: Sunrise,
    nazwa: "Rano",
    niebo: "linear-gradient(180deg, #ffd1b3 0%, #ffe9d6 45%, #fff7ef 100%)",
    powitanie: "Dzień dobry!",
    pytanie: "Śniadanie czy kawa na start?",
    tokeny: {},
  },
  dzien: {
    ikona: Sun,
    nazwa: "Dzień",
    niebo: "linear-gradient(180deg, #8fd0ff 0%, #cdeaff 40%, #f6fbff 100%)",
    powitanie: "Cześć!",
    pytanie: "Co na obiad?",
    tokeny: { "--color-tlo": "#f6fbff" } as CSSProperties,
  },
  wieczor: {
    ikona: Sunset,
    nazwa: "Wieczór",
    niebo: "linear-gradient(180deg, #4b2a6b 0%, #c2416b 35%, #ff8a4c 65%, #ffd6a8 100%)",
    powitanie: "Dobry wieczór!",
    pytanie: "Co na kolację?",
    tokeny: { "--color-tlo": "#fff3ea" } as CSSProperties,
  },
  noc: {
    ikona: Moon,
    nazwa: "Noc",
    niebo: "linear-gradient(180deg, #050a1f 0%, #0d1838 45%, #18244a 100%)",
    powitanie: "Nie śpisz?",
    pytanie: "Głodny w nocy — co jeszcze działa?",
    tokeny: {
      "--color-tlo": "#0b1230",
      "--color-karta": "#141d42",
      "--color-krem": "#1c2752",
      "--color-tekst": "#eef2ff",
      "--color-tekst-2": "#a8b3d6",
      "--color-obrys": "#24305e",
      "--color-obrys-2": "#34427a",
      "--color-akcent-tekst": "#ff9a52",
      "--color-otwarte": "#4ade80",
      "--color-zamkniete": "#fca5a5",
      colorScheme: "dark",
    } as CSSProperties,
  },
};

const poraZGodziny = (h: number): Pora => (h >= 5 && h < 10 ? "rano" : h >= 10 && h < 17 ? "dzien" : h >= 17 && h < 21 ? "wieczor" : "noc");

const los = losowe(8);
const GWIAZDY = Array.from({ length: 60 }, () => ({
  left: `${(los() * 100).toFixed(1)}%`,
  top: `${(los() * 70).toFixed(1)}%`,
  "--r": `${(1 + los() * 2).toFixed(1)}px`,
  "--t": `${(2 + los() * 4).toFixed(1)}s`,
  "--d": `${(-los() * 5).toFixed(1)}s`,
})) as CSSProperties[];
const CHMURY = Array.from({ length: 5 }, (_, i) => ({
  top: `${8 + i * 9}%`,
  width: `${160 + Math.round(los() * 140)}px`,
  height: `${40 + Math.round(los() * 30)}px`,
  "--t": `${70 + Math.round(los() * 60)}s`,
  "--d": `${-Math.round(los() * 80)}s`,
})) as CSSProperties[];

/** Pora z zegara przeglądarki; w podglądzie można ją przełączyć ręcznie. */
function usePora() {
  const teraz = useTeraz();
  const [reczna, setReczna] = useState<Pora | null>(null);
  const pora = reczna ?? (teraz ? poraZGodziny(teraz.getHours()) : "dzien");
  return { pora, setReczna };
}

function Niebo({ pora }: { pora: Pora }) {
  const p = PORY[pora];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="fixed inset-0 transition-[background] duration-1000" style={{ background: p.niebo }} />
      {pora === "noc" && (
        <div className="fixed inset-0">
          {GWIAZDY.map((s, i) => (
            <span key={i} className="m-gwiazda" style={s} />
          ))}
          <span className="m-slonce absolute top-16 right-10 size-16 rounded-full bg-[#fdf6d8] shadow-[0_0_60px_20px_rgba(253,246,216,0.35)]" />
        </div>
      )}
      {pora === "dzien" && (
        <div className="fixed inset-0">
          <span className="m-slonce absolute -top-10 -right-10 size-48 rounded-full bg-[#ffe27a] shadow-[0_0_120px_50px_rgba(255,226,122,0.6)]" />
          {CHMURY.map((c, i) => (
            <span key={i} className="m-chmura" style={c} />
          ))}
        </div>
      )}
      {pora === "rano" && (
        <span className="m-slonce fixed top-40 -left-16 size-56 rounded-full bg-[#ffb27a] opacity-70 shadow-[0_0_120px_60px_rgba(255,178,122,0.5)]" />
      )}
      {pora === "wieczor" && (
        <span className="m-slonce fixed top-[30vh] left-1/2 size-64 -translate-x-1/2 rounded-full bg-[#ffcf6b] opacity-80 shadow-[0_0_140px_70px_rgba(255,120,60,0.55)]" />
      )}
    </div>
  );
}

function WyborPory({ pora, ustaw }: { pora: Pora; ustaw: (p: Pora) => void }) {
  return (
    <div role="radiogroup" aria-label="Pora dnia (podgląd)" className="flex gap-0.5 rounded-full bg-black/15 p-0.5 backdrop-blur">
      {(Object.keys(PORY) as Pora[]).map((p) => {
        const Ikona = PORY[p].ikona;
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={pora === p}
            aria-label={PORY[p].nazwa}
            onClick={() => ustaw(p)}
            className={`flex size-8 items-center justify-center rounded-full transition ${pora === p ? "bg-white text-[#111] shadow" : "text-white"}`}
          >
            <Ikona className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

/** Podpowiedź na tę porę: kawiarnie rano, restauracje w dzień, pizza wieczorem, „do późna” w nocy. */
function podpowiedz(pora: Pora, lokale: Lokal[]) {
  const pasuje: Record<Pora, (l: Lokal) => boolean> = {
    rano: (l) => l.typ === "cafe",
    dzien: (l) => l.typ === "restaurant",
    wieczor: (l) => l.kuchnie.some((k) => k.includes("pizza") || k === "burger"),
    noc: (l) => l.typ === "fast_food" || l.kuchnie.includes("kebab"),
  };
  return lokale.filter(pasuje[pora]).slice(0, 8);
}

export function GlownaM08({ lokale, miejscowosci, nr }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const { pora, setReczna } = usePora();
  const p = PORY[pora];
  const ciemno = pora === "noc";
  const propozycje = useMemo(() => podpowiedz(pora, lokale), [pora, lokale]);
  const chip = (aktywny: boolean) =>
    `flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold backdrop-blur transition active:scale-95 ${
      aktywny ? "bg-akcent text-black" : ciemno ? "bg-white/10" : "bg-white/70"
    }`;

  return (
    <div style={p.tokeny} className="relative isolate min-h-screen overflow-x-clip pb-16 text-tekst">
      <Niebo pora={pora} />
      <header className="sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Image src={ciemno ? "/logo-ciemne-tlo.png" : "/logo-jasne-tlo.png"} alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
          <div className="ml-auto">
            <WyborPory pora={pora} ustaw={setReczna} />
          </div>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative pt-6">
          <SzamanM
            styl={ciemno ? "noc" : "dzien"}
            className="pointer-events-none absolute top-2 -right-2 w-28 animate-wjazd [animation-delay:300ms]"
          />
          <p className={`${fraunces.className} animate-wjazd text-2xl font-semibold ${pora === "wieczor" ? "text-white" : ""}`}>{p.powitanie}</p>
          <h1
            className={`${fraunces.className} mt-1 max-w-[75%] animate-wjazd text-[2.6rem] leading-[1.02] font-bold tracking-tight [animation-delay:80ms] ${
              pora === "wieczor" ? "text-white" : ""
            }`}
          >
            {p.pytanie}
          </h1>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`mt-6 flex h-14 animate-wjazd items-center gap-2 rounded-full pr-2 pl-4 shadow-lg backdrop-blur-xl [animation-delay:140ms] ${
              ciemno ? "bg-white/10 ring-1 ring-white/15" : "bg-white/85"
            }`}
          >
            <Search className="size-5 shrink-0 text-tekst-2" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Pizza, kebab, nazwa lokalu…"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-tekst-2"
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`flex size-10 items-center justify-center rounded-full ${k.tylkoWege ? "bg-[#15803d] text-white" : "text-[#16a34a]"}`}
            >
              <Leaf className="size-5" aria-hidden />
            </button>
          </form>
        </section>

        <BaneryReklamowe ciemne={ciemno} className="mt-6" />

        {propozycje.length > 0 && (
          <section aria-labelledby="na-teraz" className="mt-7">
            <h2 id="na-teraz" className={`${fraunces.className} text-xl font-bold`}>
              {p.nazwa}: na teraz
            </h2>
            <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
              {propozycje.map((l) => (
                <Link key={l.id} href={lokalM(nr, l.slug)} className={`w-40 shrink-0 overflow-hidden rounded-3xl ${ciemno ? "bg-white/10" : "bg-white/80"} backdrop-blur`}>
                  <Miniatura lokal={l} className="h-24" sizes="160px" dopisek={false} />
                  <span className="block truncate px-3 pt-2 text-sm font-extrabold">{l.nazwa}</span>
                  <StatusOtwarcia godziny={l.godziny} ciemne={ciemno} className="px-3 pb-2.5 text-xs" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="kategorie" className="mt-6">
          <h2 id="kategorie" className={`${fraunces.className} text-xl font-bold`}>
            Na co masz ochotę?
          </h2>
          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
            {k.kategorie.map((kat) => (
              <button key={kat.id} type="button" aria-pressed={k.kategoria === kat.id} onClick={() => k.setKategoria(kat.id)} className={`${chip(k.kategoria === kat.id)} pl-2.5`}>
                <IkonaTypu ikona={kat.ikona} className="size-5" /> {kat.nazwa}
              </button>
            ))}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-5 scroll-mt-16">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} />
          <h2 className={`${fraunces.className} mt-3 text-xl font-bold`}>
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-3 space-y-3">
            {k.wyniki.map((l) => (
              <li key={l.id} className="pojawianie">
                <Link href={lokalM(nr, l.slug)} className={`flex items-center gap-3 rounded-3xl p-2.5 backdrop-blur ${ciemno ? "bg-white/[0.07]" : "bg-white/75"}`}>
                  <Miniatura lokal={l} className="size-20 shrink-0 rounded-2xl" dopisek={false} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-extrabold">{l.nazwa}</span>
                    <span className="block truncate text-sm font-semibold text-tekst-2">{opisLokalu(l)}</span>
                    <StatusOtwarcia godziny={l.godziny} ciemne={ciemno} className="text-sm" />
                  </span>
                  {(l.cechy.wege || l.cechy.wegan) && <Leaf className="size-4 shrink-0 text-[#16a34a]" aria-label="wege" />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

/** Dzisiejsze godziny jako łuk słońca nad horyzontem, z kropką „teraz”. */
function LukDnia({ godziny }: { godziny: string | null }) {
  const teraz = useTeraz();
  const tydzien = parsujGodziny(godziny);
  if (!tydzien || !teraz) return null;
  const dzis = tydzien[dzienTygodnia(teraz)];
  const min = teraz.getHours() * 60 + teraz.getMinutes();
  const status = statusOtwarcia(tydzien, teraz);
  const punkt = (m: number) => {
    const t = Math.PI * (1 - m / 1440);
    return { x: 150 + 130 * Math.cos(t), y: 140 - 110 * Math.sin(t) };
  };
  const luk = (s: number, k: number) => {
    const a = punkt(s);
    const b = punkt(Math.min(k, 1440));
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} A130 110 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  };
  const t = punkt(min);
  return (
    <figure>
      <svg viewBox="0 0 300 150" className="w-full" aria-hidden>
        <path d={luk(0, 1440)} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" strokeLinecap="round" />
        {dzis.map(([s, k], i) => (
          <path key={i} d={luk(s, k)} fill="none" stroke="#ff8a3d" strokeWidth="6" strokeLinecap="round" />
        ))}
        <line x1="10" y1="141" x2="290" y2="141" stroke="currentColor" strokeOpacity="0.2" />
        <circle cx={t.x} cy={t.y} r="9" fill="#ffd34d" className="m-slonce" />
      </svg>
      <figcaption className="-mt-2 text-center text-sm font-extrabold">
        {status.otwarte ? `Otwarte jeszcze do ${formatGodz(status.doMin)}` : "Teraz zamknięte"} · dziś{" "}
        {dzis.length ? dzis.map(([s, k]) => `${formatGodz(s)}–${formatGodz(k)}`).join(", ") : "nieczynne"}
      </figcaption>
    </figure>
  );
}

export function LokalM08({ lokal, menu, dostawa, nr }: PropsLokaluM) {
  const { pora, setReczna } = usePora();
  const p = PORY[pora];
  const ciemno = pora === "noc";
  const tydzien = parsujGodziny(lokal.godziny);
  const karta = `rounded-[1.75rem] p-5 backdrop-blur-xl ${ciemno ? "bg-white/[0.07] ring-1 ring-white/10" : "bg-white/80"}`;

  return (
    <div style={p.tokeny} className="relative isolate min-h-screen overflow-x-clip pb-16 text-tekst">
      <Niebo pora={pora} />
      <header className="sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <Link href={adresM(nr)} aria-label="Wszystkie lokale" className="flex size-10 items-center justify-center rounded-full bg-white/80 text-[#111] backdrop-blur">
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          <div className="ml-auto">
            <WyborPory pora={pora} ustaw={setReczna} />
          </div>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl space-y-4 px-4">
        <section className="relative overflow-hidden rounded-[2rem]">
          <Miniatura lokal={lokal} className="h-56" sizes="100vw" priorytet />
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
          <div className="absolute inset-x-5 bottom-4 text-white">
            <h1 className={`${fraunces.className} text-[2.2rem] leading-[1] font-bold`}>{lokal.nazwa}</h1>
            <p className="mt-1 text-sm font-semibold text-white/80">{opisLokalu(lokal)}</p>
          </div>
        </section>

        <section className={karta}>
          <LukDnia godziny={lokal.godziny} />
          <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-tekst-2">
            <MapPin className="size-4 shrink-0" aria-hidden /> {pelnyAdres(lokal)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {lokal.telefon && (
              <a href={linkTelefonu(lokal.telefon)} className="flex h-12 items-center justify-center gap-2 rounded-full bg-akcent font-extrabold text-black">
                <Phone className="size-5" aria-hidden /> Zadzwoń
              </a>
            )}
            <PrzyciskProwadz lokal={lokal} className={`flex h-12 items-center justify-center gap-2 rounded-full font-extrabold ${ciemno ? "bg-white/15" : "bg-tekst text-white"}`}>
              <Navigation className="size-5" aria-hidden /> Prowadź
            </PrzyciskProwadz>
          </div>
        </section>

        <section className={karta}>
          {menu ? (
            <div className="-mt-8">
              <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} />
            </div>
          ) : (
            <p className="font-semibold text-tekst-2">Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
          )}
        </section>

        {tydzien && (
          <section className={karta}>
            <h2 className={`${fraunces.className} text-xl font-bold`}>Cały tydzień</h2>
            <div className="mt-2">
              <TabelaGodzin tydzien={tydzien} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
