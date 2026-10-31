import type { Metadata } from "next";
import { venueData } from "@/lib/panel/venue";
import { requireVenue } from "@/lib/panel/accounts";
import { saveDetails } from "./actions";
import VenueAccess from "./VenueAccess";
import DetailsForm from "./DetailsForm";

export const metadata: Metadata = { title: "Dane lokalu" };

// the page depends on the account and the URL — it waits for the server (like the whole panel)
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
