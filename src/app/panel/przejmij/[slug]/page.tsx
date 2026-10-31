import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { card } from "@/components/panel/style";
import { db } from "@/lib/db";
import { getVenue } from "@/lib/venues";
import { venueToClaim, getAccount } from "@/lib/panel/accounts";
import { claimVenue } from "../../actions";
import ClaimForm from "./ClaimForm";

export const metadata: Metadata = { title: "Poproś o dostęp do lokalu" };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
export const instant = false;

export default async function ClaimPage({ params }: PageProps<"/panel/przejmij/[slug]">) {
  const { slug } = await params;
  // bez logowania: zgłoszenie wysyła każdy, a dostęp daje dopiero admin po telefonie na numer lokalu
  const account = await getAccount();
  const venue = venueToClaim(slug);
  if (!venue) notFound();
  if (account && db.prepare("SELECT 1 FROM lokale_konta WHERE lokal_id = ? AND konto_id = ?").get(venue.id, account.id)) {
    redirect(`/panel/${slug}`);
  }
  const waiting =
    !!account &&
    !!db.prepare("SELECT 1 FROM zgloszenia WHERE lokal_id = ? AND konto_id = ? AND status = 'nowe'").get(venue.id, account.id);
  // numer z poprawkami, tak jak na stronie lokalu — na niego zadzwonimy, żeby potwierdzić
  const phone = (await getVenue(slug))?.telefon ?? null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-extrabold text-akcent-tekst">To mój lokal</p>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight">{venue.nazwa}</h1>
        {venue.adres && (
          <p className="mt-1 flex items-center gap-1.5 text-tekst-2">
            <MapPin className="size-4" aria-hidden /> {[venue.adres, venue.miejscowosc].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      <div className={`${card} space-y-2 bg-krem text-sm leading-relaxed ring-0`}>
        <p className="font-extrabold">Jak to działa?</p>
        <p>
          Zostaw dane, a my zadzwonimy {phone ? <>na numer lokalu <b className="whitespace-nowrap">{phone}</b></> : "do lokalu"},
          żeby potwierdzić, że to Ty. Zwykle trwa to jeden dzień roboczy. Potem wyślemy Ci SMS-em link do panelu, w którym
          zmienisz menu, ceny, godziny i dodasz promocje. Bez hasła i zakładania konta.
        </p>
        {!phone && (
          <p className="flex items-start gap-1.5">
            <Phone className="mt-0.5 size-4 shrink-0" aria-hidden /> Nie mamy numeru tego lokalu — oddzwonimy na numer
            podany poniżej.
          </p>
        )}
      </div>

      {waiting ? (
        <p className={`${card} font-bold`}>Twoje zgłoszenie już czeka na potwierdzenie. Odezwiemy się wkrótce.</p>
      ) : (
        <ClaimForm zglos={claimVenue.bind(null, slug)} imie={account?.imie ?? ""} pytajOEmail={!account?.email} />
      )}
    </div>
  );
}
