import Link from "next/link";
import { ArrowLeft, Navigation, Phone } from "lucide-react";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { adresMapy, kontaktyLokalu, uslugiLokalu } from "../szablony/wspolne";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { brutal } from "./fonty";
import { ramka, ramkaHover } from "./p08styl";
import { StopkaPropozycji, adresPropozycji, type PropsLokalu } from "./wspolne";

const blok = `${ramka} pojawianie bg-white p-5`;

// 8 · Neo-brutalizm — strona lokalu z ramek i naklejek.
export default function P08Lokal({ lokal, nr }: PropsLokalu) {
  const tydzien = parsujGodziny(lokal.godziny);
  const uslugi = uslugiLokalu(lokal);
  return (
    <div className="min-h-screen bg-krem">
      <header className="border-b-[3px] border-tekst bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Link href={adresPropozycji(nr)} className={`${brutal.className} ${ramka} ${ramkaHover} flex items-center gap-2 bg-white px-3 py-1.5 text-sm uppercase`}>
            <ArrowLeft className="size-4" aria-hidden /> Wszystkie
          </Link>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="relative">
            <Miniatura lokal={lokal} className={`${ramka} aspect-[4/3] w-full`} sizes="(min-width: 1024px) 55vw, 100vw" priorytet />
            {lokal.promowany && (
              <span className={`${brutal.className} ${ramka} absolute -top-4 -left-3 -rotate-6 bg-akcent px-3 py-1 uppercase`}>Promowane</span>
            )}
          </div>
          <div>
            <p className={`${ramka} inline-block bg-white px-2 py-0.5 text-sm font-black uppercase`}>{opisLokalu(lokal)}</p>
            <h1 className={`${brutal.className} mt-4 animate-wjazd bg-tekst px-4 py-3 text-4xl leading-none text-white uppercase lg:text-6xl`}>
              {lokal.nazwa}
            </h1>
            <div className={`${ramka} mt-4 inline-block bg-white px-3 py-1.5`}>
              <StatusOtwarcia godziny={lokal.godziny} />
            </div>
            <p className="mt-4 text-lg font-extrabold">{pelnyAdres(lokal)}</p>
            <div className="mt-5 flex flex-wrap gap-4">
              {lokal.telefon && (
                <a href={linkTelefonu(lokal.telefon)} className={`${brutal.className} ${ramka} ${ramkaHover} flex items-center gap-2 bg-akcent px-5 py-3 uppercase`}>
                  <Phone className="size-5" aria-hidden /> Zadzwoń
                </a>
              )}
              <PrzyciskProwadz lokal={lokal} className={`${brutal.className} ${ramka} ${ramkaHover} flex items-center gap-2 bg-white px-5 py-3 uppercase`}>
                <Navigation className="size-5" aria-hidden /> Prowadź
              </PrzyciskProwadz>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section aria-labelledby="godziny" className={blok}>
            <h2 id="godziny" className={`${brutal.className} text-xl uppercase`}>
              Godziny
            </h2>
            <div className="mt-3 font-bold">
              {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p>Brak informacji.</p>}
            </div>
          </section>
          <section aria-labelledby="linki" className={blok}>
            <h2 id="linki" className={`${brutal.className} text-xl uppercase`}>
              Linki
            </h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {kontaktyLokalu(lokal)
                .filter((kt) => kt.etykieta !== "Telefon")
                .map(({ etykieta, href, ikona: Ikona, zewnetrzny }) => (
                  <li key={etykieta}>
                    <a href={href} {...(zewnetrzny ? { target: "_blank", rel: "noopener" } : {})} className={`${ramka} ${ramkaHover} flex items-center gap-1.5 bg-krem px-3 py-1.5 text-sm font-black uppercase`}>
                      <Ikona className="size-4" aria-hidden /> {etykieta}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
          <section aria-labelledby="uslugi" className={blok}>
            <h2 id="uslugi" className={`${brutal.className} text-xl uppercase`}>
              Na miejscu
            </h2>
            {uslugi.length ? (
              <ul className="mt-3 space-y-1.5 font-black">
                {uslugi.map(({ ikona: Ikona, nazwa }) => (
                  <li key={nazwa} className="flex items-center gap-2">
                    <Ikona className="size-5" aria-hidden /> {nazwa}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 font-bold text-tekst-2">Brak informacji.</p>
            )}
          </section>
        </div>
        <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className={`${ramka} pojawianie mt-8 h-72 w-full`} />
        <Link href="/dla-lokali" className={`${brutal.className} ${ramka} ${ramkaHover} mt-8 inline-block bg-tekst px-5 py-3 text-white uppercase`}>
          To Twój lokal? Dodaj menu →
        </Link>
      </main>
      <StopkaPropozycji />
    </div>
  );
}
