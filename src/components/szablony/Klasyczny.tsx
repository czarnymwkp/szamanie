import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Star,
  Truck,
} from "lucide-react";
import Baner from "@/components/Baner";
import EtykietaPromo from "@/components/EtykietaPromo";
import StatusOtwarcia from "@/components/StatusOtwarcia";
import TabelaGodzin from "@/components/TabelaGodzin";
import MenuLokalu from "@/components/menu/MenuLokalu";
import { dataPl, zl } from "@/lib/ceny";
import { parsujGodziny } from "@/lib/godziny";
import type { Lokal } from "@/lib/lokale";
import { pobierzDostawe, pobierzMenu, type Dostawa } from "@/lib/menu";
import { motywStrony, type MotywStrony } from "@/lib/motywyStron";
import PrzyciskProwadz from "@/components/PrzyciskProwadz";
import { linkFacebooka, linkInstagrama, linkTelefonu, linkWww, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BanerSwietliki from "./BanerSwietliki";
import { KROJE } from "./kroje";
import { adresMapy, plakietkiLokalu, uslugiLokalu } from "./wspolne";

const przycisk = (wyglad: string) =>
  `inline-flex h-12 items-center gap-2 rounded-full px-5 font-black transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${wyglad}`;

const karta =
  "pojawianie rounded-2xl bg-karta p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.05)] ring-1 ring-obrys/60";

const pigulka = "inline-flex items-center gap-1.5 rounded-full bg-krem px-3 py-1.5 transition hover:bg-obrys";

const dowoz = "inline-flex items-center gap-1.5 rounded-full bg-akcent px-3 py-1.5 text-na-akcencie";

/** „Dostawa od 3 zł”, a gdy lokal nie podał cen — „Dostawa: cena u lokalu”. */
function opisDostawy(dostawa: Dostawa) {
  const ceny = dostawa.strefy.map((s) => s.cenaGr).filter((c) => c !== null);
  if (!ceny.length) return "Dostawa: cena u lokalu";
  const min = Math.min(...ceny);
  return min ? `Dostawa od ${zl(min)}` : "Dostawa gratis w części miejscowości";
}

/** Zmienne CSS motywu lokalu na <article>: kolory tokenów i kroje (nagłówki przez --naglowek-lokalu i font-grotesk). */
function stylMotywu(m: MotywStrony | null) {
  if (!m) return { className: "", style: undefined };
  const style: Record<string, string> = {};
  for (const [token, kolor] of Object.entries(m.kolory)) style[`--color-${token}`] = kolor;
  if (m.ciemny) style.colorScheme = "dark";
  const klasy: string[] = [];
  if (m.kroje) {
    const { naglowki, tekst } = m.kroje;
    klasy.push(KROJE[naglowki].variable, KROJE[tekst].variable);
    style["--naglowek-lokalu"] = KROJE[naglowki].zmienna;
    style["--font-space-grotesk"] = KROJE[naglowki].zmienna;
    style.fontFamily = KROJE[tekst].zmienna;
  }
  return { className: klasy.join(" "), style: style as CSSProperties };
}

/** Domyślny wygląd strony lokalu. Kolejne szablony (wybierane w abonamencie) mają ten sam interfejs. */
export default async function Klasyczny({ lokal, powrot = "/" }: { lokal: Lokal; powrot?: string }) {
  const [menu, dostawa] = await Promise.all([pobierzMenu(lokal.id), pobierzDostawe(lokal.id)]);
  const tydzien = parsujGodziny(lokal.godziny);
  const plakietki = plakietkiLokalu(lokal);
  const uslugi = uslugiLokalu(lokal, { bezPlakietek: true });
  const mapa = adresMapy(lokal);
  const motyw = motywStrony(lokal.slug);
  const { className: krojeMotywu, style: stylStrony } = stylMotywu(motyw);
  // Krój nagłówków z motywu lokalu; bez motywu nagłówki zostają w kroju strony.
  const naglowek = motyw?.kroje ? "font-[family-name:var(--naglowek-lokalu)]" : "";

  return (
    <article className={`bg-tlo pb-12 text-tekst ${krojeMotywu}`} style={stylStrony}>
      <div className="relative">
        <ViewTransition name={`baner-${lokal.slug}`} share="morph" default="none">
          {motyw?.baner ? (
            <BanerSwietliki znak={motyw.baner.znak} nazwa={lokal.nazwa} podpis={motyw.baner.podpis} />
          ) : (
            <Baner lokal={lokal} rozmiar="strona" className="h-44 sm:h-56 lg:h-72" />
          )}
        </ViewTransition>
        <div className="absolute inset-x-0 top-0">
          <div className="mx-auto max-w-5xl px-5 pt-4">
            <Link
              href={powrot}
              className="inline-flex items-center gap-1.5 rounded-full bg-karta/95 px-3.5 py-2 text-sm font-extrabold shadow-md transition-all hover:gap-2.5"
            >
              <ArrowLeft className="size-4" aria-hidden /> Wszystkie lokale
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5">
        {lokal.promowany && <EtykietaPromo className={`${motyw?.baner ? "mt-2" : "mt-5"} animate-wjazd`} />}

        {/* Telefon: nagłówek → menu → adres → godziny → reszta. Komputer: nagłówek | godziny, pod spodem menu
            na całą szerokość, na dole adres | dostawa i usługi. */}
        <div className={`${motyw?.baner ? "mt-2" : "mt-5"} flex flex-col lg:grid lg:grid-cols-[1fr_340px] lg:gap-x-10`}>
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            {!motyw?.baner && (
              <h1
                className={`animate-wjazd text-3xl leading-tight font-black tracking-tight text-balance [animation-delay:60ms] sm:text-4xl lg:text-5xl ${naglowek}`}
              >
                {lokal.nazwa}
              </h1>
            )}
            <p className="mt-1 animate-wjazd font-bold text-tekst-2 [animation-delay:120ms]">{opisLokalu(lokal)}</p>
            <StatusOtwarcia godziny={lokal.godziny} className="mt-2 animate-wjazd [animation-delay:160ms]" />
            {(menu || lokal.dostawa) && (
              <p className="mt-3 flex animate-wjazd flex-wrap gap-2 text-sm font-extrabold [animation-delay:180ms]">
                {/* dowóz na samej górze i w kolorze akcentu — przy zamawianiu to pierwsze pytanie */}
                {dostawa ? (
                  // Na telefonie karta dostawy jest dopiero pod menu — stąd skrót do niej.
                  <a href="#dostawa" className={dowoz}>
                    <Truck className="size-4" aria-hidden /> {opisDostawy(dostawa)}
                  </a>
                ) : (
                  lokal.dostawa && (
                    <span className={dowoz}>
                      <Truck className="size-4" aria-hidden /> Dowóz
                    </span>
                  )
                )}
                {menu && (
                  <a href="#menu" className={pigulka}>
                    <BookOpen className="size-4 text-akcent-tekst" aria-hidden /> Menu · {menu.liczba}{" "}
                    {odmiana(menu.liczba, ["pozycja", "pozycje", "pozycji"])}
                  </a>
                )}
              </p>
            )}
            {plakietki.length > 0 && (
              // zwierzęta, niepełnosprawni, wege — ważne przy wyborze lokalu, więc od razu pod nazwą
              <ul
                aria-label="Przyjazny dla"
                className="mt-3 flex animate-wjazd flex-wrap gap-2 [animation-delay:190ms]"
              >
                {plakietki.map(({ ikona: Ikona, nazwa }) => (
                  <li
                    key={nazwa}
                    className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-obrys-2 bg-karta px-3 py-1.5 text-sm font-extrabold"
                  >
                    <Ikona className="size-4 text-otwarte" aria-hidden /> {nazwa}
                  </li>
                ))}
              </ul>
            )}
            {lokal.opis && <p className="mt-4 max-w-prose leading-relaxed">{lokal.opis}</p>}

            <div className="-mx-5 mt-5 flex animate-wjazd gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [animation-delay:200ms] *:shrink-0 sm:mx-0 sm:flex-wrap sm:px-0">
              {lokal.telefon && (
                <a href={linkTelefonu(lokal.telefon)} className={przycisk("bg-akcent text-na-akcencie")}>
                  <Phone className="size-5" aria-hidden /> Zadzwoń
                  <span className="hidden font-bold sm:inline">· {lokal.telefon}</span>
                </a>
              )}
              <PrzyciskProwadz lokal={lokal} className={przycisk("bg-tekst text-tlo")}>
                <Navigation className="size-5" aria-hidden /> Prowadź
              </PrzyciskProwadz>
              {/* gwiazdki i opinie zostają w Google — zwykły link do Map, bez klucza i bez kopiowania danych */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lokal.nazwa}, ${pelnyAdres(lokal)}`)}`}
                target="_blank"
                rel="noopener"
                className={przycisk("border-2 border-tekst bg-karta")}
              >
                <Star className="size-5" aria-hidden /> Opinie w Google
              </a>
              {lokal.www && (
                <a
                  href={linkWww(lokal.www)}
                  target="_blank"
                  rel="noopener"
                  className={przycisk("border-2 border-tekst bg-karta")}
                >
                  <Globe className="size-5" aria-hidden /> Strona
                </a>
              )}
              {lokal.menuUrl && !menu && (
                <a
                  href={linkWww(lokal.menuUrl)}
                  target="_blank"
                  rel="noopener"
                  className={przycisk("border-2 border-tekst bg-krem")}
                >
                  <BookOpen className="size-5" aria-hidden /> Menu
                </a>
              )}
              {lokal.facebook && (
                <a
                  href={linkFacebooka(lokal.facebook)}
                  target="_blank"
                  rel="noopener"
                  className={przycisk("border-2 border-tekst bg-karta")}
                >
                  <ExternalLink className="size-5" aria-hidden /> Facebook
                </a>
              )}
              {lokal.instagram && (
                <a
                  href={linkInstagrama(lokal.instagram)}
                  target="_blank"
                  rel="noopener"
                  className={przycisk("border-2 border-tekst bg-karta")}
                >
                  <ExternalLink className="size-5" aria-hidden /> Instagram
                </a>
              )}
              {lokal.email && (
                <a href={`mailto:${lokal.email}`} className={przycisk("border-2 border-tekst bg-karta")}>
                  <Mail className="size-5" aria-hidden /> E-mail
                </a>
              )}
            </div>
          </div>

          <aside
            aria-label="Godziny otwarcia"
            className="order-4 mt-10 lg:order-none lg:col-start-2 lg:row-start-1 lg:mt-0"
          >
            <section aria-labelledby="godziny" className={karta}>
              <h2 id="godziny" className={`text-lg font-black ${naglowek}`}>
                Godziny otwarcia
              </h2>
              <div className="mt-3">
                {tydzien ? (
                  <TabelaGodzin tydzien={tydzien} />
                ) : (
                  <p className="text-sm text-tekst-2">{lokal.godziny ?? "Brak informacji o godzinach otwarcia."}</p>
                )}
              </div>
            </section>
          </aside>

          <div className="order-2 min-w-0 lg:order-none lg:col-span-2 lg:row-start-2">
            {menu ? (
              <MenuLokalu
                menu={menu}
                dostawa={dostawa}
                slug={lokal.slug}
                nazwa={lokal.nazwa}
                telefon={lokal.telefon}
                numerowane={motyw?.menuNumerowane}
              />
            ) : (
              <section
                aria-labelledby="menu-tytul"
                className="mt-8 rounded-2xl border-2 border-dashed border-obrys-2 p-5"
              >
                <h2 id="menu-tytul" className="font-grotesk text-2xl font-bold">
                  Menu
                </h2>
                <p className="mt-1 text-sm font-semibold text-tekst-2">
                  Tego menu jeszcze u nas nie ma.
                  {lokal.menuUrl ? " Na razie zajrzyj do menu na stronie lokalu." : " Zapytaj w lokalu albo zadzwoń."}
                </p>
                {lokal.menuUrl && (
                  <a
                    href={linkWww(lokal.menuUrl)}
                    target="_blank"
                    rel="noopener"
                    className={`${przycisk("bg-krem")} mt-3`}
                  >
                    <BookOpen className="size-5" aria-hidden /> Menu na stronie lokalu
                  </a>
                )}
              </section>
            )}
          </div>

          <section
            aria-labelledby="adres"
            className="pojawianie order-3 mt-10 min-w-0 lg:order-none lg:col-start-1 lg:row-start-3"
          >
            <h2 id="adres" className={`text-xl font-black ${naglowek}`}>
              Adres i dojazd
            </h2>
            <p className="mt-2 flex items-center gap-2 font-semibold">
              <MapPin className="size-5 shrink-0 text-akcent-tekst" aria-hidden />
              {pelnyAdres(lokal)}
              {lokal.gmina && lokal.gmina !== lokal.miejscowosc && (
                <span className="text-tekst-2">· {lokal.gmina}</span>
              )}
            </p>
            <iframe
              title={`Mapa: ${lokal.nazwa}`}
              src={mapa}
              loading="lazy"
              className="mt-3 h-64 w-full rounded-2xl border-0 bg-krem shadow-sm lg:h-80"
            />
          </section>

          <aside className="order-5 mt-5 space-y-5 lg:order-none lg:col-start-2 lg:row-start-3 lg:mt-10">
            {dostawa && <KartaDostawy dostawa={dostawa} />}

            {uslugi.length > 0 && (
              <section aria-labelledby="uslugi" className={karta}>
                <h2 id="uslugi" className={`text-lg font-black ${naglowek}`}>
                  Usługi i udogodnienia
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2 text-sm font-extrabold">
                  {uslugi.map(({ ikona: Ikona, nazwa }) => (
                    <li key={nazwa} className="flex items-center gap-1.5 rounded-full bg-krem px-3 py-1.5">
                      <Ikona className="size-4" aria-hidden /> {nazwa}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="pojawianie rounded-2xl bg-tekst p-5 text-tlo">
              <h2 className="text-lg font-black">To Twój lokal?</h2>
              <p className="mt-1 text-sm leading-relaxed opacity-85">
                Dodaj menu z cenami, zdjęcia i wybierz własny wygląd tej strony.
              </p>
              <Link
                href="/dla-lokali"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-akcent px-4 py-2.5 text-sm font-black text-na-akcencie transition-all hover:gap-2.5"
              >
                Sprawdź pakiety <ArrowRight className="size-4" aria-hidden />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </article>
  );
}

/** Strefy dostawy: miejscowość → cena i minimalne zamówienie (pierwsze widać od razu, resztę po rozwinięciu). */
function KartaDostawy({ dostawa }: { dostawa: Dostawa }) {
  const NA_START = 6;
  const wiersz = (s: Dostawa["strefy"][number]) => (
    <li key={s.nazwa} className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="font-bold">{s.nazwa}</span>
      <span className="shrink-0 text-right font-extrabold">
        {s.cenaGr === null ? "zapytaj" : s.cenaGr ? zl(s.cenaGr) : "gratis"}
        {s.minGr ? <span className="block text-xs font-bold text-tekst-2">min. {zl(s.minGr)}</span> : null}
      </span>
    </li>
  );
  return (
    <section aria-labelledby="dostawa" className={karta}>
      <h2 id="dostawa" className="flex scroll-mt-28 items-center gap-2 text-lg font-black">
        <Truck className="size-5 text-akcent-tekst" aria-hidden /> Dostawa
      </h2>
      {dostawa.uwagi && <p className="mt-1 text-sm font-semibold text-tekst-2">{dostawa.uwagi}</p>}
      <ul className="mt-2 divide-y divide-obrys text-sm">{dostawa.strefy.slice(0, NA_START).map(wiersz)}</ul>
      {dostawa.strefy.length > NA_START && (
        <details className="group text-sm">
          <summary className="cursor-pointer py-1.5 font-extrabold text-akcent-tekst group-open:hidden">
            Pokaż wszystkie ({dostawa.strefy.length})
          </summary>
          <ul className="divide-y divide-obrys border-t border-obrys">{dostawa.strefy.slice(NA_START).map(wiersz)}</ul>
        </details>
      )}
      {dostawa.sprawdzono && (
        <p className="mt-2 text-xs font-semibold text-tekst-2">
          Wg{" "}
          {dostawa.zrodlo && /^https?:/.test(dostawa.zrodlo) ? (
            <a href={dostawa.zrodlo} target="_blank" rel="noopener" className="underline">
              strony lokalu
            </a>
          ) : (
            "lokalu"
          )}
          , sprawdzone {dataPl(dostawa.sprawdzono)}.
        </p>
      )}
    </section>
  );
}
