"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Clock, Leaf, MapPin, Navigation, Phone, Search } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { ZDJECIA_KATEGORII } from "@/lib/zdjeciaKategorii";
import BaneryReklamowe from "../BaneryReklamowe";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { adresMapy } from "../szablony/wspolne";
import { useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import MenuKafle from "./MenuKafle";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { elegancki } from "./fonty";
import { adresM, losowe, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 9 · Smak — jak magazyn kulinarny nocą: na górze pełnoekranowe zdjęcia jedzenia przenikają się z powolnym
// najazdem kamery, nad talerzem unosi się para. Ciepłe, ciemne kolory, elegancka kursywa. Kategorie jak
// relacje na Instagramie (kółka ze zdjęciami), lokale jako duże zdjęcia z podpisem. Menu w kaflach ze zdjęciami dań.

const ESPRESSO = {
  "--color-tlo": "#140d09",
  "--color-karta": "#1f1510",
  "--color-krem": "#2a1d15",
  "--color-tekst": "#fbf3ea",
  "--color-tekst-2": "#c4b3a2",
  "--color-obrys": "#33241a",
  "--color-obrys-2": "#4a3526",
  "--color-akcent": "#ff7a1a",
  "--color-akcent-tekst": "#ff9d57",
  "--color-na-akcencie": "#140d09",
  "--color-otwarte": "#86efac",
  "--color-zamkniete": "#fca5a5",
  colorScheme: "dark",
} as CSSProperties;

const ZDJECIA_HERO = (["pizza", "burger", "kebab", "polska", "kawa"] as const).map((k) => ZDJECIA_KATEGORII[k]);
const ZDJECIE_KATEGORII: Record<string, string | undefined> = {
  pizza: ZDJECIA_KATEGORII.pizza?.plik,
  kebab: ZDJECIA_KATEGORII.kebab?.plik,
  burgery: ZDJECIA_KATEGORII.burger?.plik,
  restauracje: ZDJECIA_KATEGORII.restauracja?.plik,
  fastfood: ZDJECIA_KATEGORII.fastfood?.plik,
  kawiarnie: ZDJECIA_KATEGORII.kawa?.plik,
  lody: ZDJECIA_KATEGORII.lody?.plik,
  azjatycka: ZDJECIA_KATEGORII.azjatycka?.plik,
  puby: ZDJECIA_KATEGORII.piwo?.plik,
};

const los = losowe(9);
const PARA = Array.from({ length: 7 }, () => ({
  left: `${10 + Math.round(los() * 75)}%`,
  "--s": `${90 + Math.round(los() * 90)}px`,
  "--t": `${7 + Math.round(los() * 6)}s`,
  "--d": `${-Math.round(los() * 10)}s`,
  "--dx": `${Math.round((los() - 0.5) * 60)}px`,
})) as CSSProperties[];

function Para() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARA.map((s, i) => (
        <span key={i} className="m-para" style={s} />
      ))}
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition active:scale-95 ${
    aktywny ? "border-akcent bg-akcent text-black" : "border-obrys-2 bg-karta"
  }`;

export function GlownaM09({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);

  return (
    <div style={ESPRESSO} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <section className="relative h-[78vh] min-h-[30rem] overflow-hidden">
        {ZDJECIA_HERO.map((z, i) =>
          z ? (
            <div key={z.plik} className="m-przenikanie absolute inset-0" style={{ animationDelay: `${i * 4}s` }}>
              <Image src={z.plik} alt="" fill sizes="100vw" priority={i === 0} className="m-najazd object-cover" style={{ objectPosition: z.pozycja }} />
            </div>
          ) : null,
        )}
        <span className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-tlo" />
        <Para />
        <header className="absolute inset-x-0 top-0 z-10">
          <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
            <Image src="/logo-ciemne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
          </div>
        </header>
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-2xl px-5 pb-6">
          <SzamanM styl="cieply" className="pointer-events-none absolute right-3 bottom-36 w-28 animate-wjazd [animation-delay:400ms]" />
          <p className={`${elegancki.className} animate-wjazd text-2xl text-akcent-tekst italic`}>Kraśnik i okolice</p>
          <h1 className={`${elegancki.className} animate-wjazd text-[3.6rem] leading-[0.95] [animation-delay:80ms]`}>
            Co dziś <span className="italic">szamiesz?</span>
          </h1>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-5 flex h-14 animate-wjazd items-center gap-2 rounded-full bg-white/12 pr-2 pl-4 ring-1 ring-white/20 backdrop-blur-xl [animation-delay:140ms]"
          >
            <Search className="size-5 shrink-0 text-white/70" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Pizza, kebab, nazwa lokalu…"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-semibold text-white outline-none placeholder:text-white/55"
            />
            <button
              type="button"
              onClick={() => k.setTylkoWege(!k.tylkoWege)}
              aria-pressed={k.tylkoWege}
              aria-label="Tylko wege"
              className={`flex size-10 items-center justify-center rounded-full ${k.tylkoWege ? "bg-[#86efac] text-black" : "text-[#86efac]"}`}
            >
              <Leaf className="size-5" aria-hidden />
            </button>
          </form>
        </div>
      </section>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <BaneryReklamowe ciemne className="mt-2 [--promien-reklamy:1.25rem]" />

        <section aria-labelledby="kategorie" className="mt-7">
          <h2 id="kategorie" className={`${elegancki.className} text-3xl`}>
            Na co masz <span className="italic">ochotę?</span>
          </h2>
          <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
            {k.kategorie.map((kat) => {
              const aktywna = k.kategoria === kat.id;
              const zdjecie = ZDJECIE_KATEGORII[kat.id];
              return (
                <button key={kat.id} type="button" aria-pressed={aktywna} onClick={() => k.setKategoria(kat.id)} className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5">
                  <span
                    className={`rounded-full p-[3px] ${aktywna ? "bg-gradient-to-tr from-[#ff7a1a] via-[#ffb347] to-[#ff3d7f]" : "bg-obrys-2"}`}
                  >
                    <span className="relative flex size-[4.25rem] items-center justify-center overflow-hidden rounded-full border-[3px] border-tlo bg-krem">
                      {zdjecie ? (
                        <Image src={zdjecie} alt="" fill sizes="68px" className="object-cover" />
                      ) : (
                        <span className={`${elegancki.className} text-2xl italic`}>{kat.nazwa[0]}</span>
                      )}
                    </span>
                  </span>
                  <span className="text-xs font-bold whitespace-nowrap">{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-6 scroll-mt-4">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} wegeWlaczone="border-[#86efac] bg-[#86efac] text-black" />
          <h2 className={`${elegancki.className} mt-3 text-3xl`}>
            {k.wyniki.length} <span className="italic">{odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}</span>
          </h2>
          <ul className="mt-4 space-y-5">
            {k.wyniki.map((l) => (
              <li key={l.id} className="pojawianie">
                <Link href={lokalM(nr, l.slug)} className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem]">
                  <Miniatura lokal={l} className="size-full" sizes="(min-width: 672px) 640px, 100vw" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  {(l.cechy.wege || l.cechy.wegan) && (
                    <span className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-[#86efac] px-2.5 py-1 text-xs font-extrabold text-black">
                      <Leaf className="size-3.5" aria-hidden /> wege
                    </span>
                  )}
                  <span className="absolute inset-x-5 bottom-5">
                    <span className={`${elegancki.className} block text-[2.2rem] leading-[1]`}>{l.nazwa}</span>
                    <span className="mt-1 block text-sm font-semibold text-white/75">
                      {opisLokalu(l)} · {l.miejscowosc}
                    </span>
                    <StatusOtwarcia godziny={l.godziny} ciemne className="mt-1 text-sm" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="cieply" />
    </div>
  );
}

export function LokalM09({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);

  return (
    <div style={ESPRESSO} className="relative isolate min-h-screen overflow-x-clip bg-tlo text-tekst">
      <section className="relative h-[70vh] min-h-96 overflow-hidden">
        <div className="m-paralaksa absolute inset-0">
          <Miniatura lokal={lokal} className="m-najazd size-full" sizes="100vw" priorytet />
        </div>
        <span className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-tlo" />
        <Para />
        <Link href={adresM(nr)} aria-label="Wszystkie lokale" className="absolute top-4 left-4 z-10 flex size-11 items-center justify-center rounded-full bg-black/40 ring-1 ring-white/20 backdrop-blur">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="absolute inset-x-5 bottom-6 z-10">
          <p className={`${elegancki.className} animate-wjazd text-xl text-akcent-tekst italic`}>{opisLokalu(lokal).split(" · ").slice(0, 2).join(" & ")}</p>
          <h1 className={`${elegancki.className} animate-wjazd text-[3.4rem] leading-[0.95] [animation-delay:80ms]`}>{lokal.nazwa}</h1>
          <StatusOtwarcia godziny={lokal.godziny} ciemne className="mt-2" />
        </div>
      </section>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <div className="grid grid-cols-2 gap-3">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className="flex h-14 items-center justify-center gap-2 rounded-full bg-akcent font-extrabold text-black shadow-[0_10px_30px_rgba(255,122,26,0.35)]">
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className="flex h-14 items-center justify-center gap-2 rounded-full font-extrabold ring-1 ring-white/25">
            <Navigation className="size-5" aria-hidden /> Prowadź
          </PrzyciskProwadz>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-tekst-2">
          <MapPin className="size-4" aria-hidden /> {pelnyAdres(lokal)}
        </p>

        <section className="mt-9">
          <h2 className={`${elegancki.className} mb-4 text-[2.4rem] leading-none`}>
            Karta <span className="italic">dań</span>
          </h2>
          {menu ? (
            <MenuKafle menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} ciemne />
          ) : (
            <p className="text-tekst-2">Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
          )}
        </section>

        <section className="mt-10 rounded-[1.75rem] bg-karta p-5">
          <h2 className={`${elegancki.className} flex items-center gap-2 text-2xl`}>
            <Clock className="size-5 text-akcent-tekst" aria-hidden /> Godziny
          </h2>
          <div className="mt-2">{tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="text-sm text-tekst-2">Brak informacji.</p>}</div>
        </section>
        <iframe
          title={`Mapa: ${lokal.nazwa}`}
          src={adresMapy(lokal)}
          loading="lazy"
          className="mt-4 h-56 w-full rounded-[1.75rem] border-0 [filter:sepia(0.5)_brightness(0.75)_contrast(1.1)]"
        />
      </main>
      <StopkaM linki={linki} szaman="cieply" />
    </div>
  );
}
