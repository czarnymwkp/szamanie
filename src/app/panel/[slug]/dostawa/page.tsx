import type { Metadata } from "next";
import { deliveryDraft, townNames } from "@/lib/panel/venue";
import { requireVenue } from "@/lib/panel/accounts";
import { saveDeliveryAction } from "../actions";
import DeliveryEditor from "./DeliveryEditor";

export const metadata: Metadata = { title: "Dostawa" };

// the page depends on the account and the URL — it waits for the server (like the whole panel)
export const instant = false;

export default async function Delivery({ params }: PageProps<"/panel/[slug]/dostawa">) {
  const { slug } = await params;
  const { lokal } = await requireVenue(slug);
  const { strefy, uwagi } = deliveryDraft(lokal.id);
  return (
    <DeliveryEditor
      strefy={strefy}
      uwagi={uwagi}
      miejscowosci={townNames()}
      zapisz={saveDeliveryAction.bind(null, slug)}
    />
  );
}
