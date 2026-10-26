import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Navigation, Phone, PhoneOff } from "lucide-react";
import EtykietaPromo from "../EtykietaPromo";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { adresMapy, kontaktyLokalu, uslugiLokalu } from "../szablony/wspolne";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { StopkaPropozycji, adresPropozycji, type PropsLokalu } from "./wspolne";

const kafel = "pojawianie relative overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-sm";

// 4 · Bento — strona lokalu z kafelków.
export default function P04Lokal({ lokal, nr }: PropsLokalu) {
  const tydzien = parsujGodziny(lokal.godziny);
  const uslugi = uslugiLokalu(lokal);
  const kontakty = kontaktyLokalu(lokal).filter((kt) => kt.etykieta !== "Telefon");
  return (
    <div className="min-h-screen bg-tlo">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href={adresPropozycji(nr)} className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-extrabold shadow-sm">
          <ArrowLeft className="size-4" aria-hidden /> Wszystkie lokale
        </Link>
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={111} height={24} className="h-6 w-auto" />
      </header>

      <main id="tresc" className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-5 md:grid-cols-2 lg:grid-cols-4">
        <Miniatura lokal={lokal} className="min-h-64 rounded-[1.75rem] md:col-span-2 lg:row-span-2" sizes="(min-width: 1024px) 50vw, 100vw" priorytet />

        <section className={`${kafel} flex flex-col justify-end bg-akcent md:col-span-2`}>
          {lokal.promowany && <EtykietaPromo className="mb-3 self-start" />}
          <p className="text-sm font-extrabold">{opisLokalu(lokal)}</p>
          <h1 className="mt-1 animate-wjazd text-4xl leading-tight font-black lg:text-5xl">{lokal.nazwa}</h1>
          <p className="mt-2 flex items-center gap-1.5 font-bold">
            <MapPin className="size-4" aria-hidden /> {pelnyAdres(lokal)}
          </p>
        </section>

        {lokal.telefon ? (
          <a href={linkTelefonu(lokal.telefon)} className={`${kafel} flex flex-col justify-between gap-4 bg-tekst text-white transition hover:-translate-y-1`}>
            <Phone className="size-8 text-akcent" aria-hidden />
            <span>
              <span className="block text-xl font-black">Zadzwoń i zamów</span>
              <span className="text-sm font-bold text-white/70">{lokal.telefon}</span>
            </span>
          </a>
        ) : (
          <div className={`${kafel} flex flex-col justify-between gap-4 text-tekst-2`}>
            <PhoneOff className="size-8" aria-hidden />
            <span className="font-bold">Brak numeru telefonu</span>
          </div>
        )}
        <PrzyciskProwadz lokal={lokal} className={`${kafel} flex flex-col justify-between gap-4 bg-krem transition hover:-translate-y-1`}>
          <Navigation className="size-8 text-akcent-tekst" aria-hidden />
          <span className="text-xl font-black">Prowadź do lokalu</span>
        </PrzyciskProwadz>

        <section aria-labelledby="godziny" className={`${kafel} md:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="godziny" className="text-lg font-black">
              Godziny otwarcia
            </h2>
            <StatusOtwarcia godziny={lokal.godziny} className="text-sm" />
          </div>
          <div className="mt-3">
            {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="font-semibold text-tekst-2">Brak informacji.</p>}
          </div>
        </section>

        <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="pojawianie h-72 w-full rounded-[1.75rem] border-0 md:col-span-2 lg:h-full lg:min-h-72" />

        <section aria-labelledby="kontakt" className={kafel}>
          <h2 id="kontakt" className="text-lg font-black">
            W sieci
          </h2>
          {kontakty.length ? (
            <ul className="mt-3 space-y-2">
              {kontakty.map(({ etykieta, href, ikona: Ikona, zewnetrzny }) => (
                <li key={etykieta}>
                  <a href={href} {...(zewnetrzny ? { target: "_blank", rel: "noopener" } : {})} className="flex items-center gap-2 font-extrabold hover:text-akcent-tekst">
                    <Ikona className="size-4" aria-hidden /> {etykieta}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-semibold text-tekst-2">Brak linków.</p>
          )}
        </section>

        <section aria-labelledby="uslugi" className={kafel}>
          <h2 id="uslugi" className="text-lg font-black">
            Udogodnienia
          </h2>
          {uslugi.length ? (
            <ul className="mt-3 space-y-1.5 text-sm font-extrabold">
              {uslugi.map(({ ikona: Ikona, nazwa }) => (
                <li key={nazwa} className="flex items-center gap-2">
                  <Ikona className="size-4 text-akcent-tekst" aria-hidden /> {nazwa}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-semibold text-tekst-2">Brak informacji.</p>
          )}
        </section>

        <Link href="/dla-lokali" className={`${kafel} flex items-center justify-between gap-3 bg-tekst text-white transition hover:-translate-y-1 md:col-span-2`}>
          <span>
            <span className="block text-lg font-black">To Twój lokal?</span>
            <span className="text-sm font-bold text-white/70">Dodaj menu z cenami, zdjęcia i wybierz wygląd strony.</span>
          </span>
          <ArrowRight className="size-6 shrink-0 text-akcent" aria-hidden />
        </Link>
      </main>
      <StopkaPropozycji className="mt-6" />
    </div>
  );
}
