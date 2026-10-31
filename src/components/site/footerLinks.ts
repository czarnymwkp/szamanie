import type { Venue } from "@/lib/venues";
import { areasWithDelivery, allPages } from "@/lib/seo";
import type { FooterLink } from "./FooterContent";

/** Links to pages like „Pizza w Kraśniku”, „Jedzenie z dowozem…” in the site footer. */
export function footerLinks(venues: Venue[]): FooterLink[] {
  const withDelivery = areasWithDelivery(venues);
  return allPages(venues)
    .flatMap(({ obszar, kategoria }) => [
      { nazwa: kategoria ? `${kategoria.nazwa} ${obszar.w}` : `Gdzie zjeść ${obszar.w}`, adres: `/${obszar.slug}${kategoria ? `/${kategoria.slug}` : ""}` },
      ...(!kategoria && withDelivery.includes(obszar) ? [{ nazwa: `Jedzenie z dowozem ${obszar.w}`, adres: `/${obszar.slug}/dowoz` }] : []),
    ])
    .slice(0, 8)
    .concat({ nazwa: "Sale weselne i na przyjęcia", adres: "/sale-weselne" });
}
