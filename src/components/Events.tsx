import Link from "next/link";
import { BedDouble, ChevronRight, Phone, Users } from "lucide-react";
import type { Venue } from "@/lib/venues";
import { phoneUrl, fullAddress } from "@/lib/format";
import { EVENT_NAMES, type Events } from "@/lib/events";

/** Pojemność, noclegi i rodzaje przyjęć — wspólne dla karty sali i sekcji na stronie lokalu. */
export function EventDetails({ przyjecia: p }: { przyjecia: Events }) {
  return (
    <>
      {(p.doOsob || p.noclegi) && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-extrabold">
          {p.doOsob && (
            <li className="flex items-center gap-1.5">
              <Users className="size-5 text-akcent-tekst" aria-hidden />
              do {p.doOsob} osób
            </li>
          )}
          {p.noclegi && (
            <li className="flex items-center gap-1.5">
              <BedDouble className="size-5 text-akcent-tekst" aria-hidden />
              noclegi dla gości
            </li>
          )}
        </ul>
      )}
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Przyjęcia">
        {p.rodzaje.map((r) => (
          <li key={r} className="rounded-full bg-krem px-3 py-1 text-sm font-extrabold">
            {EVENT_NAMES[r]}
          </li>
        ))}
      </ul>
    </>
  );
}

export function HallCard({ lokal: l, przyjecia }: { lokal: Venue; przyjecia: Events }) {
  return (
    <li className="pojawianie rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-black">
            <Link href={`/lokal/${l.slug}`} className="hover:text-akcent-tekst">
              {l.nazwa}
            </Link>
          </h3>
          <p className="text-sm font-bold text-tekst-2">{fullAddress(l)}</p>
        </div>
        {l.telefon && (
          <a
            href={phoneUrl(l.telefon)}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-tekst px-4 text-sm font-black text-white transition active:scale-95"
          >
            <Phone className="size-4" aria-hidden />
            Zadzwoń
          </a>
        )}
      </div>
      <EventDetails przyjecia={przyjecia} />
      <Link
        href={`/lokal/${l.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-black text-akcent-tekst hover:underline"
      >
        Telefon, dojazd i więcej
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </li>
  );
}
