import type { Metadata } from "next";
import Link from "next/link";
import { Check, Phone, X } from "lucide-react";
import { karta, kartaRamka, pole, przyciskMaly } from "@/components/panel/style";
import { db } from "@/lib/db";
import { pobierzLokale } from "@/lib/lokale";
import { linkTelefonu } from "@/lib/nazwy";
import { wymagajAdmina } from "@/lib/panel/konta";
import ListaLokali from "../dodaj/ListaLokali";
import { odbierzDostep, rozpatrzZgloszenie } from "./akcje";

export const metadata: Metadata = { title: "Administracja" };

type Zgloszenie = {
  id: number;
  imie: string;
  telefon: string;
  rola: string;
  wiadomosc: string | null;
  status: string;
  notatka: string | null;
  utworzono: string;
  email: string;
  slug: string;
  nazwa: string;
  adres: string | null;
};

const kiedy = (sql: string) =>
  new Date(`${sql.replace(" ", "T")}Z`).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });

export default async function Admin() {
  await wymagajAdmina();
  const zgloszenia = (
    db
      .prepare(
        `SELECT z.id, z.imie, z.telefon, z.rola, z.wiadomosc, z.status, z.notatka, z.utworzono,
                k.email, l.slug, l.nazwa, l.adres
         FROM zgloszenia z JOIN konta k ON k.id = z.konto_id JOIN lokale l ON l.id = z.lokal_id
         ORDER BY z.status = 'nowe' DESC, z.utworzono DESC LIMIT 100`,
      )
      .all() as Zgloszenie[]
  ).map((z) => ({ ...z }));
  // numer lokalu z poprawkami — na niego dzwonimy, nie na numer podany w zgłoszeniu
  const telefony = new Map((await pobierzLokale()).map((l) => [l.slug, l.telefon]));
  const dostepy = (
    db
      .prepare(
        `SELECT k.id AS konto, k.email, k.rola, l.id AS lokal, l.nazwa, l.slug
         FROM lokale_konta lk JOIN konta k ON k.id = lk.konto_id JOIN lokale l ON l.id = lk.lokal_id
         ORDER BY l.nazwa`,
      )
      .all() as { konto: number; email: string; rola: string; lokal: number; nazwa: string; slug: string }[]
  ).map((d) => ({ ...d }));
  const wszystkie = (
    db.prepare("SELECT slug, nazwa, adres, miejscowosc FROM lokale ORDER BY nazwa COLLATE NOCASE").all() as {
      slug: string;
      nazwa: string;
      adres: string | null;
      miejscowosc: string | null;
    }[]
  ).map((l) => ({ ...l }));
  const nowe = zgloszenia.filter((z) => z.status === "nowe");
  const stare = zgloszenia.filter((z) => z.status !== "nowe");

  return (
    <div className="space-y-10">
      <h1 className="font-grotesk text-3xl font-bold tracking-tight">Administracja</h1>

      <section>
        <h2 className="mb-3 text-lg font-black">Nowe zgłoszenia ({nowe.length})</h2>
        {!nowe.length && <p className="text-tekst-2">Brak nowych zgłoszeń.</p>}
        <ul className="space-y-3">
          {nowe.map((z) => {
            const telefonLokalu = telefony.get(z.slug);
            return (
              <li key={z.id} className={`${karta} space-y-3`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/lokal/${z.slug}`} className="text-lg font-black hover:underline">
                    {z.nazwa}
                  </Link>
                  <span className="text-xs text-tekst-2">{kiedy(z.utworzono)}</span>
                </div>
                <p className="text-sm leading-relaxed">
                  <b>{z.imie}</b> ({z.rola}) · {z.email} · tel. {z.telefon}
                  {z.wiadomosc && <span className="mt-1 block text-tekst-2">„{z.wiadomosc}”</span>}
                </p>
                <p className="text-sm">
                  Potwierdź pod numerem lokalu:{" "}
                  {telefonLokalu ? (
                    <a href={linkTelefonu(telefonLokalu)} className="inline-flex items-center gap-1 font-black text-akcent-tekst">
                      <Phone className="size-4" aria-hidden /> {telefonLokalu}
                    </a>
                  ) : (
                    <b>brak numeru lokalu — zweryfikuj inaczej (np. osobiście)</b>
                  )}
                </p>
                <form action={rozpatrzZgloszenie} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={z.id} />
                  <input name="notatka" placeholder="Notatka, np. „potwierdzone telefonicznie”" className={`${pole} flex-1 basis-60 py-2`} />
                  <button name="decyzja" value="przyjete" className={`${przyciskMaly} bg-otwarte text-white`}>
                    <Check className="size-4" aria-hidden /> Przyjmij
                  </button>
                  <button name="decyzja" value="odrzucone" className={`${przyciskMaly} bg-krem`}>
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
        {!dostepy.length && <p className="text-tekst-2">Jeszcze nikt.</p>}
        <ul className={`${kartaRamka} divide-y divide-obrys`}>
          {dostepy.map((d) => (
            <li key={`${d.lokal}-${d.konto}`} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <Link href={`/panel/${d.slug}`} className="font-extrabold hover:underline">
                {d.nazwa}
              </Link>
              <span className="min-w-0 flex-1 truncate text-sm text-tekst-2">{d.email}</span>
              <form action={odbierzDostep}>
                <input type="hidden" name="lokal" value={d.lokal} />
                <input type="hidden" name="konto" value={d.konto} />
                <button className={`${przyciskMaly} bg-krem`}>Odbierz dostęp</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-black">Panel dowolnego lokalu</h2>
        <ListaLokali lokale={wszystkie} prefiks="/panel/" />
      </section>

      {stare.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-black">Rozpatrzone</h2>
          <ul className="space-y-1 text-sm">
            {stare.map((z) => (
              <li key={z.id}>
                {z.status === "przyjete" ? "✓" : "✗"} <b>{z.nazwa}</b> — {z.imie}, {z.email}
                {z.notatka && <span className="text-tekst-2"> · {z.notatka}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
