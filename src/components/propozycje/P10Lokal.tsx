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
import { PowlokaAplikacji, PrzyciskSerca } from "./P10Wspolne";
import { adresPropozycji, type PropsLokalu } from "./wspolne";

const karta = "pojawianie rounded-3xl bg-white p-5 shadow-sm";

// 10 · Aplikacja — strona lokalu jak ekran w aplikacji: pasek z powrotem i serduszkiem, przyciski akcji na dole.
export default function P10Lokal({ lokal, nr }: PropsLokalu) {
  const tydzien = parsujGodziny(lokal.godziny);
  const uslugi = uslugiLokalu(lokal);
  return (
    <PowlokaAplikacji nr={nr}>
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-tlo/90 px-4 py-3 backdrop-blur">
        <Link href={adresPropozycji(nr)} aria-label="Wróć" className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <p className="min-w-0 flex-1 truncate font-black">{lokal.nazwa}</p>
        <PrzyciskSerca slug={lokal.slug} nazwa={lokal.nazwa} />
      </div>

      <main id="tresc" className="mx-auto max-w-3xl px-4 pb-32 lg:pb-10">
        <Miniatura lokal={lokal} className="h-56 animate-wjazd rounded-3xl lg:h-80" sizes="(min-width: 1024px) 768px, 100vw" priorytet />
        <div className="mt-4 px-1">
          {lokal.promowany && <EtykietaPromo className="mb-2" />}
          <h1 className="text-3xl font-black">{lokal.nazwa}</h1>
          <p className="font-bold text-tekst-2">{opisLokalu(lokal)}</p>
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
            <MapPin className="size-4 text-akcent-tekst" aria-hidden /> {pelnyAdres(lokal)}
          </p>
          <StatusOtwarcia godziny={lokal.godziny} className="mt-1" />
        </div>

        <div className="mt-5 space-y-3">
          <section aria-labelledby="godziny" className={karta}>
            <h2 id="godziny" className="font-black">
              Godziny otwarcia
            </h2>
            <div className="mt-2">
              {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="text-sm font-semibold text-tekst-2">Brak informacji.</p>}
            </div>
          </section>
          <section aria-labelledby="kontakt" className={karta}>
            <h2 id="kontakt" className="font-black">
              Kontakt
            </h2>
            <ul className="mt-2 divide-y divide-obrys">
              {kontaktyLokalu(lokal).map(({ etykieta, tekst, href, ikona: Ikona, zewnetrzny }) => (
                <li key={etykieta}>
                  <a href={href} {...(zewnetrzny ? { target: "_blank", rel: "noopener" } : {})} className="flex items-center gap-3 py-2.5 text-sm font-bold">
                    <Ikona className="size-4 shrink-0 text-akcent-tekst" aria-hidden />
                    <span className="w-20 shrink-0 text-tekst-2">{etykieta}</span>
                    <span className="truncate">{tekst}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
          {uslugi.length > 0 && (
            <section aria-labelledby="uslugi" className={karta}>
              <h2 id="uslugi" className="font-black">
                Udogodnienia
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {uslugi.map(({ ikona: Ikona, nazwa }) => (
                  <li key={nazwa} className="flex items-center gap-1.5 rounded-full bg-tlo px-3 py-1 text-sm font-bold">
                    <Ikona className="size-4" aria-hidden /> {nazwa}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="pojawianie h-56 w-full rounded-3xl border-0" />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-[4.25rem] z-40 grid grid-cols-2 gap-2 px-4 pb-2 lg:sticky lg:bottom-4 lg:mx-auto lg:max-w-3xl">
        {lokal.telefon ? (
          <a href={linkTelefonu(lokal.telefon)} className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-akcent font-black shadow-lg">
            <Phone className="size-5" aria-hidden /> Zadzwoń
          </a>
        ) : (
          <span className="flex h-13 items-center justify-center rounded-2xl bg-white text-sm font-bold text-tekst-2 shadow-lg">Brak telefonu</span>
        )}
        <PrzyciskProwadz lokal={lokal} className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-tekst font-black text-white shadow-lg">
          <Navigation className="size-5" aria-hidden /> Prowadź
        </PrzyciskProwadz>
      </div>
    </PowlokaAplikacji>
  );
}
