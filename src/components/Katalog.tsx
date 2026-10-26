"use client";

import Link from "next/link";
import { useEffect, useRef, type FormEvent, type RefObject } from "react";
import { ArrowRight, Info, LoaderCircle, LocateFixed, MoonStar, Search } from "lucide-react";
import type { Lokal, Miejscowosc } from "@/lib/lokale";
import type { KluczIkony } from "@/lib/motyw";
import { KATEGORIE, odmiana, opisLokalu } from "@/lib/nazwy";
import IkonaTypu from "./IkonaTypu";
import KartaLokalu from "./KartaLokalu";
import Miniatura from "./Miniatura";
import Szaman from "./Szaman";
import { PROMIENIE, TRYBY, TWOJA_LOKALIZACJA, useKatalog } from "./useKatalog";

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-sm font-extrabold transition active:scale-95 disabled:opacity-50 ${
    aktywny ? "border-tekst bg-tekst text-white" : "border-obrys-2 bg-white hover:border-tekst"
  }`;

export default function Katalog({
  lokale,
  miejscowosci,
  prefiks,
}: {
  lokale: Lokal[];
  miejscowosci: Miejscowosc[];
  prefiks?: string;
}) {
  const k = useKatalog(lokale, miejscowosci);
  const { pozycja } = k;
  const pole = useRef<HTMLInputElement>(null);
  usePisanePodpowiedzi(pole);

  const doWynikow = () => document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const szukajTeraz = (e: FormEvent) => {
    e.preventDefault();
    doWynikow();
  };
  const wybierzKategorie = (id: string) => {
    k.setKategoria(id);
    doWynikow();
  };

  return (
    <>
      {/* Góra strony z propozycji 3 („Tryb nocny”): ciemne tło, pomarańczowa poświata, duży napis. */}
      <section className="relative overflow-hidden rounded-b-[2.25rem] bg-noc text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -right-24 size-80 rounded-full bg-akcent/30 blur-3xl lg:top-[-30%] lg:right-[6%] lg:size-[32rem]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 size-72 rounded-full bg-akcent/10 blur-3xl"
        />
        <Szaman className="pointer-events-none absolute top-2 -right-1 w-32 animate-wjazd [animation-delay:300ms] lg:hidden" />
        <div className="relative mx-auto flex max-w-6xl items-center gap-10 px-5 pt-9 pb-10 lg:pt-14 lg:pb-16">
          <div className="min-w-0 flex-1 lg:max-w-xl">
            <h1 className="animate-wjazd font-grotesk text-[3.6rem] leading-[0.9] font-bold tracking-tight lg:text-[5.75rem]">
              Co dziś
              <br />
              <span className="text-akcent">szamiesz?</span>
            </h1>
            <p className="mt-4 max-w-md animate-wjazd text-[15px] leading-relaxed font-semibold text-white/75 [animation-delay:90ms] lg:text-lg">
              Gdzie zjeść w Kraśniku i okolicy: {lokale.length}{" "}
              {odmiana(lokale.length, ["lokal", "lokale", "lokali"])}, od śniadania po późny kebab. Godziny otwarcia,
              telefon i dojazd w jednym miejscu.
            </p>

            <div
              role="radiogroup"
              aria-label="Co chcesz zrobić"
              className="mt-6 inline-flex max-w-full animate-wjazd gap-1 rounded-full bg-white/[0.08] p-1 [animation-delay:150ms]"
            >
              {TRYBY.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={k.tryb === t.id}
                  onClick={() => k.setTryb(t.id)}
                  className={`rounded-full px-3.5 py-2 text-sm font-extrabold whitespace-nowrap transition sm:px-4 ${
                    k.tryb === t.id ? "bg-white text-tekst shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t.nazwa}
                </button>
              ))}
            </div>

            <form
              role="search"
              onSubmit={szukajTeraz}
              className="mt-3 flex max-w-xl animate-wjazd items-center gap-2 rounded-full bg-white py-1.5 pr-1.5 pl-4 text-tekst shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-shadow [animation-delay:210ms] focus-within:shadow-[0_0_0_4px_rgba(255,100,0,0.45),0_8px_24px_rgba(0,0,0,0.4)]"
            >
              <Search className="size-5 shrink-0 text-tekst-2" aria-hidden />
              <label htmlFor="szukaj" className="sr-only">
                Szukaj lokalu
              </label>
              <input
                ref={pole}
                id="szukaj"
                type="search"
                value={k.szukaj}
                onChange={(e) => k.setSzukaj(e.target.value)}
                placeholder="Pizza, kebab, nazwa lokalu…"
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] font-semibold outline-none placeholder:text-tekst-2"
              />
              <button
                type="submit"
                aria-label="Pokaż wyniki"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-akcent text-tekst transition hover:scale-105 active:scale-95"
              >
                <ArrowRight className="size-5" aria-hidden />
              </button>
            </form>
            <p className="mt-4 flex animate-wjazd flex-wrap items-center gap-2 text-sm font-bold [animation-delay:270ms]">
              <span className="text-white/60">Popularne:</span>
              {(["pizza", "kebab", "burgery"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => wybierzKategorie(id)}
                  className="rounded-full bg-white/10 px-3 py-1 transition hover:bg-akcent hover:text-tekst"
                >
                  {KATEGORIE.find((kat) => kat.id === id)?.nazwa}
                </button>
              ))}
            </p>
          </div>
          <DekoracjaBanera />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <section aria-labelledby="kategorie" className="pt-7">
          <h2 id="kategorie" className="font-grotesk text-2xl font-bold tracking-tight lg:text-3xl">
            Na co masz ochotę?
          </h2>
          <div className="-mx-5 mt-4 flex gap-3.5 overflow-x-auto px-5 pt-1 pb-2 [scrollbar-width:none] lg:gap-6">
            {k.kategorie.map((kat, i) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button
                  key={kat.id}
                  type="button"
                  aria-pressed={aktywna}
                  onClick={() => k.setKategoria(kat.id)}
                  className="group flex w-16 shrink-0 animate-wjazd flex-col items-center gap-1.5 lg:w-20"
                  style={{ animationDelay: `${300 + i * 40}ms` }}
                >
                  <span
                    className={`flex size-16 items-center justify-center rounded-full transition duration-300 group-hover:-translate-y-1 lg:size-20 ${
                      aktywna
                        ? "bg-white shadow-md ring-[2.5px] ring-akcent"
                        : "bg-krem group-hover:bg-white group-hover:shadow-md"
                    }`}
                  >
                    <IkonaTypu ikona={kat.ikona} className="size-7 group-hover:animate-kolysanie lg:size-8" />
                  </span>
                  <span className="text-[13px] font-extrabold whitespace-nowrap">{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        {k.doPozna.length > 0 && k.kategoria === "wszystko" && !k.szukaj && (
          <DoPozna pozycje={k.doPozna} prefiks={prefiks} />
        )}

        <section id="wyniki" aria-label="Lokale" className="mt-5 scroll-mt-20">
          <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none]">
            <button type="button" onClick={k.uzyjLokalizacji} aria-pressed={k.zLokalizacja} className={chip(k.zLokalizacja)}>
              {k.szukamPozycji ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : (
                <LocateFixed className="size-4" aria-hidden />
              )}
              Blisko mnie
            </button>
            <select
              value={pozycja && !k.zLokalizacja ? pozycja.opis : ""}
              onChange={(e) => k.wybierzMiejscowosc(e.target.value)}
              aria-label="Szukaj blisko miejscowości"
              className={`${chip(!!pozycja && !k.zLokalizacja)} max-w-52 appearance-none`}
            >
              <option value="">{miejscowosci.length ? "albo wybierz miejscowość" : "Cała okolica"}</option>
              {miejscowosci.map((m) => (
                <option key={m.nazwa} value={m.nazwa}>
                  {m.nazwa}
                </option>
              ))}
            </select>
            {pozycja && (
              <div role="radiogroup" aria-label="Promień" className="flex shrink-0 gap-1 rounded-full bg-obrys p-1">
                {PROMIENIE.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={k.promien === p}
                    onClick={() => k.setPromien(p)}
                    className={`h-8 rounded-full px-3 text-sm font-extrabold transition ${
                      k.promien === p ? "bg-tekst text-white" : "hover:bg-white"
                    }`}
                  >
                    {p} km
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              aria-pressed={k.tylkoOtwarte}
              disabled={!k.teraz}
              onClick={() => k.setTylkoOtwarte(!k.tylkoOtwarte)}
              className={chip(k.tylkoOtwarte)}
            >
              Otwarte teraz
            </button>
          </div>
          {k.bladPozycji && (
            <p role="status" className="mb-3 animate-wjazd text-sm font-bold text-zamkniete">
              {k.bladPozycji}
            </p>
          )}

          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-1 pb-3">
            <h2 className="font-grotesk text-2xl font-bold tracking-tight lg:text-3xl" aria-live="polite">
              {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
              {pozycja && (
                <span className="text-base font-bold text-tekst-2">
                  {" "}
                  do {k.promien} km od: {pozycja.opis === TWOJA_LOKALIZACJA ? "Ciebie" : pozycja.opis}
                </span>
              )}
            </h2>
            <span className="text-[13px] font-bold text-tekst-2">
              Najpierw promowane{pozycja ? ", potem najbliższe" : ""}
            </span>
          </div>

          {k.tryb === "zamowie" && (
            <p className="mb-4 flex animate-wjazd gap-2 rounded-2xl bg-krem p-4 text-sm font-semibold">
              <Info className="mt-0.5 size-4 shrink-0 text-akcent-tekst" aria-hidden />
              Pokazujemy lokale, które oznaczyły dostawę albo jedzenie na wynos. Wkrótce: kto dowozi pod Twój adres i za
              ile.
            </p>
          )}

          {k.wyniki.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {k.wyniki.map((l) => (
                <KartaLokalu key={l.id} lokal={l} odleglosc={k.odleglosc(l)} prefiks={prefiks} />
              ))}
            </ul>
          ) : (
            <div className="animate-wjazd rounded-2xl border-2 border-dashed border-obrys-2 p-8 text-center font-semibold text-tekst-2">
              {pozycja && k.wiekszyPromien ? (
                <>
                  W promieniu {k.promien} km nic nie znaleźliśmy.{" "}
                  <button
                    type="button"
                    onClick={() => k.setPromien(k.wiekszyPromien!)}
                    className="font-black text-akcent-tekst underline"
                  >
                    Szukaj do {k.wiekszyPromien} km
                  </button>
                </>
              ) : (
                <>
                  Nic nie znaleziono.{" "}
                  <button type="button" onClick={k.wyczysc} className="font-black text-akcent-tekst underline">
                    Wyczyść filtry
                  </button>
                </>
              )}
            </div>
          )}

          <p className="mt-6 text-xs font-semibold text-tekst-2">
            Kolejność: najpierw lokale z wykupionym wyróżnieniem (oznaczone „Promowane”), potem
            {pozycja ? " od najbliższych" : " alfabetycznie"}. Odległości w linii prostej.
          </p>
        </section>
      </div>
    </>
  );
}

const PIGULKI: { nazwa: string; ikona: KluczIkony; miejsce: string; opoznienie: string }[] = [
  { nazwa: "Pizza", ikona: "pizza", miejsce: "top-[10%] left-0", opoznienie: "0s" },
  { nazwa: "Kawa", ikona: "kawa", miejsce: "top-[16%] right-0", opoznienie: "-2s" },
  { nazwa: "Kebab", ikona: "kebab", miejsce: "bottom-[14%] left-[4%]", opoznienie: "-4s" },
  { nazwa: "Lody", ikona: "lody", miejsce: "bottom-[8%] right-[8%]", opoznienie: "-1s" },
];

/** Ciemny pas z propozycji 3: lokale czynne teraz do późna, z wielką godziną zamknięcia. */
function DoPozna({
  pozycje,
  prefiks = "/lokal/",
}: {
  pozycje: ReturnType<typeof useKatalog>["doPozna"];
  prefiks?: string;
}) {
  return (
    <section
      aria-labelledby="do-pozna"
      className="pojawianie relative mt-8 overflow-hidden rounded-[1.6rem] bg-noc px-5 pt-6 pb-5 text-white lg:px-8 lg:pt-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-akcent/20 blur-3xl"
      />
      <h2 id="do-pozna" className="relative flex items-center gap-2 font-grotesk text-2xl font-bold tracking-tight lg:text-3xl">
        <MoonStar className="size-6 text-akcent" aria-hidden /> Otwarte do późna
      </h2>
      <ul className="relative -mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:-mx-8 lg:px-8">
        {pozycje.map(({ lokal, doGodziny }) => (
          <li
            key={lokal.id}
            className="group relative w-56 shrink-0 snap-start overflow-hidden rounded-2xl bg-noc-2 transition duration-300 hover:-translate-y-1 has-[a:focus-visible]:ring-4 has-[a:focus-visible]:ring-akcent/50"
          >
            <Miniatura lokal={lokal} className="h-28" sizes="224px" />
            <div className="p-4">
              <Link
                href={`${prefiks}${lokal.slug}`}
                className="block truncate font-extrabold outline-none after:absolute after:inset-0"
              >
                {lokal.nazwa}
              </Link>
              <p className="truncate text-xs font-semibold text-white/55">{opisLokalu(lokal)}</p>
              <p className="mt-1 font-grotesk text-3xl font-bold text-akcent">do {doGodziny}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Podpowiedzi „pisane” w pustym polu wyszukiwania — szaman zaprasza do szukania (na telefonie zamiast dymka).
// Placeholder zmieniany bezpośrednio w DOM, żeby nie przerysowywać całego katalogu co kilkadziesiąt ms.
const PODPOWIEDZI = ["Może burger?", "Może pizza?", "Może kebab?", "Kawiarnia…", "Albo nazwa lokalu…"];

function usePisanePodpowiedzi(pole: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const el = pole.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const domyslna = el.placeholder;
    let nr = 0;
    let znaki = 0;
    let kasuje = false;
    let czas: number;
    const krok = () => {
      const tekst = PODPOWIEDZI[nr];
      znaki += kasuje ? -1 : 1;
      el.placeholder = tekst.slice(0, znaki) || " ";
      if (!kasuje && znaki === tekst.length) {
        kasuje = true;
        czas = window.setTimeout(krok, 1800);
      } else if (kasuje && znaki === 0) {
        kasuje = false;
        nr = (nr + 1) % PODPOWIEDZI.length;
        czas = window.setTimeout(krok, 350);
      } else {
        czas = window.setTimeout(krok, kasuje ? 30 : 75);
      }
    };
    czas = window.setTimeout(krok, 1500);
    return () => {
      clearTimeout(czas);
      el.placeholder = domyslna;
    };
  }, [pole]);
}

// Ozdoba banera na komputerze: szaman z burgerem (zaprasza do wyszukiwarki) i unoszące się „pigułki” kategorii.
function DekoracjaBanera() {
  return (
    <div aria-hidden className="relative hidden h-[360px] w-[420px] shrink-0 lg:block">
      <div className="absolute inset-[8%] rounded-full border border-white/10 bg-white/[0.04]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Szaman dymek className="relative w-72 translate-x-4 animate-wjazd [animation-delay:250ms]" />
      </div>
      {PIGULKI.map((p) => (
        <span
          key={p.nazwa}
          className={`absolute flex animate-unoszenie items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-tekst shadow-lg ${p.miejsce}`}
          style={{ animationDelay: p.opoznienie, animationDuration: "7s" }}
        >
          <IkonaTypu ikona={p.ikona} className="size-[18px] text-akcent-tekst" />
          {p.nazwa}
        </span>
      ))}
    </div>
  );
}
