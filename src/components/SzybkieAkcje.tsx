import { Navigation, Phone, PhoneOff, Truck } from "lucide-react";
import type { Lokal } from "@/lib/lokale";
import { linkTelefonu } from "@/lib/nazwy";
import PrzyciskProwadz from "./PrzyciskProwadz";

/**
 * Dolny pasek karty lokalu w jednej linii: plakietka „Dowóz” z jadącym autkiem (rozciągnięta na wolne miejsce,
 * pomysł usera; dotknięcie przechodzi do karty — pointer-events-none), dojazd i telefon (zamówienie). Bez numeru
 * telefon jest wyszarzony, żeby było widać, że to brak danych, a nie błąd. `ciemne` — wersja na ciemne tło.
 */
export default function SzybkieAkcje({ lokal, ciemne = false }: { lokal: Lokal; ciemne?: boolean }) {
  const okragly = "flex size-10 items-center justify-center rounded-full transition hover:scale-110 active:scale-95";
  return (
    <div className="relative z-10 flex items-center justify-end gap-1.5">
      {lokal.dostawa && (
        <span
          title="Dowozi"
          role="img"
          aria-label="Dowozi"
          className="pointer-events-none flex h-10 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-akcent px-3 text-sm font-black text-na-akcencie"
        >
          <span aria-hidden className="dowoz-auto relative flex">
            <Truck className="size-[18px]" />
          </span>
          Dowóz
        </span>
      )}
      <div className="flex shrink-0 gap-1.5">
        <PrzyciskProwadz
          lokal={lokal}
          aria-label={`Prowadź do: ${lokal.nazwa}`}
          className={`${okragly} ${ciemne ? "bg-white text-tekst" : "bg-tekst text-white"}`}
        >
          <Navigation className="size-[18px]" aria-hidden />
        </PrzyciskProwadz>
        {lokal.telefon ? (
          <a
            href={linkTelefonu(lokal.telefon)}
            aria-label={`Zadzwoń: ${lokal.nazwa}`}
            className={`${okragly} bg-akcent text-tekst`}
          >
            <Phone className="size-[18px]" aria-hidden />
          </a>
        ) : (
          <span
            title="Brak numeru telefonu"
            aria-label="Brak numeru telefonu"
            role="img"
            className={`flex size-10 items-center justify-center rounded-full ${ciemne ? "bg-white/10 text-white/40" : "bg-obrys text-tekst-2/60"}`}
          >
            <PhoneOff className="size-[18px]" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}
