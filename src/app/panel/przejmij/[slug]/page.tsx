import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { karta } from "@/components/panel/style";
import { db } from "@/lib/db";
import { pobierzLokal } from "@/lib/lokale";
import { lokalDoPrzejecia, wymagajKonta } from "@/lib/panel/konta";
import { zglosLokal } from "../../akcje";
import FormularzZgloszenia from "./FormularzZgloszenia";

export const metadata: Metadata = { title: "Poproś o dostęp do lokalu" };

export default async function Przejmij({ params }: PageProps<"/panel/przejmij/[slug]">) {
  const { slug } = await params;
  const konto = await wymagajKonta(`/panel/przejmij/${slug}`);
  const lokal = lokalDoPrzejecia(slug);
  if (!lokal) notFound();
  if (db.prepare("SELECT 1 FROM lokale_konta WHERE lokal_id = ? AND konto_id = ?").get(lokal.id, konto.id)) {
    redirect(`/panel/${slug}`);
  }
  const czeka = !!db
    .prepare("SELECT 1 FROM zgloszenia WHERE lokal_id = ? AND konto_id = ? AND status = 'nowe'")
    .get(lokal.id, konto.id);
  // numer z poprawkami, tak jak na stronie lokalu — na niego zadzwonimy, żeby potwierdzić
  const telefon = (await pobierzLokal(slug))?.telefon ?? null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-extrabold text-akcent-tekst">To mój lokal</p>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight">{lokal.nazwa}</h1>
        {lokal.adres && (
          <p className="mt-1 flex items-center gap-1.5 text-tekst-2">
            <MapPin className="size-4" aria-hidden /> {[lokal.adres, lokal.miejscowosc].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      <div className={`${karta} space-y-2 bg-krem text-sm leading-relaxed ring-0`}>
        <p className="font-extrabold">Jak to działa?</p>
        <p>
          Zostaw dane, a my zadzwonimy {telefon ? <>na numer lokalu <b className="whitespace-nowrap">{telefon}</b></> : "do lokalu"},
          żeby potwierdzić, że to Ty. Zwykle trwa to jeden dzień roboczy. Potem zmienisz menu, ceny, godziny i dodasz
          promocje.
        </p>
        {!telefon && (
          <p className="flex items-start gap-1.5">
            <Phone className="mt-0.5 size-4 shrink-0" aria-hidden /> Nie mamy numeru tego lokalu — oddzwonimy na numer
            podany poniżej.
          </p>
        )}
      </div>

      {czeka ? (
        <p className={`${karta} font-bold`}>Twoje zgłoszenie już czeka na potwierdzenie. Odezwiemy się wkrótce.</p>
      ) : (
        <FormularzZgloszenia zglos={zglosLokal.bind(null, slug)} imie={konto.imie ?? ""} />
      )}
    </div>
  );
}
