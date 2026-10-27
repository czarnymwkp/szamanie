import type { Metadata } from "next";
import { connection } from "next/server";
import { KONTAKT_EMAIL } from "@/lib/konfiguracja";
import { lokaleDoWyboru } from "@/lib/panel/konta";
import ListaLokali from "./ListaLokali";

export const metadata: Metadata = { title: "Dodaj swój lokal" };

// lista z bazy w chwili żądania — czeka na serwer (jak cały panel)
export const instant = false;

export default async function Dodaj() {
  await connection();
  const lokale = lokaleDoWyboru();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight">Znajdź swój lokal</h1>
        <p className="mt-1 text-tekst-2">Wybierz lokal z listy i poproś o dostęp do jego strony.</p>
      </div>
      <ListaLokali lokale={lokale} />
      <p className="text-sm text-tekst-2">
        Nie ma Twojego lokalu?{" "}
        {KONTAKT_EMAIL ? (
          <>
            Napisz na{" "}
            <a href={`mailto:${KONTAKT_EMAIL}`} className="font-bold underline underline-offset-2">
              {KONTAKT_EMAIL}
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
