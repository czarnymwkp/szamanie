import type { Metadata } from "next";
import { connection } from "next/server";
import { CONTACT_EMAIL } from "@/lib/config";
import { selectableVenues } from "@/lib/panel/accounts";
import VenueList from "./VenueList";

export const metadata: Metadata = { title: "Dodaj swój lokal" };

// list from the database at request time — waits for the server (like the whole panel)
export const instant = false;

export default async function AddVenuePage() {
  await connection();
  const venues = selectableVenues();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight">Znajdź swój lokal</h1>
        <p className="mt-1 text-tekst-2">Wybierz lokal z listy i poproś o dostęp do jego strony.</p>
      </div>
      <VenueList lokale={venues} />
      <p className="text-sm text-tekst-2">
        Nie ma Twojego lokalu?{" "}
        {CONTACT_EMAIL ? (
          <>
            Napisz na{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
            , a dodamy go.
          </>
        ) : (
          "Napisz do nas, a dodamy go."
        )}
      </p>
    </div>
  );
}
