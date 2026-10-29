import Link from "next/link";
import { ViewTransition } from "react";
import { BadgePercent, MapPin } from "lucide-react";
import type { Lokal } from "@/lib/lokale";
import { opisLokalu, pelnyAdres } from "@/lib/nazwy";
import Baner from "./Baner";
import EtykietaPromo from "./EtykietaPromo";
import StatusOtwarcia from "./StatusOtwarcia";
import SzybkieAkcje from "./SzybkieAkcje";

export default function KartaLokalu({
  lokal,
  odleglosc,
  prefiks = "/lokal/",
}: {
  lokal: Lokal;
  odleglosc?: string;
  prefiks?: string; // początek adresu strony lokalu (propozycje wyglądu mają własne)
}) {
  return (
    <li className="group pojawianie relative flex flex-col overflow-hidden rounded-[1.15rem] bg-karta shadow-[0_1px_2px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_18px_36px_rgba(0,0,0,0.12)] has-[a:focus-visible]:ring-4 has-[a:focus-visible]:ring-akcent/50">
      {/* Baner „przechodzi” w nagłówek strony lokalu (View Transitions). */}
      <ViewTransition name={`baner-${lokal.slug}`} share="morph" default="none">
        <Baner lokal={lokal} rozmiar="karta" className="h-28">
          {lokal.promowany && <EtykietaPromo className="absolute top-3 left-3" />}
          {odleglosc && (
            <span className="absolute top-3 right-3 flex animate-wjazd items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold shadow-sm">
              <MapPin className="size-3.5" aria-hidden />
              {odleglosc}
            </span>
          )}
        </Baner>
      </ViewTransition>

      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3.5">
        <div className="min-w-0">
          <h3 className="truncate text-lg leading-tight font-black">
            {/* after:absolute rozciąga link na całą kartę */}
            <Link
              href={`${prefiks}${lokal.slug}`}
              prefetch
              className="outline-none after:absolute after:inset-0 after:rounded-[1.15rem]"
            >
              {lokal.nazwa}
            </Link>
          </h3>
          <p className="truncate text-sm font-bold text-tekst-2">{opisLokalu(lokal)}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-tekst-2">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{pelnyAdres(lokal)}</span>
          </p>
          <StatusOtwarcia godziny={lokal.godziny} className="mt-1 text-sm" />
          {lokal.promocja && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-extrabold text-akcent-tekst">
              <BadgePercent className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{lokal.promocja}</span>
            </p>
          )}
        </div>

        {/* dowóz, dojazd i telefon w jednej linii na dole karty */}
        <div className="mt-auto pt-3">
          <SzybkieAkcje lokal={lokal} />
        </div>
      </div>
    </li>
  );
}
