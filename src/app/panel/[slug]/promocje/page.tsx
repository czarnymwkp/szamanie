import type { Metadata } from "next";
import { dishPrices, promotionsDraft } from "@/lib/panel/venue";
import { requireVenue } from "@/lib/panel/accounts";
import { deletePromotionAction, savePromotionAction } from "../actions";
import Promotions from "./Promotions";

export const metadata: Metadata = { title: "Promocje" };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
export const instant = false;

export default async function PromotionsPage({ params }: PageProps<"/panel/[slug]/promocje">) {
  const { slug } = await params;
  const { lokal } = await requireVenue(slug);
  return (
    <Promotions
      promocje={promotionsDraft(lokal.id)}
      dania={dishPrices(lokal.id)}
      zapisz={savePromotionAction.bind(null, slug)}
      usun={deletePromotionAction.bind(null, slug)}
    />
  );
}
