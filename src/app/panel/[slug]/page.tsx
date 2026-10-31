import type { Metadata } from "next";
import { venueData } from "@/lib/panel/lokal";
import { requireVenue } from "@/lib/panel/konta";
import { saveDetails } from "./akcje";
import VenueAccess from "./DostepDoLokalu";
import DetailsForm from "./FormularzDanych";

export const metadata: Metadata = { title: "Dane lokalu" };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
export const instant = false;

export default async function VenueData({ params }: PageProps<"/panel/[slug]">) {
  const { slug } = await params;
  const { konto, lokal } = await requireVenue(slug);
  return (
    <>
      <DetailsForm dane={venueData(lokal.id)} zapisz={saveDetails.bind(null, slug)} />
      {konto.rola === "admin" && <VenueAccess lokal={lokal} />}
    </>
  );
}
