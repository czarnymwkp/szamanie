import { ShieldCheck } from "lucide-react";
import { card, smallButton } from "@/components/panel/style";
import { db } from "@/lib/db";
import type { PanelVenue } from "@/lib/panel/accounts";
import { addPerson, newPanelLink, revokeAccess } from "../admin/actions";
import PanelLink from "../PanelLink";
import AddPerson from "./AddPerson";

/** Admin only: who has access to the venue panel, panel links and a new person without a claim. */
export default function VenueAccess({ lokal }: { lokal: PanelVenue }) {
  const people = (
    db
      .prepare(
        `SELECT k.id, k.email, k.imie, k.telefon, k.link IS NOT NULL AS ma_link FROM lokale_konta lk
         JOIN konta k ON k.id = lk.konto_id WHERE lk.lokal_id = ? ORDER BY lk.utworzono`,
      )
      .all(lokal.id) as { id: number; email: string | null; imie: string | null; telefon: string | null; ma_link: number }[]
  ).map((o) => ({ ...o }));

  return (
    <section className={`${card} mt-8 space-y-4 ring-2 ring-tekst/80`}>
      <div>
        <h2 className="flex items-center gap-2 text-lg font-black">
          <ShieldCheck className="size-5 text-akcent-tekst" aria-hidden /> Dostęp do panelu
        </h2>
        <p className="text-sm text-tekst-2">Widzisz to tylko Ty (admin). Właściciel wchodzi do panelu linkiem od Ciebie.</p>
      </div>
      {people.length > 0 && (
        <ul className="divide-y divide-obrys">
          {people.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-2 py-3">
              <span className="min-w-0 flex-1 basis-48 text-sm">
                <b>{o.imie ?? o.email ?? `konto ${o.id}`}</b>
                <span className="block truncate text-tekst-2">{[o.telefon, o.email].filter(Boolean).join(" · ")}</span>
              </span>
              <PanelLink
                utworz={newPanelLink.bind(null, o.id)}
                telefon={o.telefon}
                nazwa={lokal.nazwa}
                maLink={!!o.ma_link}
              />
              <form action={revokeAccess}>
                <input type="hidden" name="lokal" value={lokal.id} />
                <input type="hidden" name="konto" value={o.id} />
                <button className={`${smallButton} bg-krem`}>Odbierz dostęp</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <AddPerson dodaj={addPerson.bind(null, lokal.slug)} nazwa={lokal.nazwa} />
    </section>
  );
}
