"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, Flame, Leaf, Plus, Search, Star, Sun, X } from "lucide-react";
import { dataPl, zl } from "@/lib/ceny";
import type { CechaDania, Dostawa, Menu, PozycjaMenu, SekcjaMenu } from "@/lib/menu";
import { odmiana } from "@/lib/nazwy";
import { bezPolskich, slugify } from "@/lib/slug.mjs";
import Licznik from "./Licznik";
import Trikolor from "../szablony/Trikolor";
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

// Drobne napisy wersalikami krojem etykiet motywu (--etykiety-lokalu); bez niego zostaje krój tekstu.
const ETYKIETA = "font-[family-name:var(--etykiety-lokalu)] font-medium uppercase";

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
  belki = false,
  karty = false,
  spis,
}: {
  menu: Menu;
  dostawa: Dostawa | null;
  slug: string;
  nazwa: string;
  telefon: string | null;
  numerowane?: boolean; // pozycje z numerami i kropkami do ceny (motyw lokalu)
  belki?: boolean; // działy na czarnych belkach, ceny na etykietach (motyw lokalu)
  karty?: boolean; // dania na kartach w siatce, ceny na pigułkach krojem etykiet (motyw lokalu)
  spis?: "wersaliki" | "tablica"; // jak spis w karcie lokalu, cena po prawej (motyw lokalu, patrz menuSpis)
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
        <div>
          {karty && <p className={`${ETYKIETA} text-[11px] tracking-[0.2em] text-akcent-tekst`}>Karta dań</p>}
          <h2
            id="menu-tytul"
            className={`font-grotesk text-3xl tracking-tight lg:text-4xl ${karty ? "font-medium" : "font-bold"}`}
          >
            Menu
          </h2>
        </div>
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
            <p className="text-xs font-bold text-tekst-2">
              {menu.zrodlo === "panel" ? "Ceny od lokalu, zmienione" : "Ceny sprawdzone"} {dataPl(menu.sprawdzono)}
            </p>
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
            belki={belki}
            karty={karty}
            spis={spis}
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

      {menu.zrodlo === "panel" ? (
        // menu prowadzi sam lokal w panelu
        <p className="mt-6 text-xs font-semibold text-tekst-2">
          Menu i ceny podaje lokal. Ceny mogą się zmienić — lokal potwierdza je przy zamówieniu. Zdjęcia działów są
          poglądowe.
        </p>
      ) : menu.zrodlo && (
        <p className="mt-6 text-xs font-semibold text-tekst-2">
          Menu przepisane z{" "}
          {/^https?:/.test(menu.zrodlo) ? (
            <a href={menu.zrodlo} target="_blank" rel="noopener" className="underline">
              materiałów lokalu
            </a>
          ) : (
            menu.zrodlo
          )}
          . Ceny mogą się zmienić — lokal potwierdza je przy zamówieniu.{!belki && !karty && !spis && " Zdjęcia działów są poglądowe."}
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
  belki,
  karty,
  spis,
  stan,
  desktop,
  przelacz,
  pierwszy,
}: {
  s: SekcjaMenu;
  l: ListaLokalu;
  numerowane: boolean;
  belki: boolean;
  karty: boolean;
  spis: "wersaliki" | "tablica" | undefined;
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
          className={`relative flex w-full items-center gap-3 overflow-hidden text-left transition-[height] duration-300 active:scale-[0.99] ${
            belki
              ? `bg-tekst text-tlo ${klasy("h-16", "h-14", "h-16 lg:h-14")}`
              : karty
                ? // jak pigułki działów na stronie lokalu: zwinięty biały z ramką, rozwinięty w kolorze akcentu
                  `h-16 rounded-full border ${klasy(
                    "border-obrys bg-karta text-tekst",
                    "border-akcent bg-akcent text-na-akcencie",
                    "border-obrys bg-karta text-tekst lg:border-akcent lg:bg-akcent lg:text-na-akcencie",
                  )}`
                : spis
                  ? // jak dział w karcie lokalu: sam podkreślony tytuł; tło strony, bo przyklejony zasłania dania
                    // tablica: ta sama kreda co tło strony, żeby przyklejony nagłówek nie był płaskim prostokątem
                    `bg-tlo ${spis === "tablica" ? "tlo-kreda h-20" : "h-14"}`
                  : `rounded-2xl shadow-sm ${klasy("h-20", "h-14", "h-20 lg:h-14")} ${s.okladka ? "bg-noc text-white" : "bg-krem text-tekst"}`
          }`}
        >
          {s.okladka && !belki && !karty && !spis && (
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
          <span className={`relative min-w-0 flex-1 ${karty ? "pl-6" : spis ? "" : "pl-4"}`}>
            <span
              className={`block truncate leading-tight ${spis === "tablica" ? "" : "font-grotesk"} ${
                belki
                  ? "text-2xl font-black uppercase"
                  : karty
                    ? "text-lg font-medium uppercase"
                    : spis === "tablica"
                      ? // pismo odręczne + kreska w barwach Włoch; py: miejsce na laski liter, które `truncate` by obcięło
                        "py-1 font-[family-name:var(--ozdobny-lokalu)] text-[1.9rem] leading-tight"
                      : spis
                        ? // pb: miejsce na podkreślenie, które `truncate` (overflow: hidden) inaczej by obcięło
                          "pb-2 text-xl font-bold tracking-[0.18em] uppercase underline decoration-2 underline-offset-[6px]"
                      : "text-xl font-bold"
              }`}
            >
              {s.nazwa}
            </span>
            {spis === "tablica" && <Trikolor className="mb-1 w-40 max-w-[45%]" />}
            <span
              className={
                karty
                  ? `${ETYKIETA} block text-[11px] tracking-[0.12em] opacity-70`
                  : `block text-xs font-bold ${spis ? "text-tekst-2" : belki ? "text-tlo/70" : s.okladka ? "text-white/75" : "text-tekst-2"}`
              }
            >
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
          {karty ? (
            <ul className="grid gap-3 pt-3 pb-3 sm:grid-cols-2 lg:grid-cols-3">
              {s.pozycje.map((p) => (
                <KartaDania key={p.id} p={p} l={l} />
              ))}
            </ul>
          ) : spis ? (
            <ul className="pb-3 lg:grid lg:grid-cols-2 lg:gap-x-12">
              {s.pozycje.map((p) => (
                <PozycjaSpisu key={p.id} p={p} l={l} styl={spis} />
              ))}
            </ul>
          ) : (
            <ul className="pb-2 lg:grid lg:grid-cols-2 lg:gap-x-10">
              {s.pozycje.map((p, i) => (
                <WierszMenu key={p.id} p={p} l={l} numer={numerowane ? i + 1 : null} belki={belki} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function WierszMenu({
  p,
  l,
  numer,
  belki,
}: {
  p: PozycjaMenu;
  l: ListaLokalu;
  numer: number | null;
  belki: boolean;
}) {
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
        {numer !== null && !belki && (
          <span className="w-6 shrink-0 pt-0.5 text-right text-sm font-bold text-tekst-2 tabular-nums">{numer}.</span>
        )}
        <div className="min-w-0 flex-1">
          {belki ? (
            // jak w karcie lokalu: „1. BURGER KLASYK” i cena na etykiecie tuż za nazwą
            <h4 className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-grotesk text-lg leading-tight font-black uppercase">
                {numer !== null && `${numer}. `}
                {p.nazwa}
              </span>
              {jednaCena && (
                <span className="bg-akcent px-1.5 py-px text-sm leading-snug font-bold text-na-akcencie">
                  {cenaTekst}
                </span>
              )}
            </h4>
          ) : numer !== null && jednaCena ? (
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
            numer === null && !belki && <p className="mt-1.5 font-black">{cenaTekst}</p>
          ) : (
            <Warianty p={p} l={l} className="mt-2" />
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

/** Przyciski wariantów dania („32 cm 38 zł +”) — każdy dodaje swój wariant do listy. */
function Warianty({ p, l, className = "" }: { p: PozycjaMenu; l: ListaLokalu; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {p.ceny.map((c) => {
        const ile = l.ilosc(kluczPozycji(p.id, c.wariant));
        return (
          <button
            key={c.wariant}
            type="button"
            onClick={() => l.dodaj({ klucz: kluczPozycji(p.id, c.wariant), nazwa: p.nazwa, wariant: c.wariant, gr: c.gr })}
            aria-label={`Dodaj do listy: ${p.nazwa}, ${c.wariant}, ${zl(c.gr)}`}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] pr-1 pl-3 text-sm font-extrabold transition active:scale-95 ${
              ile ? "border-tekst bg-tekst text-tlo" : "border-obrys-2 bg-karta hover:border-tekst"
            }`}
          >
            <span className={ile ? "opacity-70" : "text-tekst-2"}>{c.wariant}</span> {zl(c.gr)}
            <span
              className={`flex size-7 items-center justify-center rounded-full ${ile ? "bg-akcent text-na-akcencie" : "bg-krem"}`}
            >
              {ile ? <span className="text-xs font-black">{ile}</span> : <Plus className="size-4" aria-hidden />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Danie na karcie (motyw lokalu z `menuKarty`): nazwa wersalikami, skład, cena na pigułce i „+” w rogu. */
function KartaDania({ p, l }: { p: PozycjaMenu; l: ListaLokalu }) {
  const jednaCena = p.ceny.length <= 1;
  const cena = p.ceny[0] ?? null;
  const klucz = kluczPozycji(p.id, null);
  const naLiscie = p.ceny.length
    ? p.ceny.some((c) => l.ilosc(kluczPozycji(p.id, c.wariant)) > 0)
    : l.ilosc(klucz) > 0;

  return (
    <li
      className={`flex flex-col rounded-[20px] border bg-karta p-4 transition-colors duration-300 ${
        naLiscie ? "border-akcent ring-1 ring-akcent" : "border-obrys"
      }`}
    >
      {p.cechy.length > 0 && (
        <p className="mb-2 flex flex-wrap gap-1">
          {p.cechy.map((c) => (
            <span
              key={c}
              // „Polecane” jak „Danie dnia” u lokalu: pełna pigułka; reszta obrysowana
              className={`${ETYKIETA} rounded-full px-2 py-0.5 text-[10.5px] tracking-[0.12em] ${
                c === "polecane" ? "bg-akcent-tekst text-krem" : "border border-obrys-2 text-tekst-2"
              }`}
            >
              {CECHY[c].nazwa}
            </span>
          ))}
        </p>
      )}
      <h4 className="font-grotesk text-lg leading-tight font-medium uppercase">{p.nazwa}</h4>
      {p.opis && <p className="mt-1.5 text-[13.5px] leading-snug text-tekst-2">{p.opis}</p>}
      {jednaCena ? (
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="rounded-full bg-krem px-2.5 py-1 font-[family-name:var(--etykiety-lokalu)] text-[13px] font-medium text-akcent">
            {cena ? zl(cena.gr) : "cena w lokalu"}
          </span>
          <Licznik
            ile={l.ilosc(klucz)}
            nazwa={p.nazwa}
            dodaj={() => l.dodaj({ klucz, nazwa: p.nazwa, wariant: null, gr: cena?.gr ?? null })}
            zmien={(o) => l.zmienIlosc(klucz, o)}
          />
        </div>
      ) : (
        <Warianty p={p} l={l} className="mt-auto pt-3" />
      )}
    </li>
  );
}

/** Danie w karcie-spisie (motyw lokalu z `menuSpis`), cena po prawej. wersaliki: nazwa rozstrzelonymi wersalikami,
 *  cechy ikonkami, skład rozdzielony „|”; tablica: zwykła nazwa, „(vege)” na zielono, cena podkreślona. */
function PozycjaSpisu({ p, l, styl }: { p: PozycjaMenu; l: ListaLokalu; styl: "wersaliki" | "tablica" }) {
  const tablica = styl === "tablica";
  const jednaCena = p.ceny.length <= 1;
  const cena = p.ceny[0] ?? null;
  const klucz = kluczPozycji(p.id, null);
  const naLiscie = p.ceny.length
    ? p.ceny.some((c) => l.ilosc(kluczPozycji(p.id, c.wariant)) > 0)
    : l.ilosc(klucz) > 0;

  return (
    <li className="border-b border-obrys">
      <div
        className={`-mx-3 flex items-start gap-3 px-3 py-3.5 transition-colors duration-300 ${naLiscie ? "bg-krem" : ""}`}
      >
        <div className="min-w-0 flex-1">
          <h4 className="flex items-baseline gap-2">
            <span
              className={`font-grotesk leading-snug font-bold ${tablica ? "text-[17px] font-semibold" : "text-[15px] tracking-[0.14em] uppercase"}`}
            >
              {p.nazwa}
              {tablica && p.cechy.includes("wege") && (
                <span className="ml-1.5 text-[13px] font-normal text-otwarte">(vege)</span>
              )}
              {p.cechy.filter((c) => !tablica || c !== "wege").map((c) => {
                const { nazwa, ikona: Ikona } = CECHY[c];
                return (
                  <Ikona
                    key={c}
                    aria-label={nazwa}
                    className={`ml-1.5 inline size-4 align-[-2px] ${c === "wege" ? "text-otwarte" : c === "ostre" ? "text-zamkniete" : ""}`}
                  />
                );
              })}
            </span>
            {jednaCena && (
              <span className={`ml-auto shrink-0 pl-2 font-grotesk font-bold ${tablica ? "border-b-2 border-tekst" : ""}`}>
                {cena ? zl(cena.gr) : "w lokalu"}
              </span>
            )}
          </h4>
          {p.opis && <p className="mt-1 text-[13px] leading-snug text-tekst-2">{tablica ? p.opis : p.opis.split(/,\s*/).join(" | ")}</p>}
          {!jednaCena && <Warianty p={p} l={l} className="mt-2" />}
        </div>
        {jednaCena && (
          <Licznik
            ile={l.ilosc(klucz)}
            nazwa={p.nazwa}
            dodaj={() => l.dodaj({ klucz, nazwa: p.nazwa, wariant: null, gr: cena?.gr ?? null })}
            zmien={(o) => l.zmienIlosc(klucz, o)}
          />
        )}
      </div>
    </li>
  );
}
