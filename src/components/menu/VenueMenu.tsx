"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, Flame, Leaf, Plus, Search, Star, Sun, X } from "lucide-react";
import { formatDatePl, formatPln } from "@/lib/prices";
import type { DishFeature, Delivery, Menu, MenuItem, MenuSectionData } from "@/lib/menu";
import { plural } from "@/lib/format";
import { stripPolish, slugify } from "@/lib/slug.mjs";
import Counter from "./Counter";
import Tricolor from "../templates/Tricolor";
import OrderListDialog from "./OrderListDialog";
import { itemKey, useOrderList, type VenueOrderList, type ListItem } from "./useOrderList";

// Solid pills in token colors: contrast ≥ 4.9:1 in both the light and the dark venue theme (a translucent background
// with colored text did not reach 4.5:1 on the cream background).
const FEATURES: Record<DishFeature, { nazwa: string; ikona: typeof Leaf; kolor: string }> = {
  wege: { nazwa: "Wege", ikona: Leaf, kolor: "bg-otwarte text-karta" },
  ostre: { nazwa: "Ostre", ikona: Flame, kolor: "bg-zamkniete text-karta" },
  polecane: { nazwa: "Polecane", ikona: Star, kolor: "bg-akcent-tekst text-karta" },
  sezonowe: { nazwa: "Sezonowe", ikona: Sun, kolor: "bg-akcent-tekst text-karta" },
};

// Small uppercase labels in the theme's label font (--etykiety-lokalu); without it the body font is used.
const LABEL = "font-[family-name:var(--etykiety-lokalu)] font-medium uppercase";

// On a computer the menu starts expanded, on a phone collapsed to category tiles (less scrolling). The default state
// comes from CSS (lg:), so nothing flickers on load; JS knows it only for aria-expanded and toggling.
const DESKTOP = "(min-width: 1024px)";

function useDesktop() {
  return useSyncExternalStore(
    (change) => {
      const m = matchMedia(DESKTOP);
      m.addEventListener("change", change);
      return () => m.removeEventListener("change", change);
    },
    () => matchMedia(DESKTOP).matches,
    () => false,
  );
}

/**
 * Venue menu with „+” buttons: dishes go onto the list people then order from by phone. Sections are tiles with a
 * category photo — a tap expands or collapses the section.
 */
export default function VenueMenu({
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
  dostawa: Delivery | null;
  slug: string;
  nazwa: string;
  telefon: string | null;
  numerowane?: boolean; // items with numbers and dot leaders to the price (venue theme)
  belki?: boolean; // sections on black bars, prices on labels (venue theme)
  karty?: boolean; // dishes on cards in a grid, prices on pills in the label font (venue theme)
  spis?: "wersaliki" | "tablica" | "srodek" | "kropki"; // like a list on the venue's own menu card, price on the right (venue theme, see menuSpis)
}) {
  const l = useOrderList(slug);
  // item key → name, variant and price: a list from a „Zamawiamy razem” link has keys only
  const dishes = useMemo(() => {
    const m = new Map<string, Omit<ListItem, "ilosc" | "kto">>();
    for (const p of menu.sekcje.flatMap((s) => s.pozycje)) {
      if (p.ceny.length <= 1) {
        const key = itemKey(p.id, null);
        m.set(key, { klucz: key, nazwa: p.nazwa, wariant: null, gr: p.ceny[0]?.gr ?? null });
      } else {
        for (const c of p.ceny) {
          const key = itemKey(p.id, c.wariant);
          m.set(key, { klucz: key, nazwa: p.nazwa, wariant: c.wariant, gr: c.gr });
        }
      }
    }
    return m;
  }, [menu]);
  const [szukaj, setSzukaj] = useState("");
  const desktop = useDesktop();
  // Sections someone expanded (true) or collapsed (false) by hand; the rest have the default state for the screen.
  const [wybor, setWybor] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const phrase = stripPolish(szukaj.trim());
  const sections = phrase
    ? menu.sekcje
        .map((s) => ({
          ...s,
          pozycje: s.pozycje.filter((p) => stripPolish(`${p.nazwa} ${p.opis ?? ""} ${s.nazwa}`).includes(phrase)),
        }))
        .filter((s) => s.pozycje.length)
    : menu.sekcje;

  const toggle = (section: string, expanded: boolean) => setWybor((w) => new Map(w).set(section, !expanded));

  return (
    <section id="menu" aria-labelledby="menu-tytul" className="mt-8 scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          {karty && <p className={`${LABEL} text-[11px] tracking-[0.2em] text-akcent-tekst`}>Karta dań</p>}
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
              Menu sprawdzone {formatDatePl(menu.sprawdzono)} · lokal nie podaje cen
            </p>
          ) : menu.stareCeny ? (
            <p className="rounded-full bg-krem px-2.5 py-1 text-xs font-extrabold text-akcent-tekst">
              Ceny z {formatDatePl(menu.sprawdzono)} — mogą być nieaktualne
            </p>
          ) : (
            <p className="text-xs font-bold text-tekst-2">
              {menu.zrodlo === "panel" ? "Ceny od lokalu, zmienione" : "Ceny sprawdzone"} {formatDatePl(menu.sprawdzono)}
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
        {sections.map((s, i) => (
          <MenuSection
            key={s.nazwa}
            s={s}
            l={l}
            numerowane={numerowane}
            belki={belki}
            karty={karty}
            spis={spis}
            // while searching, all matches are shown right away
            stan={phrase ? true : wybor.get(s.nazwa)}
            desktop={desktop}
            przelacz={(expanded) => toggle(s.nazwa, expanded)}
            pierwszy={i === 0}
          />
        ))}
      </div>
      {phrase && !sections.length && (
        <p className="mt-6 rounded-2xl border-2 border-dashed border-obrys-2 p-6 text-center font-semibold text-tekst-2">
          W menu nie ma „{szukaj}”.
        </p>
      )}

      {menu.zrodlo === "panel" ? (
        // the venue runs its menu in the panel
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

      <OrderListDialog l={l} slug={slug} dania={dishes} nazwa={nazwa} telefon={telefon} dostawa={dostawa} />
    </section>
  );
}

/** How many portions from a section are already on the list (all variants). */
function countInSection(s: MenuSectionData, l: VenueOrderList) {
  return s.pozycje.reduce(
    (sum, p) =>
      sum +
      (p.ceny.length
        ? p.ceny.reduce((total, c) => total + l.ilosc(itemKey(p.id, c.wariant)), 0)
        : l.ilosc(itemKey(p.id, null))),
    0,
  );
}

/** Menu section: a tile with a category photo, and once expanded — the list of dishes (without photos). */
function MenuSection({
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
  s: MenuSectionData;
  l: VenueOrderList;
  numerowane: boolean;
  belki: boolean;
  karty: boolean;
  spis: "wersaliki" | "tablica" | "srodek" | "kropki" | undefined;
  stan: boolean | undefined; // undefined = the default for the screen
  desktop: boolean;
  przelacz: (expanded: boolean) => void;
  pierwszy: boolean;
}) {
  const expanded = stan ?? desktop;
  // Classes for: collapsed, expanded and the default state (collapsed on a phone, expanded from lg).
  const classes = (collapsed: string, isExpanded: string, defaultValue: string) =>
    stan === undefined ? defaultValue : stan ? isExpanded : collapsed;
  const ref = useRef<HTMLElement>(null);
  // Section tile photo: the first one right away, the rest only about 300 px before they reach the screen — the
  // browser's lazy loading fetched all of them at once (Parkowa: 12 photos on entry). Until then the tile has a dark
  // background.
  const [zdjecie, setZdjecie] = useState(pierwszy);
  useEffect(() => {
    const el = ref.current;
    if (zdjecie || !el) return;
    const observer = new IntersectionObserver(
      ([wpis]) => {
        if (wpis.isIntersecting) {
          setZdjecie(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [zdjecie]);
  const contentId = `menu-${slugify(s.nazwa)}`;
  const prices = s.pozycje.flatMap((p) => p.ceny.map((c) => c.gr));
  const from = prices.length ? Math.min(...prices) : null;
  const onList = countInSection(s, l);

  const onToggle = () => {
    const el = ref.current;
    if (el) {
      const top = el.getBoundingClientRect().top;
      // Collapsing a section we are deep inside → scroll back to its tile, so we do not lose our place. Expanding a
      // tile low on the screen → it moves up, so the dishes are visible.
      if ((expanded && top < 0) || (!expanded && top > window.innerHeight * 0.55)) {
        window.scrollBy({ top: top - 80, behavior: "smooth" });
      }
    }
    przelacz(expanded);
  };

  return (
    <section ref={ref} aria-label={s.nazwa} className="scroll-mt-20">
      <h3 className={classes("", "sticky top-16 z-20", "lg:sticky lg:top-16 lg:z-20")}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={contentId}
          className={`relative flex w-full items-center gap-3 overflow-hidden text-left transition-[height] duration-300 active:scale-[0.99] ${
            belki
              ? `bg-tekst text-tlo ${classes("h-16", "h-14", "h-16 lg:h-14")}`
              : karty
                ? // like the section pills on the venue's site: collapsed white with a border, expanded in the accent color
                  `h-16 rounded-full border ${classes(
                    "border-obrys bg-karta text-tekst",
                    "border-akcent bg-akcent text-na-akcencie",
                    "border-obrys bg-karta text-tekst lg:border-akcent lg:bg-akcent lg:text-na-akcencie",
                  )}`
                : spis
                  ? // like a section on the venue's menu card: just an underlined title; page background, because when sticky it covers the dishes
                    // chalkboard: the same chalk as the page background, so the sticky header is not a flat rectangle
                    `bg-tlo ${spis === "tablica" ? "tlo-kreda h-20" : // dots: frosted glass instead of a second piece of marble (a different vein pattern made a visible rectangle)
                    spis === "kropki" ? "h-20 bg-tlo/80! backdrop-blur-sm" : spis === "srodek" ? "h-16" : "h-14"}`
                  : `rounded-2xl shadow-sm ${classes("h-20", "h-14", "h-20 lg:h-14")} ${s.okladka ? "bg-noc text-white" : "bg-krem text-tekst"}`
          }`}
        >
          {s.okladka && zdjecie && !belki && !karty && !spis && (
            <>
              <Image
                src={s.okladka.plik}
                alt=""
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                // the first tile is often the largest element on screen (LCP) — loaded right away; the rest lazily,
                // while scrolling
                preload={pierwszy}
                className="object-cover"
                style={{ objectPosition: s.okladka.pozycja }}
              />
              <span className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/15" />
            </>
          )}
          {/* center: left padding equal to the arrow on the right, so the name stays centered */}
          <span className={`relative min-w-0 flex-1 ${karty ? "pl-6" : spis === "srodek" ? "pl-10 text-center" : spis ? "" : "pl-4"}`}>
            <span
              className={`block truncate leading-tight ${spis === "tablica" || spis === "srodek" || spis === "kropki" ? "" : "font-grotesk"} ${
                belki
                  ? "text-2xl font-black uppercase"
                  : karty
                    ? "text-lg font-medium uppercase"
                    : spis === "tablica"
                      ? // handwriting + a line in the Italian colors; py: room for letter stems that `truncate` would cut off
                        "py-1 font-[family-name:var(--ozdobny-lokalu)] text-[1.9rem] leading-tight"
                      : spis === "kropki"
                        ? "py-1 font-[family-name:var(--ozdobny-lokalu)] text-[1.9rem] leading-tight italic"
                      : spis === "srodek"
                        ? "font-[family-name:var(--ozdobny-lokalu)] text-base font-semibold tracking-[0.04em] uppercase sm:text-xl sm:tracking-[0.06em]"
                      : spis
                        ? // pb: room for the underline that `truncate` (overflow: hidden) would otherwise cut off
                          "pb-2 text-xl font-bold tracking-[0.18em] uppercase underline decoration-2 underline-offset-[6px]"
                      : "text-xl font-bold"
              }`}
            >
              {s.nazwa}
            </span>
            {spis === "tablica" && <Tricolor className="mb-1 w-40 max-w-[45%]" />}
            <span
              className={
                karty
                  ? `${LABEL} block text-[11px] tracking-[0.12em] opacity-70`
                  : `block text-xs font-bold ${spis ? "text-tekst-2" : belki ? "text-tlo/70" : s.okladka ? "text-white/75" : "text-tekst-2"}`
              }
            >
              {s.pozycje.length} {plural(s.pozycje.length, ["pozycja", "pozycje", "pozycji"])}
              {from !== null && ` · od ${formatPln(from)}`}
            </span>
          </span>
          {onList > 0 && (
            <span className="relative shrink-0 animate-wjazd rounded-full bg-akcent px-2.5 py-1 text-xs font-black text-na-akcencie [animation-duration:0.3s]">
              {onList} na liście
            </span>
          )}
          <ChevronDown
            aria-hidden
            className={`relative mr-4 size-6 shrink-0 transition-transform duration-300 ${classes("", "rotate-180", "lg:rotate-180")}`}
          />
        </button>
      </h3>
      {/* collapsed content is invisible (visibility), so it does not take focus; visibility switches after the animation */}
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${classes(
          "invisible grid-rows-[0fr]",
          "grid-rows-[1fr]",
          "grid-rows-[0fr] max-lg:invisible lg:grid-rows-[1fr]",
        )}`}
      >
        <div className="min-h-0 overflow-hidden px-1">
          {s.opis && <p className="pt-3 text-sm font-semibold text-tekst-2">{s.opis}</p>}
          {/* on a computer the menu has the full page width — dishes in two columns */}
          {karty ? (
            <ul className="grid gap-3 pt-3 pb-3 sm:grid-cols-2 lg:grid-cols-3">
              {s.pozycje.map((p) => (
                <DishCard key={p.id} p={p} l={l} />
              ))}
            </ul>
          ) : spis ? (
            <ul className="pb-3 lg:grid lg:grid-cols-2 lg:gap-x-12">
              {s.pozycje.map((p) => (
                <ListStyleItem key={p.id} p={p} l={l} styl={spis} />
              ))}
            </ul>
          ) : (
            <ul className="pb-2 lg:grid lg:grid-cols-2 lg:gap-x-10">
              {s.pozycje.map((p, i) => (
                <MenuRow key={p.id} p={p} l={l} numer={numerowane ? i + 1 : null} belki={belki} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function MenuRow({
  p,
  l,
  numer,
  belki,
}: {
  p: MenuItem;
  l: VenueOrderList;
  numer: number | null;
  belki: boolean;
}) {
  const singlePrice = p.ceny.length <= 1;
  const price = p.ceny[0] ?? null;
  const add = (variant: string | null, gr: number | null) =>
    l.dodaj({ klucz: itemKey(p.id, variant), nazwa: p.nazwa, wariant: variant, gr });
  const onList = p.ceny.length
    ? p.ceny.some((c) => l.ilosc(itemKey(p.id, c.wariant)) > 0)
    : l.ilosc(itemKey(p.id, null)) > 0;
  const priceText = price ? formatPln(price.gr) : <span className="font-bold text-tekst-2">cena w lokalu</span>;

  return (
    // the line is on the <li>, the highlight in the middle — a rounded background does not bend the line
    <li className="border-b border-obrys">
      <div
        className={`-mx-3 flex items-start gap-3 rounded-2xl px-3 py-3.5 transition-colors duration-300 ${onList ? "bg-akcent/[0.08]" : ""}`}
      >
        {numer !== null && !belki && (
          <span className="w-6 shrink-0 pt-0.5 text-right text-sm font-bold text-tekst-2 tabular-nums">{numer}.</span>
        )}
        <div className="min-w-0 flex-1">
          {belki ? (
            // as on the venue's menu card: „1. BURGER KLASYK” and the price on a label right after the name
            <h4 className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-grotesk text-lg leading-tight font-black uppercase">
                {numer !== null && `${numer}. `}
                {p.nazwa}
              </span>
              {singlePrice && (
                <span className="bg-akcent px-1.5 py-px text-sm leading-snug font-bold text-na-akcencie">
                  {priceText}
                </span>
              )}
            </h4>
          ) : numer !== null && singlePrice ? (
            // as on the venue's menu card: name ······ price
            <h4 className="flex items-baseline gap-2">
              <span className="font-grotesk text-lg leading-snug font-bold">{p.nazwa}</span>
              <span aria-hidden className="mb-1 min-w-4 flex-1 border-b border-dotted border-obrys-2" />
              <span className="shrink-0 font-black">{priceText}</span>
            </h4>
          ) : (
            <h4 className="leading-snug font-extrabold">{p.nazwa}</h4>
          )}
          {p.cechy.length > 0 && (
            <p className="mt-1 flex flex-wrap gap-1">
              {p.cechy.map((c) => {
                const { nazwa, ikona: Ikona, kolor } = FEATURES[c];
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
          {singlePrice ? (
            numer === null && !belki && <p className="mt-1.5 font-black">{priceText}</p>
          ) : (
            <Variants p={p} l={l} className="mt-2" />
          )}
        </div>
        {singlePrice && (
          <Counter
            ile={l.ilosc(itemKey(p.id, null))}
            nazwa={p.nazwa}
            dodaj={() => add(null, price?.gr ?? null)}
            zmien={(o) => l.zmienIlosc(itemKey(p.id, null), o)}
          />
        )}
      </div>
    </li>
  );
}

/** Dish variant buttons („32 cm 38 zł +”) — each adds its own variant to the list. */
function Variants({ p, l, className = "" }: { p: MenuItem; l: VenueOrderList; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {p.ceny.map((c) => {
        const count = l.ilosc(itemKey(p.id, c.wariant));
        return (
          <button
            key={c.wariant}
            type="button"
            onClick={() => l.dodaj({ klucz: itemKey(p.id, c.wariant), nazwa: p.nazwa, wariant: c.wariant, gr: c.gr })}
            aria-label={`Dodaj do listy: ${p.nazwa}, ${c.wariant}, ${formatPln(c.gr)}`}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] pr-1 pl-3 text-sm font-extrabold transition active:scale-95 ${
              count ? "border-tekst bg-tekst text-tlo" : "border-obrys-2 bg-karta hover:border-tekst"
            }`}
          >
            <span className={count ? "opacity-70" : "text-tekst-2"}>{c.wariant}</span> {formatPln(c.gr)}
            <span
              className={`flex size-7 items-center justify-center rounded-full ${count ? "bg-akcent text-na-akcencie" : "bg-krem"}`}
            >
              {count ? <span className="text-xs font-black">{count}</span> : <Plus className="size-4" aria-hidden />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Dish on a card (venue theme with `menuKarty`): uppercase name, ingredients, price on a pill and „+” in the corner.
 */
function DishCard({ p, l }: { p: MenuItem; l: VenueOrderList }) {
  const singlePrice = p.ceny.length <= 1;
  const price = p.ceny[0] ?? null;
  const key = itemKey(p.id, null);
  const onList = p.ceny.length
    ? p.ceny.some((c) => l.ilosc(itemKey(p.id, c.wariant)) > 0)
    : l.ilosc(key) > 0;

  return (
    <li
      className={`flex flex-col rounded-[20px] border bg-karta p-4 transition-colors duration-300 ${
        onList ? "border-akcent ring-1 ring-akcent" : "border-obrys"
      }`}
    >
      {p.cechy.length > 0 && (
        <p className="mb-2 flex flex-wrap gap-1">
          {p.cechy.map((c) => (
            <span
              key={c}
              // „Polecane” like the venue's „Danie dnia”: a solid pill; the rest outlined
              className={`${LABEL} rounded-full px-2 py-0.5 text-[10.5px] tracking-[0.12em] ${
                c === "polecane" ? "bg-akcent-tekst text-krem" : "border border-obrys-2 text-tekst-2"
              }`}
            >
              {FEATURES[c].nazwa}
            </span>
          ))}
        </p>
      )}
      <h4 className="font-grotesk text-lg leading-tight font-medium uppercase">{p.nazwa}</h4>
      {p.opis && <p className="mt-1.5 text-[13.5px] leading-snug text-tekst-2">{p.opis}</p>}
      {singlePrice ? (
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="rounded-full bg-krem px-2.5 py-1 font-[family-name:var(--etykiety-lokalu)] text-[13px] font-medium text-akcent">
            {price ? formatPln(price.gr) : "cena w lokalu"}
          </span>
          <Counter
            ile={l.ilosc(key)}
            nazwa={p.nazwa}
            dodaj={() => l.dodaj({ klucz: key, nazwa: p.nazwa, wariant: null, gr: price?.gr ?? null })}
            zmien={(o) => l.zmienIlosc(key, o)}
          />
        </div>
      ) : (
        <Variants p={p} l={l} className="mt-auto pt-3" />
      )}
    </li>
  );
}

/**
 * Dish in a list-style menu (venue theme with `menuSpis`), price on the right. wersaliki: letter-spaced uppercase name,
 * features as icons, ingredients separated by „|”; tablica: plain name, „(vege)” in green, underlined price.
 */
function ListStyleItem({
  p,
  l,
  styl,
}: {
  p: MenuItem;
  l: VenueOrderList;
  styl: "wersaliki" | "tablica" | "srodek" | "kropki";
}) {
  const chalkboard = styl === "tablica";
  const dots = styl === "kropki";
  const singlePrice = p.ceny.length <= 1;
  const price = p.ceny[0] ?? null;
  const key = itemKey(p.id, null);
  const onList = p.ceny.length
    ? p.ceny.some((c) => l.ilosc(itemKey(p.id, c.wariant)) > 0)
    : l.ilosc(key) > 0;

  if (styl === "srodek") {
    // as on the venue's menu card: everything centered, ingredients in the label font after „•”, price and „+” below
    return (
      <li className={`border-b border-obrys px-2 py-4 text-center transition-colors duration-300 ${onList ? "bg-krem" : ""}`}>
        <h4 className="font-grotesk text-[15px] leading-snug tracking-[0.02em]">
          {p.nazwa}
          {p.cechy.map((c) => {
            const { nazwa, ikona: Ikona } = FEATURES[c];
            return (
              <Ikona
                key={c}
                aria-label={nazwa}
                className={`ml-1.5 inline size-4 align-[-2px] ${c === "wege" ? "text-otwarte" : c === "ostre" ? "text-zamkniete" : ""}`}
              />
            );
          })}
        </h4>
        {p.opis && (
          <p className="mt-1 font-[family-name:var(--etykiety-lokalu)] text-[13px] leading-snug text-akcent-tekst">
            {p.opis.split(/,\s*/).join(" • ")}
          </p>
        )}
        {singlePrice ? (
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="font-bold">{price ? formatPln(price.gr) : "cena w lokalu"}</span>
            <Counter
              ile={l.ilosc(key)}
              nazwa={p.nazwa}
              dodaj={() => l.dodaj({ klucz: key, nazwa: p.nazwa, wariant: null, gr: price?.gr ?? null })}
              zmien={(o) => l.zmienIlosc(key, o)}
            />
          </div>
        ) : (
          <Variants p={p} l={l} className="mt-2 justify-center" />
        )}
      </li>
    );
  }

  return (
    <li className="border-b border-obrys">
      <div
        className={`-mx-3 flex items-start gap-3 px-3 py-3.5 transition-colors duration-300 ${onList ? "bg-krem" : ""}`}
      >
        <div className="min-w-0 flex-1">
          <h4 className="flex items-baseline gap-2">
            <span
              className={`font-grotesk leading-snug font-bold ${
                chalkboard
                  ? "text-[17px] font-semibold"
                  : dots
                    ? "text-[14px] font-semibold tracking-[0.06em] uppercase"
                    : "text-[15px] tracking-[0.14em] uppercase"
              }`}
            >
              {p.nazwa}
              {chalkboard && p.cechy.includes("wege") && (
                <span className="ml-1.5 text-[13px] font-normal text-otwarte">(vege)</span>
              )}
              {p.cechy.filter((c) => !chalkboard || c !== "wege").map((c) => {
                const { nazwa, ikona: Ikona } = FEATURES[c];
                return (
                  <Ikona
                    key={c}
                    aria-label={nazwa}
                    className={`ml-1.5 inline size-4 align-[-2px] ${c === "wege" ? "text-otwarte" : c === "ostre" ? "text-zamkniete" : ""}`}
                  />
                );
              })}
            </span>
            {/* dots: name ······ price, as on the venue's menu card */}
            {dots && singlePrice && <span aria-hidden className="mb-1 min-w-4 flex-1 border-b-2 border-dotted border-tekst-2/60" />}
            {singlePrice && (
              <span
                className={`shrink-0 font-grotesk font-bold ${dots ? "font-semibold" : "ml-auto pl-2"} ${chalkboard ? "border-b-2 border-tekst" : ""}`}
              >
                {price ? formatPln(price.gr) : "w lokalu"}
              </span>
            )}
          </h4>
          {p.opis && <p className="mt-1 text-[13px] leading-snug text-tekst-2">{chalkboard || dots ? p.opis : p.opis.split(/,\s*/).join(" | ")}</p>}
          {!singlePrice && <Variants p={p} l={l} className="mt-2" />}
        </div>
        {singlePrice && (
          <Counter
            ile={l.ilosc(key)}
            nazwa={p.nazwa}
            dodaj={() => l.dodaj({ klucz: key, nazwa: p.nazwa, wariant: null, gr: price?.gr ?? null })}
            zmien={(o) => l.zmienIlosc(key, o)}
          />
        )}
      </div>
    </li>
  );
}
