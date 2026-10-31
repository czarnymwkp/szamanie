import type { Metadata } from "next";
import Link from "next/link";
import { Check, Phone, X } from "lucide-react";
import { card, framedCard, field, smallButton } from "@/components/panel/style";
import { db } from "@/lib/db";
import { getVenues } from "@/lib/venues";
import { phoneUrl } from "@/lib/format";
import { requireAdmin } from "@/lib/panel/accounts";
import VenueList from "../dodaj/VenueList";
import PanelLink from "../PanelLink";
import { newPanelLink, revokeAccess, reviewClaim } from "./actions";

export const metadata: Metadata = { title: "Administracja" };

type Claim = {
  id: number;
  imie: string;
  telefon: string;
  rola: string;
  wiadomosc: string | null;
  status: string;
  notatka: string | null;
  utworzono: string;
  email: string | null;
  slug: string;
  nazwa: string;
  adres: string | null;
};

const when = (sql: string) =>
  new Date(`${sql.replace(" ", "T")}Z`).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });

export default async function AdminPage() {
  await requireAdmin();
  const claims = (
    db
      .prepare(
        `SELECT z.id, z.imie, z.telefon, z.rola, z.wiadomosc, z.status, z.notatka, z.utworzono,
                coalesce(z.email, k.email) AS email, l.slug, l.nazwa, l.adres
         FROM zgloszenia z LEFT JOIN konta k ON k.id = z.konto_id JOIN lokale l ON l.id = z.lokal_id
         ORDER BY z.status = 'nowe' DESC, z.utworzono DESC LIMIT 100`,
      )
      .all() as Claim[]
  ).map((z) => ({ ...z }));
  // numer lokalu z poprawkami — na niego dzwonimy, nie na numer podany w zgłoszeniu
  const phones = new Map((await getVenues()).map((l) => [l.slug, l.telefon]));
  const accesses = (
    db
      .prepare(
        `SELECT k.id AS konto, k.email, k.imie, k.telefon, k.link IS NOT NULL AS ma_link, k.rola,
                l.id AS lokal, l.nazwa, l.slug
         FROM lokale_konta lk JOIN konta k ON k.id = lk.konto_id JOIN lokale l ON l.id = lk.lokal_id
         ORDER BY l.nazwa`,
      )
      .all() as {
      konto: number;
      email: string | null;
      imie: string | null;
      telefon: string | null;
      ma_link: number;
      rola: string;
      lokal: number;
      nazwa: string;
      slug: string;
    }[]
  ).map((d) => ({ ...d }));
  const all = (
    db.prepare("SELECT slug, nazwa, adres, miejscowosc FROM lokale ORDER BY nazwa COLLATE NOCASE").all() as {
      slug: string;
      nazwa: string;
      adres: string | null;
      miejscowosc: string | null;
    }[]
  ).map((l) => ({ ...l }));
  const newOnes = claims.filter((z) => z.status === "nowe");
  const old = claims.filter((z) => z.status !== "nowe");

  return (
    <div className="space-y-10">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Administracja</h1>

      <section>
        <h2 className="mb-3 text-lg font-black">Nowe zgłoszenia ({newOnes.length})</h2>
        {newOnes.length ? (
          <p className="mb-3 text-sm text-tekst-2">Po przyjęciu wyślij link do panelu z listy „Kto zarządza lokalami”.</p>
        ) : (
          <p className="text-tekst-2">Brak nowych zgłoszeń.</p>
        )}
        <ul className="space-y-3">
          {newOnes.map((z) => {
            const venuePhone = phones.get(z.slug);
            return (
              <li key={z.id} className={`${card} space-y-3`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/lokal/${z.slug}`} className="text-lg font-black hover:underline">
                    {z.nazwa}
                  </Link>
                  <span className="text-xs text-tekst-2">{when(z.utworzono)}</span>
                </div>
                <p className="text-sm leading-relaxed">
                  <b>{z.imie}</b> ({z.rola}) · tel. {z.telefon}
                  {z.email && <> · {z.email}</>}
                  {z.wiadomosc && <span className="mt-1 block text-tekst-2">„{z.wiadomosc}”</span>}
                </p>
                <p className="text-sm">
                  Potwierdź pod numerem lokalu:{" "}
                  {venuePhone ? (
                    <a href={phoneUrl(venuePhone)} className="inline-flex items-center gap-1 font-black text-akcent-tekst">
                      <Phone className="size-4" aria-hidden /> {venuePhone}
                    </a>
                  ) : (
                    <b>brak numeru lokalu — zweryfikuj inaczej (np. osobiście)</b>
                  )}
                </p>
                <form action={reviewClaim} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={z.id} />
                  <input name="notatka" placeholder="Notatka, np. „potwierdzone telefonicznie”" className={`${field} flex-1 basis-60 py-2`} />
                  <button name="decyzja" value="przyjete" className={`${smallButton} bg-otwarte text-white`}>
                    <Check className="size-4" aria-hidden /> Przyjmij
                  </button>
                  <button name="decyzja" value="odrzucone" className={`${smallButton} bg-krem`}>
                    <X className="size-4" aria-hidden /> Odrzuć
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-black">Kto zarządza lokalami</h2>
        {!accesses.length && <p className="text-tekst-2">Jeszcze nikt.</p>}
        <ul className={`${framedCard} divide-y divide-obrys`}>
          {accesses.map((d) => (
            <li key={`${d.lokal}-${d.konto}`} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <Link href={`/panel/${d.slug}`} className="font-extrabold hover:underline">
                {d.nazwa}
              </Link>
              <span className="min-w-0 flex-1 truncate text-sm text-tekst-2">
                {[d.imie, d.telefon, d.email].filter(Boolean).join(" · ")}
              </span>
              <PanelLink
                utworz={newPanelLink.bind(null, d.konto)}
                telefon={d.telefon}
                nazwa={d.nazwa}
                maLink={!!d.ma_link}
              />
              <form action={revokeAccess}>
                <input type="hidden" name="lokal" value={d.lokal} />
                <input type="hidden" name="konto" value={d.konto} />
                <button className={`${smallButton} bg-krem`}>Odbierz dostęp</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-black">Panel dowolnego lokalu</h2>
        <p className="mb-3 text-sm text-tekst-2">Tam też dasz komuś dostęp bez zgłoszenia — na dole zakładki „Dane”.</p>
        <VenueList lokale={all} prefiks="/panel/" />
      </section>

      {old.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-black">Rozpatrzone</h2>
          <ul className="space-y-1 text-sm">
            {old.map((z) => (
              <li key={z.id}>
                {z.status === "przyjete" ? "✓" : "✗"} <b>{z.nazwa}</b> — {[z.imie, z.telefon, z.email].filter(Boolean).join(", ")}
                {z.notatka && <span className="text-tekst-2"> · {z.notatka}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
