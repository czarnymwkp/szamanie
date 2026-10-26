import Link from "next/link";
import { ArrowLeft, MapPin, Navigation, Phone } from "lucide-react";
import EtykietaPromo from "../EtykietaPromo";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { adresMapy, kontaktyLokalu, uslugiLokalu } from "../szablony/wspolne";
import { parsujGodziny } from "@/lib/godziny";
import { linkTelefonu, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { grotesk } from "./fonty";
import { StopkaPropozycji, adresPropozycji, type PropsLokalu } from "./wspolne";

const karta = "pojawianie rounded-3xl border border-white/5 bg-[#161616] p-6";

// 3 · Tryb nocny — zdjęcie na całą szerokość, nazwa na zdjęciu, ciemne karty.
export default function P03Lokal({ lokal, nr }: PropsLokalu) {
  const tydzien = parsujGodziny(lokal.godziny);
  const uslugi = uslugiLokalu(lokal);
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <div className="relative">
        <Miniatura lokal={lokal} className="h-[55svh] min-h-80" sizes="100vw" priorytet />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/40 to-black/30" />
        <Link
          href={adresPropozycji(nr)}
          className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/50 px-4 py-2 text-sm font-bold backdrop-blur transition hover:bg-black/70"
        >
          <ArrowLeft className="size-4" aria-hidden /> Wszystkie lokale
        </Link>
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-5 pb-8">
            {lokal.promowany && <EtykietaPromo className="mb-3 !bg-akcent !text-tekst" />}
            <p className="animate-wjazd text-sm font-bold text-white/70">{opisLokalu(lokal)}</p>
            <h1 className={`${grotesk.className} mt-1 animate-wjazd text-5xl font-bold tracking-tight [animation-delay:80ms] lg:text-7xl`}>
              {lokal.nazwa}
            </h1>
            <StatusOtwarcia godziny={lokal.godziny} ciemne className="mt-3 animate-wjazd text-lg [animation-delay:140ms]" />
          </div>
        </div>
      </div>

      <main id="tresc" className="mx-auto max-w-6xl px-5">
        <div className="flex animate-wjazd flex-wrap gap-3 [animation-delay:200ms]">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className="inline-flex h-13 items-center gap-2 rounded-2xl bg-akcent px-6 font-bold text-tekst transition hover:brightness-110">
              <Phone className="size-5" aria-hidden /> Zadzwoń i zamów
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className="inline-flex h-13 items-center gap-2 rounded-2xl bg-white px-6 font-bold text-tekst transition hover:bg-white/90">
            <Navigation className="size-5" aria-hidden /> Prowadź
          </PrzyciskProwadz>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section aria-labelledby="kontakt" className={karta}>
            <h2 id="kontakt" className={`${grotesk.className} text-xl font-bold`}>
              Kontakt
            </h2>
            <p className="mt-3 flex items-center gap-2 text-white/80">
              <MapPin className="size-4 shrink-0 text-akcent" aria-hidden /> {pelnyAdres(lokal)}
            </p>
            <ul className="mt-3 space-y-2">
              {kontaktyLokalu(lokal)
                .filter((kt) => kt.etykieta !== "Telefon")
                .map(({ etykieta, href, ikona: Ikona, zewnetrzny }) => (
                  <li key={etykieta}>
                    <a href={href} {...(zewnetrzny ? { target: "_blank", rel: "noopener" } : {})} className="flex items-center gap-2 font-bold text-akcent hover:underline">
                      <Ikona className="size-4" aria-hidden /> {etykieta}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
          <section aria-labelledby="godziny" className={karta}>
            <h2 id="godziny" className={`${grotesk.className} text-xl font-bold`}>
              Godziny otwarcia
            </h2>
            <div className="mt-3 text-white/90">
              {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="text-white/60">Brak informacji.</p>}
            </div>
          </section>
          <section aria-labelledby="uslugi" className={karta}>
            <h2 id="uslugi" className={`${grotesk.className} text-xl font-bold`}>
              Udogodnienia
            </h2>
            {uslugi.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {uslugi.map(({ ikona: Ikona, nazwa }) => (
                  <li key={nazwa} className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-sm font-bold">
                    <Ikona className="size-4 text-akcent" aria-hidden /> {nazwa}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-white/60">Lokal nie podał jeszcze udogodnień.</p>
            )}
            <Link href="/dla-lokali" className="mt-5 inline-block text-sm font-bold text-akcent hover:underline">
              To Twój lokal? Dodaj menu i zdjęcia →
            </Link>
          </section>
        </div>
        <iframe
          title={`Mapa: ${lokal.nazwa}`}
          src={adresMapy(lokal)}
          loading="lazy"
          className="pojawianie mt-4 h-72 w-full rounded-3xl border-0 opacity-90 [filter:invert(0.92)_hue-rotate(180deg)] lg:h-96"
        />
      </main>
      <StopkaPropozycji ciemna className="mt-10" />
    </div>
  );
}
