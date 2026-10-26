import Link from "next/link";
import { ArrowLeft, ChevronRight, MapPin, Navigation } from "lucide-react";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { adresMapy, kontaktyLokalu, uslugiLokalu } from "../szablony/wspolne";
import { parsujGodziny } from "@/lib/godziny";
import { opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { StopkaPropozycji, adresPropozycji, type PropsLokalu } from "./wspolne";

const wiersz = "flex items-center gap-3 py-4 font-extrabold transition hover:text-akcent-tekst";

// 9 · Minimal — strona lokalu jak lista ustawień: same konkrety.
export default function P09Lokal({ lokal, nr }: PropsLokalu) {
  const tydzien = parsujGodziny(lokal.godziny);
  const uslugi = uslugiLokalu(lokal);
  return (
    <div className="min-h-screen bg-white">
      <main id="tresc" className="mx-auto max-w-2xl px-5 pt-8">
        <Link href={adresPropozycji(nr)} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-tekst-2 hover:text-tekst">
          <ArrowLeft className="size-4" aria-hidden /> Wszystkie lokale
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <Miniatura lokal={lokal} className="size-20 shrink-0 rounded-2xl" sizes="80px" priorytet dopisek={false} />
          <div className="min-w-0">
            <h1 className="animate-wjazd text-3xl font-black tracking-tight lg:text-4xl">{lokal.nazwa}</h1>
            <p className="text-sm font-semibold text-tekst-2">
              {opisLokalu(lokal)}
              {lokal.promowany && <span className="ml-2 font-black text-akcent-tekst">promowane</span>}
            </p>
            <StatusOtwarcia godziny={lokal.godziny} className="text-sm" />
          </div>
        </div>

        <ul className="mt-8 divide-y divide-obrys border-y border-obrys">
          <li>
            <PrzyciskProwadz lokal={lokal} className={wiersz}>
              <Navigation className="size-5 text-akcent-tekst" aria-hidden />
              <span className="flex-1">
                Prowadź do lokalu
                <span className="block text-sm font-semibold text-tekst-2">{pelnyAdres(lokal)}</span>
              </span>
              <ChevronRight className="size-5 text-tekst-2" aria-hidden />
            </PrzyciskProwadz>
          </li>
          {kontaktyLokalu(lokal).map(({ etykieta, tekst, href, ikona: Ikona, zewnetrzny }) => (
            <li key={etykieta}>
              <a href={href} {...(zewnetrzny ? { target: "_blank", rel: "noopener" } : {})} className={wiersz}>
                <Ikona className="size-5 text-akcent-tekst" aria-hidden />
                <span className="min-w-0 flex-1">
                  {etykieta === "Telefon" ? "Zadzwoń" : etykieta}
                  <span className="block truncate text-sm font-semibold text-tekst-2">{tekst}</span>
                </span>
                <ChevronRight className="size-5 text-tekst-2" aria-hidden />
              </a>
            </li>
          ))}
        </ul>

        <section aria-labelledby="godziny" className="mt-10">
          <h2 id="godziny" className="text-xs font-black tracking-wider text-tekst-2 uppercase">
            Godziny otwarcia
          </h2>
          <div className="mt-3">
            {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="font-semibold text-tekst-2">Brak informacji.</p>}
          </div>
        </section>

        {uslugi.length > 0 && (
          <section aria-labelledby="uslugi" className="mt-10">
            <h2 id="uslugi" className="text-xs font-black tracking-wider text-tekst-2 uppercase">
              Udogodnienia
            </h2>
            <p className="mt-3 font-semibold">{uslugi.map((u) => u.nazwa).join(" · ")}</p>
          </section>
        )}

        <section aria-labelledby="mapa" className="mt-10">
          <h2 id="mapa" className="flex items-center gap-1.5 text-xs font-black tracking-wider text-tekst-2 uppercase">
            <MapPin className="size-4" aria-hidden /> Na mapie
          </h2>
          <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal)} loading="lazy" className="mt-3 h-56 w-full rounded-2xl border-0" />
        </section>
        <Link href="/dla-lokali" className="mt-8 inline-block text-sm font-extrabold text-tekst-2 underline hover:text-tekst">
          To Twój lokal? Dodaj menu i zdjęcia
        </Link>
      </main>
      <StopkaPropozycji className="mt-6 [&>div]:max-w-2xl" />
    </div>
  );
}
