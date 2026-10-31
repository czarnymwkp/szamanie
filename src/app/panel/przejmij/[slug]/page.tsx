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

// the page depends on the account and the URL — it waits for the server (like the whole panel)
export const instant = false;

export default async function ClaimPage({ params }: PageProps<"/panel/przejmij/[slug]">) {
  const { slug } = await params;
  // no sign-in: anyone can send a claim, and access is granted only by the admin after calling the venue's number
  const account = await getAccount();
  const venue = venueToClaim(slug);
  if (!venue) notFound();
  if (account && db.prepare("SELECT 1 FROM lokale_konta WHERE lokal_id = ? AND konto_id = ?").get(venue.id, account.id)) {
    redirect(`/panel/${slug}`);
  }
  const waiting =
    !!account &&
    !!db.prepare("SELECT 1 FROM zgloszenia WHERE lokal_id = ? AND konto_id = ? AND status = 'nowe'").get(venue.id, account.id);
  // the number with corrections, as on the venue page — we call it to confirm
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
