"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowUpRight, Leaf, MapPin, MoonStar, Navigation, Phone, Search } from "lucide-react";
import { DNI_PL, dzienTygodnia, parsujGodziny, statusOtwarcia, type Tydzien } from "@/lib/godziny";
import { zl } from "@/lib/ceny";
import { linkTelefonu, odmiana, opisLokalu } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import SzamanM from "./SzamanM";
import { adresMapy } from "../szablony/wspolne";
import { useKatalog } from "../useKatalog";
import { useTeraz } from "../useTeraz";
import FiltryM from "./FiltryM";
import MenuZakladki from "./MenuZakladki";
import { mono } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 7 · Bento — siatka kafli różnej wielkości jak w nowych aplikacjach Apple. W tle siatka kropek, po której
// przechodzi pomarańczowa fala skanu, a każde dotknięcie ekranu puszcza krąg zapalonych kropek. Dane
// (godziny, liczby, zegar) krojem o stałej szerokości.

const BENTO = {
  "--color-tlo": "#f5f5f2",
  "--color-krem": "#ececE8",
  "--color-obrys": "#e2e2dc",
  "--color-obrys-2": "#cfcfc8",
  "--color-tekst": "#0b0b0b",
  "--color-tekst-2": "#5c5c57",
} as CSSProperties;

const kafel = "rounded-[1.6rem] bg-karta p-4 ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

function TloKropki() {
  const [kregi, setKregi] = useState<{ id: number; x: number; y: number }[]>([]);
  useEffect(() => {
    let id = 0;
    const dotyk = (e: PointerEvent) => {
      const krag = { id: ++id, x: e.clientX, y: e.clientY };
      setKregi((k) => [...k.slice(-4), krag]);
      setTimeout(() => setKregi((k) => k.filter((x) => x.id !== krag.id)), 1100);
    };
    addEventListener("pointerdown", dotyk, { passive: true });
    return () => removeEventListener("pointerdown", dotyk);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="m-kropki" />
      <div className="m-kropki-skan" />
      {kregi.map((k) => (
        <span key={k.id} className="m-krag" style={{ left: k.x, top: k.y }} />
      ))}
    </div>
  );
}

function Zegar() {
  const teraz = useTeraz();
  if (!teraz) return <span className={`${mono.className} text-sm`}>--:--</span>;
  return (
    <span className={`${mono.className} text-sm font-bold tabular-nums`}>
      {DNI_PL[dzienTygodnia(teraz)].slice(0, 3).toLowerCase()} · {String(teraz.getHours()).padStart(2, "0")}
      <span className="animate-pulse">:</span>
      {String(teraz.getMinutes()).padStart(2, "0")}
    </span>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold ring-1 transition active:scale-95 ${
    aktywny ? "bg-tekst text-white ring-tekst" : "bg-karta ring-black/10"
  } ${mono.className}`;

export function GlownaM07({ lokale, miejscowosci, nr }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const otwarte = lokale.filter(k.czyOtwarte).length;
  const najdluzej = k.doPozna[0];

  return (
    <div style={BENTO} className="relative isolate min-h-screen overflow-x-clip bg-tlo pb-16">
      <TloKropki />
      <header className="sticky top-0 z-40 bg-tlo/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
          <span className="ml-auto flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-otwarte" />
            <Zegar />
          </span>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-4">
        <section className={`${kafel} relative mt-2 overflow-hidden bg-tekst text-white ring-0`}>
          <SzamanM styl="piksele" className="pointer-events-none absolute -right-3 -bottom-3 w-28" />
          <p className={`${mono.className} text-xs text-white/60`}>{"// kraśnik + okolice"}</p>
          <h1 className="mt-1 max-w-[70%] font-grotesk text-[2.4rem] leading-[0.95] font-bold tracking-tight">
            Co dziś <span className="text-akcent">szamiesz?</span>
          </h1>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="relative mt-4 flex h-12 max-w-[78%] items-center gap-2 rounded-xl bg-white/10 pr-1 pl-3 ring-1 ring-white/15"
          >
            <Search className="size-4 shrink-0 text-white/60" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="szukaj…"
              aria-label="Szukaj lokalu"
              className={`${mono.className} min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/40`}
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`flex size-10 items-center justify-center rounded-lg ${k.tylkoWege ? "bg-[#22c55e] text-black" : "text-[#4ade80]"}`}
            >
              <Leaf className="size-5" aria-hidden />
            </button>
          </form>
        </section>

        <BaneryReklamowe className="mt-3 [--promien-reklamy:1.6rem]" />

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => k.setTylkoOtwarte(!k.tylkoOtwarte)} className={`${kafel} text-left ${k.tylkoOtwarte ? "ring-2 ring-otwarte" : ""}`}>
            <span className={`${mono.className} text-[11px] text-tekst-2`}>otwarte_teraz</span>
            <span className={`${mono.className} mt-1 block text-5xl leading-none font-bold text-otwarte tabular-nums`}>{otwarte}</span>
            <span className="mt-1 block text-xs font-bold text-tekst-2">z {lokale.length} · dotknij, żeby filtrować</span>
          </button>
          {najdluzej ? (
            <Link href={lokalM(nr, najdluzej.lokal.slug)} className={`${kafel} block`}>
              <span className={`${mono.className} flex items-center gap-1 text-[11px] text-tekst-2`}>
                <MoonStar className="size-3.5" aria-hidden /> najdłużej
              </span>
              <span className={`${mono.className} mt-1 block text-3xl leading-none font-bold tabular-nums`}>{najdluzej.doGodziny}</span>
              <span className="mt-1.5 block truncate text-sm font-extrabold">{najdluzej.lokal.nazwa}</span>
            </Link>
          ) : (
            <div className={kafel}>
              <span className={`${mono.className} text-[11px] text-tekst-2`}>w_okolicy</span>
              <span className={`${mono.className} mt-1 block text-5xl leading-none font-bold`}>{lokale.length}</span>
            </div>
          )}
        </div>

        <section aria-labelledby="kategorie" className="mt-6">
          <h2 id="kategorie" className="font-grotesk text-xl font-bold">
            Na co masz ochotę?
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {k.kategorie.map((kat, i) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button
                  key={kat.id}
                  type="button"
                  aria-pressed={aktywna}
                  onClick={() => k.setKategoria(kat.id)}
                  className={`${kafel} flex flex-col justify-between gap-3 text-left transition active:scale-95 ${
                    i === 0 ? "col-span-2" : ""
                  } ${aktywna ? "bg-akcent ring-akcent" : ""}`}
                >
                  <IkonaTypu ikona={kat.ikona} className="size-7" />
                  <span className="flex items-end justify-between gap-1">
                    <span className="text-sm leading-tight font-extrabold">{kat.nazwa}</span>
                    <span className={`${mono.className} text-xs font-bold opacity-60`}>{k.ileWKategorii.get(kat.id)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-6 scroll-mt-16">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} />
          <h2 className={`${mono.className} mt-3 text-sm font-bold text-tekst-2`}>
            wyniki: {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2.5">
            {k.wyniki.map((l, i) => {
              const duzy = i % 3 === 0;
              return (
                <li key={l.id} className={`pojawianie ${duzy ? "col-span-2" : ""}`}>
                  <Link href={lokalM(nr, l.slug)} className={`${kafel} group block h-full p-2`}>
                    <div className="relative">
                      <Miniatura lokal={l} className={`${duzy ? "h-40" : "aspect-square"} rounded-[1.2rem]`} sizes={duzy ? "100vw" : "50vw"} />
                      <ArrowUpRight className="absolute top-2 right-2 size-8 rounded-full bg-white/90 p-1.5 transition group-hover:rotate-45" aria-hidden />
                      {(l.cechy.wege || l.cechy.wegan) && (
                        <Leaf className="absolute top-2 left-2 size-7 rounded-full bg-white/90 p-1.5 text-[#15803d]" aria-label="wege" />
                      )}
                    </div>
                    <div className="px-1.5 pt-2 pb-1">
                      <h3 className={`${duzy ? "text-lg" : "text-[15px]"} leading-tight font-extrabold`}>{l.nazwa}</h3>
                      <p className="truncate text-xs font-semibold text-tekst-2">{opisLokalu(l)}</p>
                      <StatusOtwarcia godziny={l.godziny} className={`${mono.className} mt-1 text-[11px]`} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}

/** Tydzień jako paski na osi doby, dziś wyróżnione, kreska „teraz”. */
function OsDoby({ tydzien }: { tydzien: Tydzien }) {
  const teraz = useTeraz();
  const dzis = teraz ? dzienTygodnia(teraz) : -1;
  const terazProc = teraz ? ((teraz.getHours() * 60 + teraz.getMinutes()) / 1440) * 100 : null;
  return (
    <div className="space-y-1.5">
      {tydzien.map((przedzialy, d) => (
        <div key={d} className="flex items-center gap-2">
          <span className={`${mono.className} w-7 text-[11px] font-bold ${d === dzis ? "text-akcent-tekst" : "text-tekst-2"}`}>
            {DNI_PL[d].slice(0, 2).toLowerCase()}
          </span>
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-krem">
            {przedzialy.map(([s, k], i) => (
              <span
                key={i}
                className={`absolute inset-y-0 rounded-full ${d === dzis ? "bg-akcent" : "bg-tekst/70"}`}
                style={{ left: `${(s / 1440) * 100}%`, width: `${((Math.min(k, 1440) - s) / 1440) * 100}%` }}
              />
            ))}
            {d === dzis && terazProc !== null && <span className="absolute inset-y-0 w-0.5 bg-zamkniete" style={{ left: `${terazProc}%` }} />}
          </div>
        </div>
      ))}
      <div className={`${mono.className} flex justify-between pl-9 text-[10px] text-tekst-2`}>
        <span>0</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
    </div>
  );
}

function Odliczanie({ tydzien }: { tydzien: Tydzien }) {
  const teraz = useTeraz();
  if (!teraz) return null;
  const s = statusOtwarcia(tydzien, teraz);
  if (!s.otwarte) return <StatusOtwarcia godziny={null} />;
  const zostalo = s.doMin - (teraz.getHours() * 60 + teraz.getMinutes());
  const proc = Math.max(0, Math.min(1, zostalo / 600));
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 36 36" className="size-14 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="4" />
        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-otwarte)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${proc * 94.2} 94.2`} />
      </svg>
      <span>
        <span className={`${mono.className} block text-2xl leading-none font-bold tabular-nums`}>
          {Math.floor(zostalo / 60)}:{String(zostalo % 60).padStart(2, "0")}
        </span>
        <span className="text-xs font-bold text-tekst-2">do zamknięcia</span>
      </span>
    </div>
  );
}

export function LokalM07({ lokal, menu, dostawa, nr }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);
  const ceny = menu?.sekcje.flatMap((s) => s.pozycje.flatMap((p) => p.ceny.map((c) => c.gr))) ?? [];

  return (
    <div style={BENTO} className="relative isolate min-h-screen overflow-x-clip bg-tlo pb-16">
      <TloKropki />
      <header className="sticky top-0 z-40 bg-tlo/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href={adresM(nr)} aria-label="Wszystkie lokale" className="flex size-9 items-center justify-center rounded-xl bg-karta ring-1 ring-black/10">
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <span className={`${mono.className} truncate text-xs text-tekst-2`}>/lokal/{lokal.slug}</span>
          <span className="ml-auto">
            <Zegar />
          </span>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-4">
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <section className={`${kafel} relative col-span-2 h-60 overflow-hidden p-0`}>
            <Miniatura lokal={lokal} className="size-full" sizes="100vw" priorytet />
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 text-white">
              <h1 className="font-grotesk text-[2.1rem] leading-[1] font-bold">{lokal.nazwa}</h1>
              <p className="mt-1 text-sm font-semibold text-white/75">{opisLokalu(lokal)}</p>
            </div>
          </section>

          <div className={`${kafel} col-span-2 flex items-center justify-between`}>
            {tydzien ? <Odliczanie tydzien={tydzien} /> : <span className="text-sm font-bold text-tekst-2">Godziny nieznane</span>}
            <StatusOtwarcia godziny={lokal.godziny} className={`${mono.className} text-xs`} />
          </div>

          {lokal.telefon ? (
            <a href={linkTelefonu(lokal.telefon)} className={`${kafel} flex aspect-square flex-col justify-between bg-akcent ring-0`}>
              <Phone className="size-8" aria-hidden />
              <span>
                <span className="block text-xl font-black">Zadzwoń</span>
                <span className={`${mono.className} text-xs font-bold`}>{lokal.telefon}</span>
              </span>
            </a>
          ) : (
            <div className={`${kafel} aspect-square text-sm font-bold text-tekst-2`}>Brak telefonu</div>
          )}
          <PrzyciskProwadz lokal={lokal} className={`${kafel} flex aspect-square flex-col justify-between bg-tekst text-white ring-0`}>
            <Navigation className="size-8" aria-hidden />
            <span>
              <span className="block text-xl font-black">Prowadź</span>
              <span className={`${mono.className} flex items-center gap-1 text-xs text-white/70`}>
                <MapPin className="size-3" aria-hidden /> {lokal.adres ?? lokal.miejscowosc}
              </span>
            </span>
          </PrzyciskProwadz>

          {tydzien && (
            <section className={`${kafel} col-span-2`}>
              <h2 className={`${mono.className} mb-3 text-xs font-bold text-tekst-2`}>godziny_otwarcia</h2>
              <OsDoby tydzien={tydzien} />
            </section>
          )}

          {menu && (
            <a href="#menu" className={`${kafel} col-span-2 grid grid-cols-3 text-center`}>
              {[
                [menu.liczba, "pozycji"],
                [menu.sekcje.length, "działów"],
                [ceny.length ? zl(Math.min(...ceny)) : "—", "najtaniej"],
              ].map(([liczba, opis]) => (
                <span key={opis}>
                  <span className={`${mono.className} block text-2xl font-bold`}>{liczba}</span>
                  <span className="text-xs font-bold text-tekst-2">{opis}</span>
                </span>
              ))}
            </a>
          )}

          <section className={`${kafel} col-span-2 overflow-hidden p-1.5`}>
            <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="h-48 w-full rounded-[1.2rem] border-0 grayscale" />
          </section>
        </div>

        <div className="mt-6">
          {menu ? (
            <MenuZakladki
              menu={menu}
              dostawa={dostawa}
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              telefon={lokal.telefon}
              odGory={56}
              wyglad={{
                pasek: "bg-tlo/85 backdrop-blur-md",
                aktywna: "bg-tekst text-white",
                nieaktywna: "bg-karta ring-1 ring-black/10",
                naglowek: "font-grotesk text-xl font-bold",
                wiersz: "border-b border-obrys",
                miniatura: "rounded-[1.2rem]",
              }}
            />
          ) : (
            <p className={`${kafel} font-bold text-tekst-2`}>Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
          )}
        </div>
      </main>
    </div>
  );
}
