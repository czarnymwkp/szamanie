"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowLeft, Clock, Heart, Leaf, MapPin, Navigation, Phone, RotateCcw, Search, Shuffle, X } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import type { Lokal } from "@/lib/lokale";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import Szaman from "../Szaman";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { adresMapy } from "../szablony/wspolne";
import { useKatalog } from "../useKatalog";
import { useUlubione } from "../useUlubione";
import FiltryM from "./FiltryM";
import MenuZakladki from "./MenuZakladki";
import { bricolage } from "./fonty";
import { adresM, losowe, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 5 · Talia kart — „Nie wiesz, co zjeść?”: karty lokali przesuwa się palcem (w prawo — do ulubionych,
// w lewo — dalej, dotknięcie — otwórz). Pastelowe bąble światła w tle. Na stronie lokalu sekcje układają się
// w stos przyklejonych kart, a menu wjeżdża na nie od dołu.

const PASTELE = ["#ffe1cc", "#ffd6e7", "#e3dcff", "#d4f5e4", "#fff1b8", "#d6ecff"];

const los = losowe(5);
const BABLE = Array.from({ length: 6 }, (_, i) => ({
  left: `${Math.round(los() * 90)}%`,
  top: `${Math.round(los() * 90)}%`,
  width: `${140 + Math.round(los() * 160)}px`,
  height: `${140 + Math.round(los() * 160)}px`,
  background: ["#ffb38a", "#ff9ec7", "#b9a8ff", "#8be3b8", "#ffd86b", "#9fd0ff"][i],
  "--t": `${16 + Math.round(los() * 12)}s`,
  "--d": `${-Math.round(los() * 10)}s`,
  "--dx": `${Math.round((los() - 0.5) * 160)}px`,
  "--dy": `${Math.round((los() - 0.5) * 200)}px`,
})) as CSSProperties[];

function TloBable() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      {BABLE.map((styl, i) => (
        <span key={i} className="m-babel" style={styl} />
      ))}
    </div>
  );
}

/** Talia: wierzchnią kartę przesuwa się palcem; dwie następne leżą pod spodem, lekko obrócone. */
function Talia({ lokale, nr }: { lokale: Lokal[]; nr: number }) {
  const router = useRouter();
  const { ulubione, przelacz } = useUlubione();
  const [indeks, setIndeks] = useState(0);
  const [ruch, setRuch] = useState({ x: 0, y: 0 });
  const [odlot, setOdlot] = useState<-1 | 0 | 1>(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [ciagne, setCiagne] = useState(false);
  if (!lokale.length) return null;

  const wierzch = lokale[indeks % lokale.length];
  const odrzuc = (kierunek: -1 | 1) => {
    if (kierunek === 1 && !ulubione.has(wierzch.slug)) przelacz(wierzch.slug);
    setOdlot(kierunek);
    setTimeout(() => {
      setOdlot(0);
      setRuch({ x: 0, y: 0 });
      setIndeks((i) => i + 1);
    }, 260);
  };
  const dol = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setCiagne(true);
  };
  const przesun = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current) setRuch({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const gora = () => {
    if (!start.current) return;
    start.current = null;
    setCiagne(false);
    if (Math.abs(ruch.x) > 90) odrzuc(ruch.x > 0 ? 1 : -1);
    else if (Math.abs(ruch.x) < 6 && Math.abs(ruch.y) < 6) router.push(lokalM(nr, wierzch.slug));
    else setRuch({ x: 0, y: 0 });
  };
  const przechyl = odlot ? odlot * 28 : ruch.x / 16;

  return (
    <div>
      <div className="relative mx-auto h-[26rem] max-w-sm">
        {[2, 1].map((g) => {
          const l = lokale[(indeks + g) % lokale.length];
          return (
            <div
              key={`${l.id}-${indeks + g}`}
              aria-hidden
              className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-lg transition-transform duration-300"
              style={{ transform: `translateY(${g * 14}px) scale(${1 - g * 0.05}) rotate(${g === 1 ? 3 : -4}deg)` }}
            >
              <Miniatura lokal={l} className="size-full" sizes="384px" dopisek={false} />
            </div>
          );
        })}
        <div
          key={`${wierzch.id}-${indeks}`}
          role="button"
          tabIndex={0}
          aria-label={`${wierzch.nazwa} — dotknij, żeby otworzyć, przesuń w prawo do ulubionych`}
          onPointerDown={dol}
          onPointerMove={przesun}
          onPointerUp={gora}
          onPointerCancel={gora}
          onKeyDown={(e) => e.key === "Enter" && router.push(lokalM(nr, wierzch.slug))}
          className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-[2rem] bg-karta shadow-[0_24px_50px_rgba(0,0,0,0.22)] select-none active:cursor-grabbing"
          style={{
            transform: odlot
              ? `translate(${odlot * 130}vw, ${ruch.y}px) rotate(${przechyl}deg)`
              : `translate(${ruch.x}px, ${ruch.y * 0.25}px) rotate(${przechyl}deg)`,
            transition: ciagne ? "none" : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <Miniatura lokal={wierzch} className="pointer-events-none size-full" sizes="384px" priorytet />
          <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <span
            className="absolute top-6 left-5 -rotate-12 rounded-xl border-4 border-[#22c55e] px-3 py-1 text-2xl font-black text-[#22c55e]"
            style={{ opacity: Math.max(0, ruch.x / 90) }}
          >
            ♥ BIORĘ
          </span>
          <span
            className="absolute top-6 right-5 rotate-12 rounded-xl border-4 border-[#ef4444] px-3 py-1 text-2xl font-black text-[#ef4444]"
            style={{ opacity: Math.max(0, -ruch.x / 90) }}
          >
            DALEJ ✕
          </span>
          <span className="absolute inset-x-5 bottom-5 text-white">
            <span className={`${bricolage.className} block text-3xl leading-tight font-extrabold`}>{wierzch.nazwa}</span>
            <span className="mt-1 block text-sm font-bold text-white/80">{opisLokalu(wierzch)}</span>
            <span className="mt-2 flex items-center gap-3 text-sm font-bold">
              <StatusOtwarcia godziny={wierzch.godziny} ciemne />
              <span className="flex items-center gap-1 text-white/80">
                <MapPin className="size-3.5" aria-hidden /> {wierzch.miejscowosc}
              </span>
            </span>
          </span>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setIndeks((i) => Math.max(0, i - 1))}
          aria-label="Cofnij"
          className="flex size-12 items-center justify-center rounded-full bg-white text-tekst-2 shadow-md"
        >
          <RotateCcw className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => odrzuc(-1)}
          aria-label="Dalej"
          className="flex size-16 items-center justify-center rounded-full bg-white text-[#ef4444] shadow-lg transition active:scale-90"
        >
          <X className="size-8" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => odrzuc(1)}
          aria-label="Do ulubionych"
          className="flex size-16 items-center justify-center rounded-full bg-white text-[#22c55e] shadow-lg transition active:scale-90"
        >
          <Heart className={`size-8 ${ulubione.has(wierzch.slug) ? "fill-current" : ""}`} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setIndeks(Math.floor(Math.random() * lokale.length))}
          aria-label="Losuj"
          className="flex size-12 items-center justify-center rounded-full bg-white text-tekst-2 shadow-md"
        >
          <Shuffle className="size-5" aria-hidden />
        </button>
      </div>
      {ulubione.size > 0 && (
        <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
          {lokale
            .filter((l) => ulubione.has(l.slug))
            .map((l) => (
              <Link key={l.id} href={lokalM(nr, l.slug)} className="flex shrink-0 items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1 text-sm font-extrabold shadow-sm">
                <Miniatura lokal={l} className="size-8 rounded-full" dopisek={false} />
                <Heart className="size-3.5 fill-[#22c55e] text-[#22c55e]" aria-hidden /> {l.nazwa}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-2xl px-4 text-sm font-extrabold shadow-sm transition active:scale-95 ${
    aktywny ? "bg-tekst text-white" : "bg-white"
  }`;

export function GlownaM05({ lokale, miejscowosci, nr }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#fff8f2] pb-16">
      <TloBable />
      <header className="sticky top-0 z-40 bg-[#fff8f2]/75 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-5">
        <section className="relative pt-4">
          <Szaman className="pointer-events-none absolute -top-2 -right-2 w-28 animate-wjazd [animation-delay:300ms]" />
          <p className={`${bricolage.className} animate-wjazd text-lg font-bold text-tekst-2`}>Hej! 👋</p>
          <h1 className={`${bricolage.className} animate-wjazd text-[2.6rem] leading-[1] font-extrabold tracking-tight [animation-delay:60ms]`}>
            Co dziś szamiesz?
          </h1>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-5 flex h-14 animate-wjazd items-center gap-2 rounded-3xl bg-white pr-2 pl-4 shadow-[0_10px_30px_rgba(120,60,200,0.12)] [animation-delay:120ms]"
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
              className={`flex h-10 items-center gap-1 rounded-2xl px-3 text-sm font-extrabold transition ${
                k.tylkoWege ? "bg-[#22c55e] text-white" : "bg-[#d4f5e4] text-[#15803d]"
              }`}
            >
              <Leaf className="size-4" aria-hidden /> Wege
            </button>
          </form>
        </section>

        <BaneryReklamowe className="mt-6 [--promien-reklamy:2rem]" />

        <section aria-labelledby="kategorie" className="mt-7">
          <h2 id="kategorie" className={`${bricolage.className} text-2xl font-extrabold`}>
            Na co masz ochotę?
          </h2>
          <div className="-mx-5 mt-3 flex gap-2.5 overflow-x-auto px-5 pt-1 pb-2 [scrollbar-width:none]">
            {k.kategorie.map((kat, i) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button
                  key={kat.id}
                  type="button"
                  aria-pressed={aktywna}
                  onClick={() => k.setKategoria(kat.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl py-2.5 pr-4 pl-3 font-extrabold transition active:scale-95 ${
                    aktywna ? "bg-tekst text-white shadow-lg" : ""
                  }`}
                  style={aktywna ? undefined : { background: PASTELE[i % PASTELE.length] }}
                >
                  <IkonaTypu ikona={kat.ikona} className="size-6" />
                  {kat.nazwa}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="talia" className="mt-8">
          <h2 id="talia" className={`${bricolage.className} text-2xl font-extrabold`}>
            Nie wiesz, co wybrać?
          </h2>
          <p className="mb-5 text-sm font-semibold text-tekst-2">Przesuń kartę: w prawo ♥ do ulubionych, w lewo — dalej. Dotknij, żeby otworzyć.</p>
          <Talia key={`${k.kategoria}|${k.szukaj}|${k.tylkoWege}|${k.tylkoOtwarte}`} lokale={k.wyniki} nr={nr} />
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-10 scroll-mt-16">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} />
          <h2 className={`${bricolage.className} mt-3 text-2xl font-extrabold`}>
            Wszystkie: {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-3 space-y-2.5">
            {k.wyniki.map((l, i) => (
              <li key={l.id} className="pojawianie">
                <Link
                  href={lokalM(nr, l.slug)}
                  className="flex items-center gap-3 rounded-3xl p-2 pr-4 transition active:scale-[0.98]"
                  style={{ background: PASTELE[i % PASTELE.length] }}
                >
                  <Miniatura lokal={l} className="size-16 shrink-0 rounded-2xl" dopisek={false} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{l.nazwa}</span>
                    <span className="block truncate text-xs font-bold text-tekst-2">{opisLokalu(l)}</span>
                    <StatusOtwarcia godziny={l.godziny} className="text-xs" />
                  </span>
                  {(l.cechy.wege || l.cechy.wegan) && <Leaf className="size-4 shrink-0 text-[#15803d]" aria-label="wege" />}
                  {k.odleglosc(l) && <span className="shrink-0 text-xs font-extrabold">{k.odleglosc(l)}</span>}
                </Link>
              </li>
            ))}
          </ul>
          {!k.wyniki.length && (
            <button type="button" onClick={k.wyczysc} className={`${chip(true)} mx-auto mt-5`}>
              Nic nie ma — pokaż wszystko
            </button>
          )}
        </section>
      </main>
    </div>
  );
}

export function LokalM05({ lokal, menu, dostawa, nr }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);
  // karty przyklejają się coraz niżej — spod każdej wystaje pasek poprzedniej
  const karta = "sticky overflow-hidden rounded-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]";

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#fff8f2] pb-16">
      <TloBable />
      <main id="tresc" className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <section className={`${karta} top-3 z-[1] h-80`}>
          <Miniatura lokal={lokal} className="size-full" sizes="100vw" priorytet />
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
          <Link href={adresM(nr)} aria-label="Wszystkie lokale" className="absolute top-4 left-4 flex size-11 items-center justify-center rounded-full bg-white/90">
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          <div className="absolute inset-x-5 bottom-5 text-white">
            <h1 className={`${bricolage.className} text-[2.3rem] leading-[1] font-extrabold`}>{lokal.nazwa}</h1>
            <p className="mt-1 text-sm font-bold text-white/80">{opisLokalu(lokal)}</p>
          </div>
        </section>

        <section className={`${karta} top-6 z-[2] bg-[#ffe1cc] p-5`}>
          <StatusOtwarcia godziny={lokal.godziny} />
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold">
            <MapPin className="size-4" aria-hidden /> {pelnyAdres(lokal)}
          </p>
          {(lokal.cechy.wege || lokal.cechy.wegan) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[#15803d]">
              <Leaf className="size-4" aria-hidden /> Opcje wegetariańskie
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {lokal.telefon && (
              <a href={linkTelefonu(lokal.telefon)} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-tekst font-extrabold text-white">
                <Phone className="size-5" aria-hidden /> Zadzwoń
              </a>
            )}
            <PrzyciskProwadz lokal={lokal} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white font-extrabold">
              <Navigation className="size-5" aria-hidden /> Prowadź
            </PrzyciskProwadz>
          </div>
        </section>

        <section className={`${karta} top-9 z-[3] bg-[#e3dcff] p-5`}>
          <h2 className={`${bricolage.className} flex items-center gap-2 text-xl font-extrabold`}>
            <Clock className="size-5" aria-hidden /> Godziny
          </h2>
          <div className="mt-2">{tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="text-sm">Brak informacji.</p>}</div>
        </section>

        <section className={`${karta} top-12 z-[4] bg-[#d4f5e4] p-2`}>
          <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="h-52 w-full rounded-[1.6rem] border-0" />
        </section>

        <section className="relative z-10 rounded-[2rem] bg-white px-5 pt-5 pb-6 shadow-[0_-12px_40px_rgba(0,0,0,0.12)]">
          <h2 className={`${bricolage.className} text-3xl font-extrabold`}>Menu</h2>
          {menu ? (
            <MenuZakladki
              menu={menu}
              dostawa={dostawa}
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              telefon={lokal.telefon}
              wyglad={{
                pasek: "bg-white/90 backdrop-blur",
                aktywna: "bg-tekst text-white",
                nieaktywna: "bg-[#fff1e6]",
                naglowek: `${bricolage.className} text-2xl font-extrabold`,
                miniatura: "rounded-3xl",
              }}
            />
          ) : (
            <p className="mt-2 font-semibold text-tekst-2">Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
          )}
        </section>
      </main>
    </div>
  );
}
