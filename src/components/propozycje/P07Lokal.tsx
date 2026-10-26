import Link from "next/link";
import { Navigation, Phone, X } from "lucide-react";
import EtykietaPromo from "../EtykietaPromo";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { adresMapy, kontaktyLokalu, uslugiLokalu } from "../szablony/wspolne";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { StopkaPropozycji, adresPropozycji, type PropsLokalu } from "./wspolne";

// 7 · Stories — strona lokalu jak relacja: zdjęcie na cały ekran z paskami postępu, szczegóły wysuwane od dołu.
export default function P07Lokal({ lokal, nr }: PropsLokalu) {
  const tydzien = parsujGodziny(lokal.godziny);
  const uslugi = uslugiLokalu(lokal);
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <div className="relative h-[72svh] lg:sticky lg:top-0 lg:h-screen">
        <Miniatura lokal={lokal} className="h-full" sizes="(min-width: 1024px) 50vw, 100vw" priorytet />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75" />
        <div className="absolute inset-x-4 top-4 flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/35">
              {i === 0 && <span className="block h-full origin-left animate-rozwin bg-white [animation-duration:5s]" />}
            </span>
          ))}
        </div>
        <Link href={adresPropozycji(nr)} aria-label="Zamknij" className="absolute top-8 right-4 flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur">
          <X className="size-5" aria-hidden />
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-6 pb-12 text-white lg:pb-10">
          {lokal.promowany && <EtykietaPromo className="mb-2 !bg-akcent !text-tekst" />}
          <h1 className="animate-wjazd text-4xl leading-tight font-black lg:text-6xl">{lokal.nazwa}</h1>
          <p className="mt-1 font-semibold text-white/85">{opisLokalu(lokal)}</p>
          <StatusOtwarcia godziny={lokal.godziny} ciemne className="mt-2" />
        </div>
      </div>

      <main id="tresc" className="relative -mt-8 rounded-t-[2rem] bg-white px-5 pt-6 lg:mt-0 lg:rounded-none lg:px-10 lg:pt-12">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-obrys-2 lg:hidden" aria-hidden />
        <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-0">
          {lokal.telefon ? (
            <a href={linkTelefonu(lokal.telefon)} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-akcent font-black transition hover:brightness-95">
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          ) : (
            <span className="flex h-14 items-center justify-center rounded-2xl bg-tlo text-sm font-bold text-tekst-2">Brak telefonu</span>
          )}
          <PrzyciskProwadz lokal={lokal} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-tekst font-black text-white transition hover:bg-tekst/90">
            <Navigation className="size-5" aria-hidden /> Prowadź
          </PrzyciskProwadz>
        </div>

        <p className="mt-6 font-bold">{pelnyAdres(lokal)}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {kontaktyLokalu(lokal)
            .filter((kt) => kt.etykieta !== "Telefon")
            .map(({ etykieta, href, ikona: Ikona, zewnetrzny }) => (
              <li key={etykieta}>
                <a href={href} {...(zewnetrzny ? { target: "_blank", rel: "noopener" } : {})} className="flex items-center gap-1.5 rounded-full bg-tlo px-3.5 py-2 text-sm font-extrabold transition hover:bg-krem">
                  <Ikona className="size-4" aria-hidden /> {etykieta}
                </a>
              </li>
            ))}
          {uslugi.map(({ ikona: Ikona, nazwa }) => (
            <li key={nazwa} className="flex items-center gap-1.5 rounded-full border border-obrys px-3.5 py-2 text-sm font-bold text-tekst-2">
              <Ikona className="size-4" aria-hidden /> {nazwa}
            </li>
          ))}
        </ul>

        <section aria-labelledby="godziny" className="pojawianie mt-8">
          <h2 id="godziny" className="text-lg font-black">
            Godziny otwarcia
          </h2>
          <div className="mt-3 max-w-sm">
            {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="font-semibold text-tekst-2">Brak informacji.</p>}
          </div>
        </section>
        <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="pojawianie mt-8 h-64 w-full rounded-3xl border-0" />
        <Link href="/dla-lokali" className="mt-6 inline-block text-sm font-black text-akcent-tekst hover:underline">
          To Twój lokal? Dodaj menu i zdjęcia →
        </Link>
        <StopkaPropozycji className="!px-0" />
      </main>
    </div>
  );
}
