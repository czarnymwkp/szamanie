import Image from "next/image";
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
import { StopkaPropozycji, adresPropozycji, type PropsLokalu } from "./wspolne";

// 5 · Mapa + lista — strona lokalu z dużą mapą u góry i kartą lokalu nachodzącą na mapę.
export default function P05Lokal({ lokal, nr }: PropsLokalu) {
  const tydzien = parsujGodziny(lokal.godziny);
  const uslugi = uslugiLokalu(lokal);
  return (
    <div className="min-h-screen bg-tlo">
      <header className="flex h-14 items-center gap-4 border-b border-obrys bg-white px-4">
        <Link href={adresPropozycji(nr)} className="flex items-center gap-1.5 text-sm font-extrabold hover:text-akcent-tekst">
          <ArrowLeft className="size-4" aria-hidden /> Mapa lokali
        </Link>
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={111} height={24} className="ml-auto h-6 w-auto" />
      </header>

      <iframe title={`Mapa: ${lokal.nazwa}`} src={adresMapy(lokal, 2.5)} className="h-[45svh] w-full border-0" />

      <main id="tresc" className="relative mx-auto -mt-24 max-w-4xl px-4 pb-6">
        <article className="animate-wjazd overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <div className="flex gap-4 p-5 sm:p-6">
            <Miniatura lokal={lokal} className="size-24 shrink-0 rounded-2xl sm:size-32" sizes="128px" priorytet />
            <div className="min-w-0 flex-1">
              {lokal.promowany && <EtykietaPromo className="mb-1.5" />}
              <h1 className="text-2xl leading-tight font-black sm:text-4xl">{lokal.nazwa}</h1>
              <p className="text-sm font-bold text-tekst-2">{opisLokalu(lokal)}</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                <MapPin className="size-4 shrink-0 text-akcent-tekst" aria-hidden /> {pelnyAdres(lokal)}
              </p>
              <StatusOtwarcia godziny={lokal.godziny} className="mt-1 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-obrys">
            <PrzyciskProwadz lokal={lokal} className="flex h-14 items-center justify-center gap-2 font-black transition hover:bg-krem">
              <Navigation className="size-5 text-akcent-tekst" aria-hidden /> Prowadź
            </PrzyciskProwadz>
            {lokal.telefon ? (
              <a href={linkTelefonu(lokal.telefon)} className="flex h-14 items-center justify-center gap-2 border-l border-obrys font-black transition hover:bg-krem">
                <Phone className="size-5 text-akcent-tekst" aria-hidden /> Zadzwoń
              </a>
            ) : (
              <span className="flex h-14 items-center justify-center border-l border-obrys text-sm font-bold text-tekst-2">Brak telefonu</span>
            )}
          </div>
        </article>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <section aria-labelledby="godziny" className="pojawianie rounded-3xl bg-white p-6 shadow-sm">
            <h2 id="godziny" className="text-lg font-black">
              Godziny otwarcia
            </h2>
            <div className="mt-3">
              {tydzien ? <TabelaGodzin tydzien={tydzien} /> : <p className="font-semibold text-tekst-2">Brak informacji.</p>}
            </div>
          </section>
          <section aria-labelledby="info" className="pojawianie rounded-3xl bg-white p-6 shadow-sm">
            <h2 id="info" className="text-lg font-black">
              Informacje
            </h2>
            <ul className="mt-3 space-y-2">
              {kontaktyLokalu(lokal)
                .filter((kt) => kt.etykieta !== "Telefon")
                .map(({ etykieta, tekst, href, ikona: Ikona, zewnetrzny }) => (
                  <li key={etykieta}>
                    <a href={href} {...(zewnetrzny ? { target: "_blank", rel: "noopener" } : {})} className="flex items-center gap-2 font-bold hover:text-akcent-tekst">
                      <Ikona className="size-4 shrink-0 text-akcent-tekst" aria-hidden />
                      <span className="truncate">{etykieta === "E-mail" ? tekst : etykieta}</span>
                    </a>
                  </li>
                ))}
              {uslugi.map(({ ikona: Ikona, nazwa }) => (
                <li key={nazwa} className="flex items-center gap-2 font-bold text-tekst-2">
                  <Ikona className="size-4 shrink-0" aria-hidden /> {nazwa}
                </li>
              ))}
            </ul>
            <Link href="/dla-lokali" className="mt-5 inline-block text-sm font-black text-akcent-tekst hover:underline">
              To Twój lokal? Dodaj menu i zdjęcia →
            </Link>
          </section>
        </div>
      </main>
      <StopkaPropozycji />
    </div>
  );
}
