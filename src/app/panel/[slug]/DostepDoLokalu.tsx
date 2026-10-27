import { ShieldCheck } from "lucide-react";
import { karta, przyciskMaly } from "@/components/panel/style";
import { db } from "@/lib/db";
import type { LokalPanelu } from "@/lib/panel/konta";
import { dodajOsobe, nowyLinkDoPanelu, odbierzDostep } from "../admin/akcje";
import LinkDoPanelu from "../LinkDoPanelu";
import DodajOsobe from "./DodajOsobe";

/** Tylko dla admina: kto ma dostęp do panelu lokalu, linki do panelu i nowa osoba bez zgłoszenia. */
export default function DostepDoLokalu({ lokal }: { lokal: LokalPanelu }) {
  const osoby = (
    db
      .prepare(
        `SELECT k.id, k.email, k.imie, k.telefon, k.link IS NOT NULL AS ma_link FROM lokale_konta lk
         JOIN konta k ON k.id = lk.konto_id WHERE lk.lokal_id = ? ORDER BY lk.utworzono`,
      )
      .all(lokal.id) as { id: number; email: string | null; imie: string | null; telefon: string | null; ma_link: number }[]
  ).map((o) => ({ ...o }));

  return (
    <section className={`${karta} mt-8 space-y-4 ring-2 ring-tekst/80`}>
      <div>
        <h2 className="flex items-center gap-2 text-lg font-black">
          <ShieldCheck className="size-5 text-akcent-tekst" aria-hidden /> Dostęp do panelu
        </h2>
        <p className="text-sm text-tekst-2">Widzisz to tylko Ty (admin). Właściciel wchodzi do panelu linkiem od Ciebie.</p>
      </div>
      {osoby.length > 0 && (
        <ul className="divide-y divide-obrys">
          {osoby.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-2 py-3">
              <span className="min-w-0 flex-1 basis-48 text-sm">
                <b>{o.imie ?? o.email ?? `konto ${o.id}`}</b>
                <span className="block truncate text-tekst-2">{[o.telefon, o.email].filter(Boolean).join(" · ")}</span>
              </span>
              <LinkDoPanelu
                utworz={nowyLinkDoPanelu.bind(null, o.id)}
                telefon={o.telefon}
                nazwa={lokal.nazwa}
                maLink={!!o.ma_link}
              />
              <form action={odbierzDostep}>
                <input type="hidden" name="lokal" value={lokal.id} />
                <input type="hidden" name="konto" value={o.id} />
                <button className={`${przyciskMaly} bg-krem`}>Odbierz dostęp</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <DodajOsobe dodaj={dodajOsobe.bind(null, lokal.slug)} nazwa={lokal.nazwa} />
    </section>
  );
}
