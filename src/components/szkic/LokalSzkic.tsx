import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Globe, Mail, MapPin, Navigation, Phone, Star, Truck } from "lucide-react";
import EtykietaPromo from "@/components/EtykietaPromo";
import MapaOsm from "@/components/MapaOsm";
import Miniatura from "@/components/Miniatura";
import PrzyciskProwadz from "@/components/PrzyciskProwadz";
import StatusOtwarcia from "@/components/StatusOtwarcia";
import TabelaGodzin from "@/components/TabelaGodzin";
import MenuLokalu from "@/components/menu/MenuLokalu";
import { KartaDostawy, opisDostawy } from "@/components/szablony/Klasyczny";
import PromocjeLokalu from "@/components/szablony/PromocjeLokalu";
import { adresMapy, plakietkiLokalu, uslugiLokalu } from "@/components/szablony/wspolne";
import { parsujGodziny } from "@/lib/godziny";
import type { Lokal } from "@/lib/lokale";
import { pobierzDostawe, pobierzMenu } from "@/lib/menu";
import { linkFacebooka, linkInstagrama, linkTelefonu, linkWww, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { pobierzPromocje } from "@/lib/promocje";
import { chip, reka } from "./szkic";

const duzy =
  "m-reczna-ramka flex h-14 flex-1 items-center justify-center gap-2 border-[2.5px] border-tekst text-lg font-black shadow-[4px_4px_0_#1d1b19] active:translate-y-0.5 active:shadow-none";

/** Strona lokalu w wyglądzie „Szkicownik” — dla lokali bez własnego motywu (te mają Klasyczny w swoich barwach). */
export default async function LokalSzkic({ lokal, powrot = "/" }: { lokal: Lokal; powrot?: string }) {
  const [menu, dostawa, promocje] = await Promise.all([
    pobierzMenu(lokal.id),
    pobierzDostawe(lokal.id),
    pobierzPromocje(lokal.id),
  ]);
  const tydzien = parsujGodziny(lokal.godziny);
  const plakietki = plakietkiLokalu(lokal);
  const uslugi = uslugiLokalu(lokal, { bezPlakietek: true });

  return (
    <article className="mx-auto max-w-5xl px-5 pt-5 pb-4">
      <Link href={powrot} className={`${reka.className} inline-flex items-center gap-1 text-2xl`}>
        <ArrowLeft className="size-5" aria-hidden /> wszystkie lokale
      </Link>

      <div className="relative mt-4 flex items-start gap-4 sm:gap-8">
        <div className="m-tasma relative w-[46%] max-w-64 shrink-0 -rotate-3 bg-white p-2 pb-6 shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
          <Miniatura lokal={lokal} className="aspect-[4/5]" sizes="(min-width: 640px) 256px, 46vw" priorytet dopisek={false} />
          <span className={`${reka.className} absolute bottom-0.5 left-2 text-lg text-tekst-2`}>zdjęcie poglądowe</span>
        </div>
        <div className="min-w-0 flex-1 pt-2">
          {lokal.promowany && <EtykietaPromo className="mb-2" />}
          <h1 className="animate-wjazd text-[1.9rem] leading-[1.02] font-black tracking-tight sm:text-5xl">
            <span className="bg-[linear-gradient(transparent_55%,#ffd36e_55%,#ffd36e_90%,transparent_90%)] box-decoration-clone">
              {lokal.nazwa}
            </span>
          </h1>
          <p className="mt-2 text-sm font-bold text-tekst-2">{opisLokalu(lokal)}</p>
          <StatusOtwarcia godziny={lokal.godziny} className="mt-2 text-sm" />
          {(menu || lokal.dostawa) && (
            <p className="mt-3 flex flex-wrap gap-2 text-sm font-extrabold">
              {/* dowóz na samej górze — przy zamawianiu to pierwsze pytanie */}
              {(dostawa || lokal.dostawa) && (
                <a href={dostawa ? "#dostawa" : undefined} className="inline-flex -rotate-2 items-center gap-1.5 bg-akcent px-2.5 py-1 text-na-akcencie">
                  <Truck className="size-4" aria-hidden /> {dostawa ? opisDostawy(dostawa) : "Dowóz"}
                </a>
              )}
              {menu && (
                <a href="#menu" className="inline-flex rotate-1 items-center gap-1.5 bg-[#fff3a8] px-2.5 py-1">
                  <BookOpen className="size-4" aria-hidden /> Menu · {menu.liczba} {odmiana(menu.liczba, ["pozycja", "pozycje", "pozycji"])}
                </a>
              )}
            </p>
          )}
        </div>
      </div>

      {plakietki.length > 0 && (
        // zwierzęta, niepełnosprawni, wege — ważne przy wyborze lokalu
        <ul aria-label="Przyjazny dla" className="mt-5 flex flex-wrap gap-2">
          {plakietki.map(({ ikona: Ikona, nazwa }) => (
            <li key={nazwa} className="m-reczna-ramka inline-flex items-center gap-1.5 border-2 border-tekst bg-white px-3 py-1 text-sm font-extrabold">
              <Ikona className="size-4 text-otwarte" aria-hidden /> {nazwa}
            </li>
          ))}
        </ul>
      )}
      {lokal.opis && <p className="mt-4 max-w-prose leading-relaxed">{lokal.opis}</p>}

      <p className="mt-5 flex items-center gap-1.5 font-semibold">
        <MapPin className="size-4 shrink-0 text-akcent-tekst" aria-hidden /> {pelnyAdres(lokal)}
      </p>
      <div className="relative mt-10 flex gap-3">
        {lokal.telefon && (
          <a href={linkTelefonu(lokal.telefon)} className={`${duzy} bg-akcent text-na-akcencie`}>
            <Phone className="size-5" aria-hidden /> Zadzwoń
          </a>
        )}
        <PrzyciskProwadz lokal={lokal} className={`${duzy} bg-white`}>
          <Navigation className="size-5" aria-hidden /> Prowadź
        </PrzyciskProwadz>
        {lokal.telefon && (
          <span className={`${reka.className} pointer-events-none absolute -top-8 left-6 rotate-[-8deg] text-xl text-akcent-tekst`}>
            zamów tu! ↓
          </span>
        )}
      </div>

      <div className="-mx-5 mt-4 flex gap-2.5 overflow-x-auto px-5 pt-1 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {/* gwiazdki i opinie zostają w Google — zwykły link do Map, bez klucza i bez kopiowania danych */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lokal.nazwa}, ${pelnyAdres(lokal)}`)}`}
          target="_blank"
          rel="noopener"
          className={chip(false)}
        >
          <Star className="size-4" aria-hidden /> Opinie w Google
        </a>
        {lokal.www && (
          <a href={linkWww(lokal.www)} target="_blank" rel="noopener" className={chip(false)}>
            <Globe className="size-4" aria-hidden /> Strona
          </a>
        )}
        {lokal.menuUrl && !menu && (
          <a href={linkWww(lokal.menuUrl)} target="_blank" rel="noopener" className={chip(false)}>
            <BookOpen className="size-4" aria-hidden /> Menu
          </a>
        )}
        {lokal.facebook && (
          <a href={linkFacebooka(lokal.facebook)} target="_blank" rel="noopener" className={chip(false)}>
            <ExternalLink className="size-4" aria-hidden /> Facebook
          </a>
        )}
        {lokal.instagram && (
          <a href={linkInstagrama(lokal.instagram)} target="_blank" rel="noopener" className={chip(false)}>
            <ExternalLink className="size-4" aria-hidden /> Instagram
          </a>
        )}
        {lokal.email && (
          <a href={`mailto:${lokal.email}`} className={chip(false)}>
            <Mail className="size-4" aria-hidden /> E-mail
          </a>
        )}
      </div>

      {promocje.length > 0 && <PromocjeLokalu promocje={promocje} naglowek="" />}

      {menu ? (
        <div className="relative mt-10 rotate-[0.4deg] bg-white px-4 pt-1 pb-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
          <span aria-hidden className="m-tasma absolute inset-x-0 top-0" />
          <MenuLokalu menu={menu} dostawa={dostawa} slug={lokal.slug} nazwa={lokal.nazwa} telefon={lokal.telefon} numerowane />
        </div>
      ) : (
        <section aria-labelledby="menu-tytul" className="mt-10">
          <h2 id="menu-tytul" className={`${reka.className} text-3xl`}>
            Menu jeszcze nie mamy — zapytaj przez telefon!
          </h2>
          {lokal.menuUrl && (
            <a href={linkWww(lokal.menuUrl)} target="_blank" rel="noopener" className={`${chip(false)} mt-3 inline-flex w-fit`}>
              <BookOpen className="size-4" aria-hidden /> Menu na stronie lokalu
            </a>
          )}
        </section>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <section aria-labelledby="godziny" className="rotate-[-1.2deg] bg-[#fff3a8] p-4 shadow-[2px_8px_16px_rgba(0,0,0,0.12)]">
          <h2 id="godziny" className={`${reka.className} text-3xl`}>
            Godziny
          </h2>
          {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="text-sm">{lokal.godziny ?? "Brak informacji."}</p>}
        </section>
        <section aria-label="Mapa" className="m-tasma relative rotate-[1deg] bg-white p-2 pb-8 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
          <MapaOsm title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} className="h-56 w-full border-0 bg-white" />
          <span className={`${reka.className} absolute bottom-1 left-3 text-xl`}>tu jesteśmy ✗</span>
        </section>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {dostawa && <KartaDostawy dostawa={dostawa} />}
        {uslugi.length > 0 && (
          <section aria-labelledby="uslugi" className="rotate-[0.6deg] bg-white p-5 shadow-[0_6px_16px_rgba(0,0,0,0.1)]">
            <h2 id="uslugi" className={`${reka.className} text-3xl`}>
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
        <section className="m-reczna-ramka border-[2.5px] border-tekst bg-tekst p-5 text-tlo sm:col-span-2">
          <h2 className={`${reka.className} text-3xl`}>To Twój lokal?</h2>
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
      </div>
    </article>
  );
}
