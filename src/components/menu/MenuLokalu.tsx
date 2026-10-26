"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, Flame, Leaf, Plus, Search, Star, Sun, X } from "lucide-react";
import { dataPl, zl } from "@/lib/ceny";
import type { CechaDania, Dostawa, Menu, PozycjaMenu, SekcjaMenu } from "@/lib/menu";
import { odmiana } from "@/lib/nazwy";
import { bezPolskich, slugify } from "@/lib/slug.mjs";
import Licznik from "./Licznik";
import ListaZamowienia from "./ListaZamowienia";
import { kluczPozycji, useLista, type ListaLokalu } from "./useLista";

// Pełne pigułki w kolorach tokenów: kontrast ≥ 4,9:1 i w jasnym, i w ciemnym motywie lokalu
// (półprzezroczyste tło z kolorowym tekstem nie przechodziło 4,5:1 na kremowym tle).
const CECHY: Record<CechaDania, { nazwa: string; ikona: typeof Leaf; kolor: string }> = {
  wege: { nazwa: "Wege", ikona: Leaf, kolor: "bg-otwarte text-karta" },
  ostre: { nazwa: "Ostre", ikona: Flame, kolor: "bg-zamkniete text-karta" },
  polecane: { nazwa: "Polecane", ikona: Star, kolor: "bg-akcent-tekst text-karta" },
  sezonowe: { nazwa: "Sezonowe", ikona: Sun, kolor: "bg-akcent-tekst text-karta" },
};

// Na komputerze menu startuje rozwinięte, na telefonie zwinięte do kafelków kategorii (mniej przewijania).
// Domyślny stan robi CSS (lg:), więc nic nie mruga przy wczytaniu; JS zna go tylko do aria-expanded i przełączania.
const DESKTOP = "(min-width: 1024px)";

function useDesktop() {
  return useSyncExternalStore(
    (zmiana) => {
      const m = matchMedia(DESKTOP);
      m.addEventListener("change", zmiana);
      return () => m.removeEventListener("change", zmiana);
    },
    () => matchMedia(DESKTOP).matches,
    () => false,
  );
}

/**
 * Menu lokalu z przyciskami „+”: dania trafiają na listę, z której potem zamawia się przez telefon.
 * Działy to kafelki ze zdjęciem kategorii — dotknięcie rozwija albo zwija dział.
 */
export default function MenuLokalu({
  menu,
  dostawa,
  slug,
  nazwa,
  telefon,
  numerowane = false,
}: {
  menu: Menu;
  dostawa: Dostawa | null;
  slug: string;
  nazwa: string;
  telefon: string | null;
  numerowane?: boolean; // pozycje z numerami i kropkami do ceny (motyw lokalu)
}) {
  const l = useLista(slug);
  const [szukaj, setSzukaj] = useState("");
  const desktop = useDesktop();
  // Działy, które ktoś sam rozwinął (true) albo zwinął (false); reszta ma stan domyślny dla ekranu.
  const [wybor, setWybor] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const fraza = bezPolskich(szukaj.trim());
  const sekcje = fraza
    ? menu.sekcje
        .map((s) => ({
          ...s,
          pozycje: s.pozycje.filter((p) => bezPolskich(`${p.nazwa} ${p.opis ?? ""} ${s.nazwa}`).includes(fraza)),
        }))
        .filter((s) => s.pozycje.length)
    : menu.sekcje;

  const przelacz = (dzial: string, otwarty: boolean) => setWybor((w) => new Map(w).set(dzial, !otwarty));

  return (
    <section id="menu" aria-labelledby="menu-tytul" className="mt-8 scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <h2 id="menu-tytul" className="font-grotesk text-3xl font-bold tracking-tight lg:text-4xl">
          Menu
        </h2>
        {menu.sprawdzono &&
          (menu.bezCen ? (
            <p className="text-xs font-bold text-tekst-2">
              Menu sprawdzone {dataPl(menu.sprawdzono)} · lokal nie podaje cen
            </p>
          ) : menu.stareCeny ? (
            <p className="rounded-full bg-krem px-2.5 py-1 text-xs font-extrabold text-akcent-tekst">
              Ceny z {dataPl(menu.sprawdzono)} — mogą być nieaktualne
            </p>
          ) : (
            <p className="text-xs font-bold text-tekst-2">Ceny sprawdzone {dataPl(menu.sprawdzono)}</p>
          ))}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-tekst-2">
        Dodaj dania przyciskiem <Plus className="inline size-4 align-[-3px]" aria-label="plus" /> — zbierzemy je w
        liście, z której zamówisz przez telefon.
        {menu.sekcje.length > 1 && " Dotknij kategorii, żeby ją rozwinąć albo zwinąć."}
      </p>

      {menu.liczba > 15 && (
        <label className="mt-4 flex h-12 items-center gap-2.5 rounded-full border-[1.5px] border-obrys-2 bg-karta px-4 transition focus-within:border-tekst">
          <Search className="size-5 shrink-0 text-tekst-2" aria-hidden />
          <span className="sr-only">Szukaj w menu</span>
          <input
            type="search"
            value={szukaj}
            onChange={(e) => setSzukaj(e.target.value)}
            placeholder={`Szukaj w menu (${menu.liczba} pozycji)`}
            className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-tekst-2"
          />
          {szukaj && (
            <button type="button" onClick={() => setSzukaj("")} aria-label="Wyczyść" className="text-tekst-2">
              <X className="size-5" aria-hidden />
            </button>
          )}
        </label>
      )}

      <div className="mt-4 space-y-2.5">
        {sekcje.map((s, i) => (
          <Dzial
            key={s.nazwa}
            s={s}
            l={l}
            numerowane={numerowane}
            // przy szukaniu pokazujemy od razu wszystkie trafienia
            stan={fraza ? true : wybor.get(s.nazwa)}
            desktop={desktop}
            przelacz={(otwarty) => przelacz(s.nazwa, otwarty)}
            pierwszy={i === 0}
          />
        ))}
      </div>
      {fraza && !sekcje.length && (
        <p className="mt-6 rounded-2xl border-2 border-dashed border-obrys-2 p-6 text-center font-semibold text-tekst-2">
          W menu nie ma „{szukaj}”.
        </p>
      )}

      {menu.zrodlo && (
        <p className="mt-6 text-xs font-semibold text-tekst-2">
          Menu przepisane z{" "}
          {/^https?:/.test(menu.zrodlo) ? (
            <a href={menu.zrodlo} target="_blank" rel="noopener" className="underline">
              materiałów lokalu
            </a>
          ) : (
            menu.zrodlo
          )}
          . Ceny mogą się zmienić — lokal potwierdza je przy zamówieniu. Zdjęcia działów są poglądowe.
        </p>
      )}

      <ListaZamowienia l={l} nazwa={nazwa} telefon={telefon} dostawa={dostawa} />
    </section>
  );
}

/** Ile sztuk z działu jest już na liście (wszystkie warianty). */
function ileZDzialu(s: SekcjaMenu, l: ListaLokalu) {
  return s.pozycje.reduce(
    (suma, p) =>
      suma +
      (p.ceny.length
        ? p.ceny.reduce((razem, c) => razem + l.ilosc(kluczPozycji(p.id, c.wariant)), 0)
        : l.ilosc(kluczPozycji(p.id, null))),
    0,
  );
}

/** Dział menu: kafelek ze zdjęciem kategorii, a po rozwinięciu — lista dań (bez zdjęć). */
function Dzial({
  s,
  l,
  numerowane,
  stan,
  desktop,
  przelacz,
  pierwszy,
}: {
  s: SekcjaMenu;
  l: ListaLokalu;
  numerowane: boolean;
  stan: boolean | undefined; // undefined = domyślny dla ekranu
  desktop: boolean;
  przelacz: (otwarty: boolean) => void;
  pierwszy: boolean;
}) {
  const otwarty = stan ?? desktop;
  // Klasy dla: zwiniętego, rozwiniętego i stanu domyślnego (telefon zwinięty, od lg rozwinięty).
  const klasy = (zwiniety: string, rozwiniety: string, domyslny: string) =>
    stan === undefined ? domyslny : stan ? rozwiniety : zwiniety;
  const ref = useRef<HTMLElement>(null);
  const idTresci = `menu-${slugify(s.nazwa)}`;
  const ceny = s.pozycje.flatMap((p) => p.ceny.map((c) => c.gr));
  const od = ceny.length ? Math.min(...ceny) : null;
  const naLiscie = ileZDzialu(s, l);

  const klik = () => {
    const el = ref.current;
    if (el) {
      const gora = el.getBoundingClientRect().top;
      // Zwijany dział, w którym jesteśmy głęboko → wracamy do jego kafelka, żeby nie zgubić miejsca.
      // Rozwijany kafelek nisko na ekranie → podjeżdża do góry, żeby było widać dania.
      if ((otwarty && gora < 0) || (!otwarty && gora > window.innerHeight * 0.55)) {
        window.scrollBy({ top: gora - 80, behavior: "smooth" });
      }
    }
    przelacz(otwarty);
  };

  return (
    <section ref={ref} aria-label={s.nazwa} className="scroll-mt-20">
      <h3 className={klasy("", "sticky top-16 z-20", "lg:sticky lg:top-16 lg:z-20")}>
        <button
          type="button"
          onClick={klik}
          aria-expanded={otwarty}
          aria-controls={idTresci}
          className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl text-left shadow-sm transition-[height] duration-300 active:scale-[0.99] ${klasy("h-20", "h-14", "h-20 lg:h-14")} ${s.okladka ? "bg-noc text-white" : "bg-krem text-tekst"}`}
        >
          {s.okladka && (
            <>
              <Image
                src={s.okladka.plik}
                alt=""
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                // pierwszy kafelek bywa największym elementem ekranu (LCP) — od razu; reszta leniwie, przy przewijaniu
                preload={pierwszy}
                className="object-cover"
                style={{ objectPosition: s.okladka.pozycja }}
              />
              <span className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/15" />
            </>
          )}
          <span className="relative min-w-0 flex-1 pl-4">
            <span className="block truncate font-grotesk text-xl leading-tight font-bold">{s.nazwa}</span>
            <span className={`block text-xs font-bold ${s.okladka ? "text-white/75" : "text-tekst-2"}`}>
              {s.pozycje.length} {odmiana(s.pozycje.length, ["pozycja", "pozycje", "pozycji"])}
              {od !== null && ` · od ${zl(od)}`}
            </span>
          </span>
          {naLiscie > 0 && (
            <span className="relative shrink-0 animate-wjazd rounded-full bg-akcent px-2.5 py-1 text-xs font-black text-na-akcencie [animation-duration:0.3s]">
              {naLiscie} na liście
            </span>
          )}
          <ChevronDown
            aria-hidden
            className={`relative mr-4 size-6 shrink-0 transition-transform duration-300 ${klasy("", "rotate-180", "lg:rotate-180")}`}
          />
        </button>
      </h3>
      {/* zwinięta treść jest niewidoczna (visibility), więc nie łapie fokusu; visibility przełącza się po animacji */}
      <div
        id={idTresci}
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${klasy(
          "invisible grid-rows-[0fr]",
          "grid-rows-[1fr]",
          "grid-rows-[0fr] max-lg:invisible lg:grid-rows-[1fr]",
        )}`}
      >
        <div className="min-h-0 overflow-hidden px-1">
          {s.opis && <p className="pt-3 text-sm font-semibold text-tekst-2">{s.opis}</p>}
          {/* na komputerze menu ma całą szerokość strony — dania w dwóch kolumnach */}
          <ul className="pb-2 lg:grid lg:grid-cols-2 lg:gap-x-10">
            {s.pozycje.map((p, i) => (
              <WierszMenu key={p.id} p={p} l={l} numer={numerowane ? i + 1 : null} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function WierszMenu({ p, l, numer }: { p: PozycjaMenu; l: ListaLokalu; numer: number | null }) {
  const jednaCena = p.ceny.length <= 1;
  const cena = p.ceny[0] ?? null;
  const dodaj = (wariant: string | null, gr: number | null) =>
    l.dodaj({ klucz: kluczPozycji(p.id, wariant), nazwa: p.nazwa, wariant, gr });
  const naLiscie = p.ceny.length
    ? p.ceny.some((c) => l.ilosc(kluczPozycji(p.id, c.wariant)) > 0)
    : l.ilosc(kluczPozycji(p.id, null)) > 0;
  const cenaTekst = cena ? zl(cena.gr) : <span className="font-bold text-tekst-2">cena w lokalu</span>;

  return (
    // linia na <li>, podświetlenie na środku — zaokrąglone tło nie zagina linii
    <li className="border-b border-obrys">
      <div
        className={`-mx-3 flex items-start gap-3 rounded-2xl px-3 py-3.5 transition-colors duration-300 ${naLiscie ? "bg-akcent/[0.08]" : ""}`}
      >
        {numer !== null && (
          <span className="w-6 shrink-0 pt-0.5 text-right text-sm font-bold text-tekst-2 tabular-nums">{numer}.</span>
        )}
        <div className="min-w-0 flex-1">
          {numer !== null && jednaCena ? (
            // jak w karcie lokalu: nazwa ······ cena
            <h4 className="flex items-baseline gap-2">
              <span className="font-grotesk text-lg leading-snug font-bold">{p.nazwa}</span>
              <span aria-hidden className="mb-1 min-w-4 flex-1 border-b border-dotted border-obrys-2" />
              <span className="shrink-0 font-black">{cenaTekst}</span>
            </h4>
          ) : (
            <h4 className="leading-snug font-extrabold">{p.nazwa}</h4>
          )}
          {p.cechy.length > 0 && (
            <p className="mt-1 flex flex-wrap gap-1">
              {p.cechy.map((c) => {
                const { nazwa, ikona: Ikona, kolor } = CECHY[c];
                return (
                  <span
                    key={c}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${kolor}`}
                  >
                    <Ikona className="size-3" aria-hidden /> {nazwa}
                  </span>
                );
              })}
            </p>
          )}
          {p.opis && <p className="mt-1 text-sm leading-snug text-tekst-2">{p.opis}</p>}
          {jednaCena ? (
            numer === null && <p className="mt-1.5 font-black">{cenaTekst}</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.ceny.map((c) => {
                const ile = l.ilosc(kluczPozycji(p.id, c.wariant));
                return (
                  <button
                    key={c.wariant}
                    type="button"
                    onClick={() => dodaj(c.wariant, c.gr)}
                    aria-label={`Dodaj do listy: ${p.nazwa}, ${c.wariant}, ${zl(c.gr)}`}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] pr-1 pl-3 text-sm font-extrabold transition active:scale-95 ${
                      ile ? "border-tekst bg-tekst text-tlo" : "border-obrys-2 bg-karta hover:border-tekst"
                    }`}
                  >
                    <span className={ile ? "opacity-70" : "text-tekst-2"}>{c.wariant}</span> {zl(c.gr)}
                    <span
                      className={`flex size-7 items-center justify-center rounded-full ${ile ? "bg-akcent text-na-akcencie" : "bg-krem"}`}
                    >
                      {ile ? (
                        <span className="text-xs font-black">{ile}</span>
                      ) : (
                        <Plus className="size-4" aria-hidden />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {jednaCena && (
          <Licznik
            ile={l.ilosc(kluczPozycji(p.id, null))}
            nazwa={p.nazwa}
            dodaj={() => dodaj(null, cena?.gr ?? null)}
            zmien={(o) => l.zmienIlosc(kluczPozycji(p.id, null), o)}
          />
        )}
      </div>
    </li>
  );
}
