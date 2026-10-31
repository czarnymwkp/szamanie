import type { Metadata } from "next";
import { deliveryDraft, townNames } from "@/lib/panel/lokal";
import { requireVenue } from "@/lib/panel/konta";
import { saveDeliveryAction } from "../akcje";
import DeliveryEditor from "./EdytorDostawy";

export const metadata: Metadata = { title: "Dostawa" };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
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
