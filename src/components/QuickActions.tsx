import { Navigation, Phone, PhoneOff, Truck } from "lucide-react";
import type { Venue } from "@/lib/venues";
import { phoneUrl } from "@/lib/format";
import DirectionsButton from "./DirectionsButton";

/**
 * Bottom bar of a venue card in one line: a „Dowóz” badge with a driving car (stretched over the free space, the user's
 * idea; a tap goes to the card — pointer-events-none), directions and phone (ordering). Without a number the phone is
 * greyed out, so it reads as missing data, not an error. `ciemne` — the version for a dark background.
 */
export default function QuickActions({ lokal, ciemne = false }: { lokal: Venue; ciemne?: boolean }) {
  const round = "flex size-10 items-center justify-center rounded-full transition hover:scale-110 active:scale-95";
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
        <DirectionsButton
          lokal={lokal}
          aria-label={`Prowadź do: ${lokal.nazwa}`}
          className={`${round} ${ciemne ? "bg-white text-tekst" : "bg-tekst text-white"}`}
        >
          <Navigation className="size-[18px]" aria-hidden />
        </DirectionsButton>
        {lokal.telefon ? (
          <a
            href={phoneUrl(lokal.telefon)}
            aria-label={`Zadzwoń: ${lokal.nazwa}`}
            className={`${round} bg-akcent text-tekst`}
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
