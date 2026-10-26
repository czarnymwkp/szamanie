import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Navigation } from "lucide-react";
import EtykietaPromo from "../EtykietaPromo";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { adresMapy, kontaktyLokalu, uslugiLokalu } from "../szablony/wspolne";
import { parsujGodziny } from "@/lib/godziny";
import { opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { serif } from "./fonty";
import { StopkaPropozycji, adresPropozycji, type PropsLokalu } from "./wspolne";

// 2 · Krem i typografia — strona lokalu jak artykuł w magazynie.
export default function P02Lokal({ lokal, nr }: PropsLokalu) {
  const tydzien = parsujGodziny(lokal.godziny);
  const uslugi = uslugiLokalu(lokal);
  return (
    <div className="min-h-screen bg-krem">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href={adresPropozycji(nr)} className="flex items-center gap-1.5 text-sm font-extrabold underline decoration-2 underline-offset-4">
          <ArrowLeft className="size-4" aria-hidden /> Wszystkie lokale
        </Link>
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={111} height={24} className="h-6 w-auto" />
      </header>

      <main id="tresc" className="mx-auto max-w-6xl px-5 pb-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-end">
          <div className="lg:pb-4">
            <p className="animate-wjazd text-xs font-black tracking-[0.25em] text-tekst-2 uppercase">{opisLokalu(lokal)}</p>
            <h1 className={`${serif.className} mt-3 animate-wjazd text-6xl leading-[0.95] [animation-delay:80ms] lg:text-8xl`}>
              {lokal.nazwa}
            </h1>
            <div className="mt-5 flex animate-wjazd flex-wrap items-center gap-3 [animation-delay:160ms]">
              {lokal.promowany && <EtykietaPromo />}
              <StatusOtwarcia godziny={lokal.godziny} className="text-lg" />
            </div>
            <PrzyciskProwadz
              lokal={lokal}
              className="mt-6 inline-flex h-12 animate-wjazd items-center gap-2 rounded-full bg-tekst px-6 font-black text-white transition hover:-translate-y-0.5 [animation-delay:220ms]"
            >
              <Navigation className="size-5" aria-hidden /> Prowadź do lokalu
            </PrzyciskProwadz>
          </div>
          <Miniatura
            lokal={lokal}
            className="aspect-[4/3] w-full animate-wjazd rounded-[2rem] [animation-delay:120ms]"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priorytet
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 border-t-2 border-tekst pt-8 lg:grid-cols-3">
          <section aria-labelledby="kontakt" className="pojawianie">
            <h2 id="kontakt" className={`${serif.className} text-3xl`}>
              Kontakt
            </h2>
            <dl className="mt-4 divide-y divide-tekst/15">
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="font-bold text-tekst-2">Adres</dt>
                <dd className="text-right font-extrabold">{pelnyAdres(lokal)}</dd>
              </div>
              {kontaktyLokalu(lokal).map((kt) => (
                <div key={kt.etykieta} className="flex justify-between gap-4 py-2.5">
                  <dt className="font-bold text-tekst-2">{kt.etykieta}</dt>
                  <dd className="min-w-0 truncate text-right font-extrabold">
                    <a href={kt.href} {...(kt.zewnetrzny ? { target: "_blank", rel: "noopener" } : {})} className="underline decoration-akcent decoration-2 underline-offset-4">
                      {kt.tekst}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="godziny" className="pojawianie">
            <h2 id="godziny" className={`${serif.className} text-3xl`}>
              Godziny
            </h2>
            <div className="mt-4">
              {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="font-semibold text-tekst-2">Brak informacji.</p>}
            </div>
          </section>
          <section aria-labelledby="miejsce" className="pojawianie">
            <h2 id="miejsce" className={`${serif.className} text-3xl`}>
              Na miejscu
            </h2>
            {uslugi.length ? (
              <ul className="mt-4 space-y-2 font-extrabold">
                {uslugi.map(({ ikona: Ikona, nazwa }) => (
                  <li key={nazwa} className="flex items-center gap-2">
                    <Ikona className="size-5 text-akcent-tekst" aria-hidden /> {nazwa}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 font-semibold text-tekst-2">Lokal nie podał jeszcze udogodnień.</p>
            )}
            <Link href="/dla-lokali" className="mt-6 inline-block text-sm font-extrabold underline decoration-akcent decoration-2 underline-offset-4">
              To Twój lokal? Dodaj menu i zdjęcia →
            </Link>
          </section>
        </div>

        <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="pojawianie mt-12 h-72 w-full rounded-[2rem] border-0 lg:h-96" />
      </main>
      <StopkaPropozycji />
    </div>
  );
}
