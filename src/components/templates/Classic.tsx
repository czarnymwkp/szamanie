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
import Banner from "@/components/Banner";
import PromoLabel from "@/components/PromoLabel";
import OsmMap from "@/components/OsmMap";
import OpeningStatus from "@/components/OpeningStatus";
import HoursTable from "@/components/HoursTable";
import VenueMenu from "@/components/menu/VenueMenu";
import { formatDatePl, formatPln } from "@/lib/prices";
import { parseHours } from "@/lib/hours";
import type { Venue } from "@/lib/venues";
import { getDelivery, getMenu, type Delivery } from "@/lib/menu";
import { getPromotions } from "@/lib/promotions";
import { pageTheme, type PageTheme } from "@/lib/venueThemes";
import DirectionsButton from "@/components/DirectionsButton";
import { facebookUrl, instagramUrl, phoneUrl, websiteUrl, plural, venueDescription, fullAddress } from "@/lib/format";
import BarBanner from "./BarBanner";
import ElegantBanner from "./ElegantBanner";
import CheckerBanner from "./CheckerBanner";
import MascotBanner from "./MascotBanner";
import RuleBanner from "./RuleBanner";
import StripBanner from "./StripBanner";
import FireflyBanner from "./FireflyBanner";
import ChalkboardBanner from "./ChalkboardBanner";
import VenuePromotions from "./VenuePromotions";
import { FONTS } from "./fonts";
import { mapUrl, venueBadges, venueServices } from "./shared";

const button = (look: string) =>
  `inline-flex h-12 items-center gap-2 rounded-full px-5 font-black transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${look}`;

const card =
  "pojawianie rounded-2xl bg-karta p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.05)] ring-1 ring-obrys/60";

const pill = "inline-flex items-center gap-1.5 rounded-full bg-krem px-3 py-1.5 transition hover:bg-obrys";

const delivers = "inline-flex items-center gap-1.5 rounded-full bg-akcent px-3 py-1.5 text-na-akcencie";

/** „Dostawa od 3 zł”, a gdy lokal nie podał cen — „Dostawa: cena u lokalu”. */
export function deliveryDescription(delivery: Delivery) {
  const prices = delivery.strefy.map((s) => s.cenaGr).filter((c) => c !== null);
  if (!prices.length) return "Dostawa: cena u lokalu";
  const min = Math.min(...prices);
  return min ? `Dostawa od ${formatPln(min)}` : "Dostawa gratis w części miejscowości";
}

/** Zmienne CSS motywu lokalu na <article>: kolory tokenów i kroje (nagłówki przez --naglowek-lokalu i font-grotesk). */
function themeStyle(m: PageTheme | null) {
  if (!m) return { className: "", style: undefined };
  const style: Record<string, string> = {};
  for (const [token, kolor] of Object.entries(m.kolory)) style[`--color-${token}`] = kolor;
  if (m.ciemny) style.colorScheme = "dark";
  const classes: string[] = [];
  if (m.kroje) {
    const { naglowki, tekst } = m.kroje;
    classes.push(FONTS[naglowki].variable, FONTS[tekst].variable);
    style["--naglowek-lokalu"] = FONTS[naglowki].zmienna;
    style["--font-space-grotesk"] = FONTS[naglowki].zmienna;
    style.fontFamily = FONTS[tekst].zmienna;
    if (m.kroje.etykiety) {
      classes.push(FONTS[m.kroje.etykiety].variable);
      style["--etykiety-lokalu"] = FONTS[m.kroje.etykiety].zmienna;
    }
    if (m.kroje.ozdobny) {
      classes.push(FONTS[m.kroje.ozdobny].variable);
      style["--ozdobny-lokalu"] = FONTS[m.kroje.ozdobny].zmienna;
    }
  }
  if (m.tekstura) classes.push(`tlo-${m.tekstura}`);
  return { className: classes.join(" "), style: style as CSSProperties };
}

/** Domyślny wygląd strony lokalu. Kolejne szablony (wybierane w abonamencie) mają ten sam interfejs. */
export default async function Classic({ lokal, powrot = "/" }: { lokal: Venue; powrot?: string }) {
  const [menu, dostawa, promocje] = await Promise.all([
    getMenu(lokal.id),
    getDelivery(lokal.id),
    getPromotions(lokal.id),
  ]);
  const week = parseHours(lokal.godziny);
  const badges = venueBadges(lokal);
  const services = venueServices(lokal, { bezPlakietek: true });
  const map = mapUrl(lokal);
  const theme = pageTheme(lokal.slug);
  const { className: krojeMotywu, style: stylStrony } = themeStyle(theme);
  // Krój nagłówków z motywu lokalu; bez motywu nagłówki zostają w kroju strony.
  const heading = theme?.kroje ? "font-[family-name:var(--naglowek-lokalu)]" : "";

  return (
    <article className={`bg-tlo pb-12 text-tekst ${krojeMotywu}`} style={stylStrony}>
      <div className="relative">
        <ViewTransition name={`baner-${lokal.slug}`} share="morph" default="none">
          {theme?.baner?.rodzaj === "swietliki" ? (
            <FireflyBanner znak={theme.baner.znak} nazwa={lokal.nazwa} podpis={theme.baner.podpis} />
          ) : theme?.baner?.rodzaj === "belka" ? (
            <BarBanner nazwa={lokal.nazwa} haslo={theme.baner.haslo} podpis={theme.baner.podpis} />
          ) : theme?.baner?.rodzaj === "krata" ? (
            <CheckerBanner nazwa={lokal.nazwa} haslo={theme.baner.haslo} podpis={theme.baner.podpis} />
          ) : theme?.baner?.rodzaj === "kreska" ? (
            <RuleBanner nazwa={lokal.nazwa} haslo={theme.baner.haslo} podpis={theme.baner.podpis} />
          ) : theme?.baner?.rodzaj === "tablica" ? (
            <ChalkboardBanner nazwa={lokal.nazwa} haslo={theme.baner.haslo} podpis={theme.baner.podpis} />
          ) : theme?.baner?.rodzaj === "pas" ? (
            <StripBanner nazwa={lokal.nazwa} haslo={theme.baner.haslo} podpis={theme.baner.podpis} />
          ) : theme?.baner?.rodzaj === "elegancki" ? (
            <ElegantBanner nazwa={lokal.nazwa} haslo={theme.baner.haslo} podpis={theme.baner.podpis} />
          ) : theme?.baner?.rodzaj === "ludzik" ? (
            <MascotBanner
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              znak={theme.baner.znak}
              haslo={theme.baner.haslo}
              podpis={theme.baner.podpis}
            />
          ) : (
            <Banner lokal={lokal} rozmiar="strona" className="h-44 sm:h-56 lg:h-72" />
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
        {lokal.promowany && <PromoLabel className={`${theme?.baner ? "mt-2" : "mt-5"} animate-wjazd`} />}

        {/* Telefon: nagłówek → menu → adres → godziny → reszta. Komputer: nagłówek | godziny, pod spodem menu
            na całą szerokość, na dole adres | dostawa i usługi. */}
        <div className={`${theme?.baner ? "mt-2" : "mt-5"} flex flex-col lg:grid lg:grid-cols-[1fr_340px] lg:gap-x-10`}>
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            {!theme?.baner && (
              <h1
                className={`animate-wjazd text-3xl leading-tight font-black tracking-tight text-balance [animation-delay:60ms] sm:text-4xl lg:text-5xl ${heading}`}
              >
                {lokal.nazwa}
              </h1>
            )}
            <p className="mt-1 animate-wjazd font-bold text-tekst-2 [animation-delay:120ms]">{venueDescription(lokal)}</p>
            <OpeningStatus godziny={lokal.godziny} className="mt-2 animate-wjazd [animation-delay:160ms]" />
            {(menu || lokal.dostawa) && (
              <p className="mt-3 flex animate-wjazd flex-wrap gap-2 text-sm font-extrabold [animation-delay:180ms]">
                {/* dowóz na samej górze i w kolorze akcentu — przy zamawianiu to pierwsze pytanie */}
                {dostawa ? (
                  // Na telefonie karta dostawy jest dopiero pod menu — stąd skrót do niej.
                  <a href="#dostawa" className={delivers}>
                    <Truck className="size-4" aria-hidden /> {deliveryDescription(dostawa)}
                  </a>
                ) : (
                  lokal.dostawa && (
                    <span className={delivers}>
                      <Truck className="size-4" aria-hidden /> Dowóz
                    </span>
                  )
                )}
                {menu && (
                  <a href="#menu" className={pill}>
                    <BookOpen className="size-4 text-akcent-tekst" aria-hidden /> Menu · {menu.liczba}{" "}
                    {plural(menu.liczba, ["pozycja", "pozycje", "pozycji"])}
                  </a>
                )}
              </p>
            )}
            {badges.length > 0 && (
              // zwierzęta, niepełnosprawni, wege — ważne przy wyborze lokalu, więc od razu pod nazwą
              <ul
                aria-label="Przyjazny dla"
                className="mt-3 flex animate-wjazd flex-wrap gap-2 [animation-delay:190ms]"
              >
                {badges.map(({ ikona: Ikona, nazwa }) => (
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
                <a href={phoneUrl(lokal.telefon)} className={button("bg-akcent text-na-akcencie")}>
                  <Phone className="size-5" aria-hidden /> Zadzwoń
                  <span className="hidden font-bold sm:inline">· {lokal.telefon}</span>
                </a>
              )}
              <DirectionsButton lokal={lokal} className={button("bg-tekst text-tlo")}>
                <Navigation className="size-5" aria-hidden /> Prowadź
              </DirectionsButton>
              {/* gwiazdki i opinie zostają w Google — zwykły link do Map, bez klucza i bez kopiowania danych */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lokal.nazwa}, ${fullAddress(lokal)}`)}`}
                target="_blank"
                rel="noopener"
                className={button("border-2 border-tekst bg-karta")}
              >
                <Star className="size-5" aria-hidden /> Opinie w Google
              </a>
              {lokal.www && (
                <a
                  href={websiteUrl(lokal.www)}
                  target="_blank"
                  rel="noopener"
                  className={button("border-2 border-tekst bg-karta")}
                >
                  <Globe className="size-5" aria-hidden /> Strona
                </a>
              )}
              {lokal.menuUrl && !menu && (
                <a
                  href={websiteUrl(lokal.menuUrl)}
                  target="_blank"
                  rel="noopener"
                  className={button("border-2 border-tekst bg-krem")}
                >
                  <BookOpen className="size-5" aria-hidden /> Menu
                </a>
              )}
              {lokal.facebook && (
                <a
                  href={facebookUrl(lokal.facebook)}
                  target="_blank"
                  rel="noopener"
                  className={button("border-2 border-tekst bg-karta")}
                >
                  <ExternalLink className="size-5" aria-hidden /> Facebook
                </a>
              )}
              {lokal.instagram && (
                <a
                  href={instagramUrl(lokal.instagram)}
                  target="_blank"
                  rel="noopener"
                  className={button("border-2 border-tekst bg-karta")}
                >
                  <ExternalLink className="size-5" aria-hidden /> Instagram
                </a>
              )}
              {lokal.email && (
                <a href={`mailto:${lokal.email}`} className={button("border-2 border-tekst bg-karta")}>
                  <Mail className="size-5" aria-hidden /> E-mail
                </a>
              )}
            </div>
            {promocje.length > 0 && <VenuePromotions promocje={promocje} naglowek={heading} />}
          </div>

          <aside
            aria-label="Godziny otwarcia"
            className="order-4 mt-10 lg:order-none lg:col-start-2 lg:row-start-1 lg:mt-0"
          >
            <section aria-labelledby="godziny" className={card}>
              <h2 id="godziny" className={`text-lg font-black ${heading}`}>
                Godziny otwarcia
              </h2>
              <div className="mt-3">
                {week ? (
                  <HoursTable tydzien={week} />
                ) : (
                  <p className="text-sm text-tekst-2">{lokal.godziny ?? "Brak informacji o godzinach otwarcia."}</p>
                )}
              </div>
            </section>
          </aside>

          <div className="order-2 min-w-0 lg:order-none lg:col-span-2 lg:row-start-2">
            {menu ? (
              <VenueMenu
                menu={menu}
                dostawa={dostawa}
                slug={lokal.slug}
                nazwa={lokal.nazwa}
                telefon={lokal.telefon}
                numerowane={theme?.menuNumerowane}
                belki={theme?.menuBelki}
                karty={theme?.menuKarty}
                spis={theme?.menuSpis}
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
                    href={websiteUrl(lokal.menuUrl)}
                    target="_blank"
                    rel="noopener"
                    className={`${button("bg-krem")} mt-3`}
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
            <h2 id="adres" className={`text-xl font-black ${heading}`}>
              Adres i dojazd
            </h2>
            <p className="mt-2 flex items-center gap-2 font-semibold">
              <MapPin className="size-5 shrink-0 text-akcent-tekst" aria-hidden />
              {fullAddress(lokal)}
              {lokal.gmina && lokal.gmina !== lokal.miejscowosc && (
                <span className="text-tekst-2">· {lokal.gmina}</span>
              )}
            </p>
            <OsmMap
              title={`Mapa: ${lokal.nazwa}`}
              src={map}
              className="mt-3 h-64 w-full rounded-2xl border-0 bg-krem shadow-sm lg:h-80"
            />
          </section>

          <aside className="order-5 mt-5 space-y-5 lg:order-none lg:col-start-2 lg:row-start-3 lg:mt-10">
            {dostawa && <DeliveryCard dostawa={dostawa} />}

            {services.length > 0 && (
              <section aria-labelledby="uslugi" className={card}>
                <h2 id="uslugi" className={`text-lg font-black ${heading}`}>
                  Usługi i udogodnienia
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2 text-sm font-extrabold">
                  {services.map(({ ikona: Ikona, nazwa }) => (
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
                Zmieniaj menu i ceny, godziny otwarcia i dodawaj promocje w panelu lokalu.
              </p>
              <Link
                href={`/panel/przejmij/${lokal.slug}`}
                prefetch={false}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-akcent px-4 py-2.5 text-sm font-black text-na-akcencie transition-all hover:gap-2.5"
              >
                Zarządzaj lokalem <ArrowRight className="size-4" aria-hidden />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </article>
  );
}

/** Strefy dostawy: miejscowość → cena i minimalne zamówienie (pierwsze widać od razu, resztę po rozwinięciu). */
export function DeliveryCard({ dostawa }: { dostawa: Delivery }) {
  const INITIAL = 6;
  const row = (s: Delivery["strefy"][number]) => (
    <li key={s.nazwa} className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="font-bold">{s.nazwa}</span>
      <span className="shrink-0 text-right font-extrabold">
        {s.cenaGr === null ? "zapytaj" : s.cenaGr ? formatPln(s.cenaGr) : "gratis"}
        {s.minGr ? <span className="block text-xs font-bold text-tekst-2">min. {formatPln(s.minGr)}</span> : null}
      </span>
    </li>
  );
  return (
    <section aria-labelledby="dostawa" className={card}>
      <h2 id="dostawa" className="flex scroll-mt-28 items-center gap-2 text-lg font-black">
        <Truck className="size-5 text-akcent-tekst" aria-hidden /> Dostawa
      </h2>
      {dostawa.uwagi && <p className="mt-1 text-sm font-semibold text-tekst-2">{dostawa.uwagi}</p>}
      <ul className="mt-2 divide-y divide-obrys text-sm">{dostawa.strefy.slice(0, INITIAL).map(row)}</ul>
      {dostawa.strefy.length > INITIAL && (
        <details className="group text-sm">
          <summary className="cursor-pointer py-1.5 font-extrabold text-akcent-tekst group-open:hidden">
            Pokaż wszystkie ({dostawa.strefy.length})
          </summary>
          <ul className="divide-y divide-obrys border-t border-obrys">{dostawa.strefy.slice(INITIAL).map(row)}</ul>
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
          , sprawdzone {formatDatePl(dostawa.sprawdzono)}.
        </p>
      )}
    </section>
  );
}
