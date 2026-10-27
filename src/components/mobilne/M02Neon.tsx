"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Leaf, MapPin, MoonStar, Navigation, Phone, Search, Truck } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import EtykietaPromo from "../EtykietaPromo";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import Szaman from "../Szaman";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import MenuLokalu from "../menu/MenuLokalu";
import { adresMapy } from "../szablony/wspolne";
import { useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 2 · Neon — restauracja nocą: ciemne tokeny, ziarno filmu, reflektor idzie za palcem, siatka podłogi
// ucieka w perspektywę, neonowe napisy mrugają. Zdjęcia w duotonie, kolor wraca po dotknięciu.

const NOC = {
  "--color-tlo": "#07070a",
  "--color-karta": "#111117",
  "--color-krem": "#1b1b24",
  "--color-tekst": "#f4f1ee",
  "--color-tekst-2": "#a7a2b2",
  "--color-obrys": "#24242e",
  "--color-obrys-2": "#363642",
  "--color-akcent": "#ff6400",
  "--color-akcent-tekst": "#ff8a3d",
  "--color-na-akcencie": "#0b0b0b",
  "--color-otwarte": "#4ade80",
  "--color-zamkniete": "#fb7185",
  colorScheme: "dark",
} as CSSProperties;

function TloNeon() {
  const reflektor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = reflektor.current;
    if (!el) return;
    let cel = { x: 50, y: 25 };
    let teraz = { ...cel };
    let klatka = 0;
    const ruch = (e: PointerEvent) => {
      cel = { x: (e.clientX / innerWidth) * 100, y: (e.clientY / innerHeight) * 100 };
    };
    // światło dogania palec z opóźnieniem — miękko, bez skakania
    const krok = () => {
      teraz = { x: teraz.x + (cel.x - teraz.x) * 0.08, y: teraz.y + (cel.y - teraz.y) * 0.08 };
      el.style.setProperty("--x", `${teraz.x}%`);
      el.style.setProperty("--y", `${teraz.y}%`);
      klatka = requestAnimationFrame(krok);
    };
    addEventListener("pointermove", ruch, { passive: true });
    addEventListener("pointerdown", ruch, { passive: true });
    klatka = requestAnimationFrame(krok);
    return () => {
      removeEventListener("pointermove", ruch);
      removeEventListener("pointerdown", ruch);
      cancelAnimationFrame(klatka);
    };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div ref={reflektor} className="m-reflektor" />
      <div className="m-podloga" />
      <div className="m-ziarno" />
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-4 text-sm font-extrabold transition active:scale-95 ${
    aktywny ? "m-neon-ramka border-akcent bg-akcent/15 text-akcent-tekst" : "border-obrys-2 bg-karta/80"
  }`;

export function GlownaM02({ lokale, miejscowosci, nr }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const otwarte = lokale.filter(k.czyOtwarte).length;

  return (
    <div style={NOC} className="relative isolate min-h-screen overflow-x-clip bg-tlo pb-16 text-tekst">
      <TloNeon />
      <header className="sticky top-0 z-40 border-b border-white/5 bg-tlo/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Image src="/logo-ciemne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
          <span className="m-neon ml-auto font-grotesk text-sm font-bold tracking-[0.2em] uppercase">
            {otwarte > 0 ? `Otwarte · ${otwarte}` : "Zamknięte"}
          </span>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative pt-10">
          <Szaman className="pointer-events-none absolute top-2 -right-3 w-32 animate-wjazd drop-shadow-[0_0_22px_rgba(255,100,0,0.55)] [animation-delay:300ms]" />
          <p className="animate-wjazd text-xs font-black tracking-[0.3em] text-tekst-2 uppercase">Kraśnik · dzień i noc</p>
          <h1 className="mt-3 animate-wjazd font-grotesk text-[3.6rem] leading-[0.9] font-bold tracking-tight [animation-delay:80ms]">
            Co dziś
            <br />
            <span className="m-neon">szamiesz?</span>
          </h1>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="m-neon-ramka mt-7 flex h-14 animate-wjazd items-center gap-2 rounded-2xl bg-karta/80 pr-1.5 pl-4 backdrop-blur [animation-delay:140ms]"
          >
            <Search className="size-5 shrink-0 text-akcent-tekst" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Pizza, kebab, nazwa lokalu…"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-semibold text-tekst outline-none placeholder:text-tekst-2"
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`flex size-11 items-center justify-center rounded-xl transition ${
                k.tylkoWege ? "bg-[#22c55e] text-black shadow-[0_0_20px_#22c55e]" : "text-[#4ade80]"
              }`}
            >
              <Leaf className="size-5" aria-hidden />
            </button>
            <button
              type="submit"
              aria-label="Pokaż wyniki"
              className="flex size-11 items-center justify-center rounded-xl bg-akcent text-black shadow-[0_0_24px_rgba(255,100,0,0.6)]"
            >
              <ArrowRight className="size-5" aria-hidden />
            </button>
          </form>
        </section>

        <BaneryReklamowe ciemne className="mt-7 [--promien-reklamy:1rem]" />

        <section aria-labelledby="kategorie" className="mt-8">
          <h2 id="kategorie" className="font-grotesk text-2xl font-bold">
            Na co masz ochotę?
          </h2>
          <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none]">
            {k.kategorie.map((kat) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button
                  key={kat.id}
                  type="button"
                  aria-pressed={aktywna}
                  onClick={() => k.setKategoria(kat.id)}
                  className="flex w-16 shrink-0 flex-col items-center gap-2"
                >
                  <span
                    className={`flex size-16 items-center justify-center rounded-full border transition ${
                      aktywna ? "m-neon-ramka border-akcent text-akcent-tekst" : "border-obrys-2 text-tekst-2"
                    }`}
                  >
                    <IkonaTypu ikona={kat.ikona} className="size-7" />
                  </span>
                  <span className={`text-xs font-extrabold whitespace-nowrap ${aktywna ? "text-akcent-tekst" : ""}`}>
                    {kat.nazwa}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {k.doPozna.length > 0 && k.kategoria === "wszystko" && !k.szukaj && (
          <section aria-labelledby="pozno" className="mt-6">
            <h2 id="pozno" className="m-neon-rozowy flex items-center gap-2 font-grotesk text-2xl font-bold">
              <MoonStar className="size-6" aria-hidden /> Nocne żarcie
            </h2>
            <div className="-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
              {k.doPozna.map(({ lokal, doGodziny }) => (
                <Link key={lokal.id} href={lokalM(nr, lokal.slug)} className="group relative h-44 w-40 shrink-0 overflow-hidden rounded-2xl">
                  <Miniatura lokal={lokal} className="m-duotone size-full" dopisek={false} />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#2a0018] via-[#ff2d87]/20 to-transparent mix-blend-hard-light" />
                  <span className="absolute inset-x-3 bottom-3">
                    <span className="block truncate text-sm font-extrabold text-white">{lokal.nazwa}</span>
                    <span className="m-neon-rozowy block font-grotesk text-2xl font-bold">do {doGodziny}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="wyniki" aria-label="Lokale" className="mt-6 scroll-mt-16">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="border-[#22c55e] bg-[#22c55e]/15 text-[#4ade80]" />
          <h2 className="mt-4 text-sm font-black tracking-[0.25em] text-tekst-2 uppercase">
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-3 space-y-3">
            {k.wyniki.map((l) => (
              <li key={l.id} className="pojawianie">
                <Link
                  href={lokalM(nr, l.slug)}
                  className="group flex gap-3 rounded-2xl border border-obrys bg-karta/80 p-2.5 backdrop-blur transition hover:border-akcent/60 active:scale-[0.99]"
                >
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
                    <Miniatura lokal={l} className="m-duotone size-full transition duration-500 group-hover:filter-none group-active:filter-none" dopisek={false} />
                    <span className="absolute inset-0 bg-gradient-to-br from-[#ff6400]/55 to-[#7c3aed]/45 mix-blend-color transition-opacity duration-500 group-hover:opacity-0" />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <h3 className="truncate font-grotesk text-lg leading-tight font-bold">{l.nazwa}</h3>
                    <p className="truncate text-sm font-semibold text-tekst-2">{opisLokalu(l)}</p>
                    <StatusOtwarcia godziny={l.godziny} ciemne className="mt-1 text-sm" />
                    <p className="mt-1 flex items-center gap-2 text-xs font-bold text-tekst-2">
                      {l.miejscowosc}
                      {(l.cechy.wege || l.cechy.wegan) && <Leaf className="size-3.5 text-[#4ade80]" aria-label="wege" />}
                      {l.promowany && <span className="text-akcent-tekst">★ polecany</span>}
                      {k.odleglosc(l) && <span>{k.odleglosc(l)}</span>}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {!k.wyniki.length && (
            <p className="mt-6 rounded-2xl border border-dashed border-obrys-2 p-6 text-center font-bold text-tekst-2">
              Ciemno tu i pusto.{" "}
              <button type="button" onClick={k.wyczysc} className="text-akcent-tekst underline">
                Pokaż wszystko
              </button>
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export function LokalM02({ lokal, menu, dostawa, nr }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={NOC} className="relative isolate min-h-screen overflow-x-clip bg-tlo pb-16 text-tekst">
      <TloNeon />
      <div className="relative h-[54vh] min-h-80 overflow-hidden">
        <Miniatura lokal={lokal} className="m-duotone size-full" sizes="100vw" priorytet />
        <span className="absolute inset-0 bg-gradient-to-br from-[#ff6400]/50 to-[#7c3aed]/50 mix-blend-color" />
        <span className="absolute inset-0 bg-gradient-to-t from-tlo via-tlo/40 to-transparent" />
        <Link
          href={adresM(nr)}
          aria-label="Wszystkie lokale"
          className="absolute top-4 left-4 flex size-11 items-center justify-center rounded-xl border border-white/15 bg-black/40 backdrop-blur"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="absolute inset-x-5 bottom-4">
          {lokal.promowany && <EtykietaPromo className="mb-2" />}
          <h1 className="m-neon animate-wjazd font-grotesk text-[2.75rem] leading-[0.95] font-bold tracking-tight">
            {lokal.nazwa}
          </h1>
          <p className="mt-2 font-bold text-white/70">{opisLokalu(lokal)}</p>
        </div>
      </div>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <StatusOtwarcia godziny={lokal.godziny} ciemne />
          <span className="flex items-center gap-1.5 text-sm font-semibold text-tekst-2">
            <MapPin className="size-4 text-akcent-tekst" aria-hidden /> {pelnyAdres(lokal)}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {lokal.telefon && (
            <a
              href={linkTelefonu(lokal.telefon)}
              className="flex h-14 animate-[puls-swiatla_2.4s_ease-in-out_infinite] items-center justify-center gap-2 rounded-2xl bg-akcent font-black text-black shadow-[0_0_30px_rgba(255,100,0,0.55)]"
            >
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz
            lokal={lokal}
            className="m-neon-ramka flex h-14 items-center justify-center gap-2 rounded-2xl border border-akcent/60 font-black text-akcent-tekst"
          >
            <Navigation className="size-5" aria-hidden /> Prowadź
          </PrzyciskProwadz>
        </div>
        {lokal.dostawa && (
          <p className="mt-4 flex items-center gap-2 text-sm font-extrabold text-[#4ade80]">
            <Truck className="size-4" aria-hidden /> Dowóz {dostawa ? "— cennik pod menu" : ""}
          </p>
        )}

        {menu ? (
          <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} />
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-obrys-2 p-5 font-semibold text-tekst-2">
            Menu jeszcze nie ma — zadzwoń i zapytaj.
          </p>
        )}

        <section className="mt-10">
          <h2 className="m-neon-rozowy font-grotesk text-2xl font-bold">Godziny</h2>
          <div className="mt-3 rounded-2xl border border-obrys bg-karta/80 p-4 backdrop-blur">
            {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="text-sm text-tekst-2">Brak informacji.</p>}
          </div>
        </section>
        <section className="mt-8">
          <h2 className="m-neon-rozowy font-grotesk text-2xl font-bold">Dojazd</h2>
          <iframe
            title={`Mapa: ${lokal.nazwa}`}
            src={adresMapy(lokal)}
            loading="lazy"
            className="mt-3 h-60 w-full rounded-2xl border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.6)]"
          />
        </section>
      </main>
    </div>
  );
}
