import Link from "next/link";
import { ArrowLeft, Clock, Navigation, Phone } from "lucide-react";
import EtykietaPromo from "../EtykietaPromo";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { adresMapy, kontaktyLokalu, uslugiLokalu } from "../szablony/wspolne";
import { parsujGodziny } from "@/lib/godziny";
import type { Lokal } from "@/lib/lokale";
import { inicjaly, motywLokalu } from "@/lib/motyw";
import { linkTelefonu, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { StopkaPropozycji, adresPropozycji, type PropsLokalu } from "./wspolne";

// 6 · Karuzele — strona lokalu jak w Wolcie: duże zdjęcie, karta na środku, zakładki, pasek akcji na dole telefonu.
export default function P06Lokal({ lokal, nr }: PropsLokalu) {
  const tydzien = parsujGodziny(lokal.godziny);
  const uslugi = uslugiLokalu(lokal);
  const { kolor } = motywLokalu(lokal);
  return (
    <div className="min-h-screen bg-tlo pb-24 lg:pb-0">
      <div className="relative">
        <Miniatura lokal={lokal} className="h-60 rounded-b-[2.5rem] lg:h-96" sizes="100vw" priorytet />
        <Link href={adresPropozycji(nr)} aria-label="Wszystkie lokale" className="absolute top-4 left-4 flex size-11 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
      </div>

      <main id="tresc" className="relative mx-auto -mt-16 max-w-3xl px-4">
        <article className="animate-wjazd rounded-[2rem] bg-white p-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          <span aria-hidden className="mx-auto -mt-14 flex size-20 items-center justify-center rounded-full border-4 border-white bg-white text-2xl font-black shadow-md" style={{ color: kolor }}>
            {inicjaly(lokal.nazwa)}
          </span>
          {lokal.promowany && <EtykietaPromo className="mt-3" />}
          <h1 className="mt-3 text-3xl font-black lg:text-4xl">{lokal.nazwa}</h1>
          <p className="mt-1 font-bold text-tekst-2">{opisLokalu(lokal)}</p>
          <p className="text-sm font-semibold text-tekst-2">{pelnyAdres(lokal)}</p>
          <div className="mt-3 flex justify-center">
            <StatusOtwarcia godziny={lokal.godziny} />
          </div>
          <div className="mt-5 hidden justify-center gap-3 lg:flex">
            <Akcje lokal={lokal} />
          </div>
        </article>

        <div role="tablist" aria-label="Sekcje" className="mt-6 flex gap-2">
          <button type="button" role="tab" aria-selected="true" className="rounded-full bg-tekst px-5 py-2 text-sm font-black text-white">
            Informacje
          </button>
          <button type="button" role="tab" aria-selected="false" disabled className="rounded-full bg-white px-5 py-2 text-sm font-black text-tekst-2">
            Menu · wkrótce
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <section aria-labelledby="godziny" className="pojawianie rounded-3xl bg-white p-6">
            <h2 id="godziny" className="flex items-center gap-2 text-lg font-black">
              <Clock className="size-5 text-akcent-tekst" aria-hidden /> Godziny
            </h2>
            <div className="mt-3">
              {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="font-semibold text-tekst-2">Brak informacji.</p>}
            </div>
          </section>
          <section aria-labelledby="kontakt" className="pojawianie rounded-3xl bg-white p-6">
            <h2 id="kontakt" className="text-lg font-black">
              Kontakt i udogodnienia
            </h2>
            <ul className="mt-3 space-y-2">
              {kontaktyLokalu(lokal).map(({ etykieta, tekst, href, ikona: Ikona, zewnetrzny }) => (
                <li key={etykieta}>
                  <a href={href} {...(zewnetrzny ? { target: "_blank", rel: "noopener" } : {})} className="flex items-center gap-2 font-bold hover:text-akcent-tekst">
                    <Ikona className="size-4 shrink-0 text-akcent-tekst" aria-hidden />
                    <span className="truncate">{etykieta === "Telefon" || etykieta === "E-mail" ? tekst : etykieta}</span>
                  </a>
                </li>
              ))}
            </ul>
            {uslugi.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {uslugi.map(({ ikona: Ikona, nazwa }) => (
                  <li key={nazwa} className="flex items-center gap-1.5 rounded-full bg-tlo px-3 py-1 text-sm font-bold">
                    <Ikona className="size-4" aria-hidden /> {nazwa}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="pojawianie mt-4 h-64 w-full rounded-3xl border-0" />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.1)] backdrop-blur lg:hidden">
        <Akcje lokal={lokal} />
      </div>
      <StopkaPropozycji className="mt-10" />
    </div>
  );
}

function Akcje({ lokal }: { lokal: Lokal }) {
  const przycisk = "flex h-12 items-center justify-center gap-2 rounded-2xl px-6 font-black transition hover:brightness-95";
  return (
    <>
      {lokal.telefon ? (
        <a href={linkTelefonu(lokal.telefon)} className={`${przycisk} bg-akcent`}>
          <Phone className="size-5" aria-hidden /> Zadzwoń
        </a>
      ) : (
        <span className={`${przycisk} bg-obrys text-sm text-tekst-2`}>Brak telefonu</span>
      )}
      <PrzyciskProwadz lokal={lokal} className={`${przycisk} bg-tekst text-white`}>
        <Navigation className="size-5" aria-hidden /> Prowadź
      </PrzyciskProwadz>
    </>
  );
}
