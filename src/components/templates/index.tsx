import type { Venue } from "@/lib/venues";
import { pageTheme } from "@/lib/venueThemes";
import SketchVenue from "../sketch/SketchVenue";
import Classic from "./Classic";

// Venue page looks to choose in a subscription. A new template: a component in this folder + a case below.
export const TEMPLATES = [{ id: "klasyczny", nazwa: "Klasyczny" }] as const;

export default function VenueTemplate({ lokal }: { lokal: Venue }) {
  switch (lokal.szablon) {
    default:
      // a venue with its own theme (in the style of its menu card, e.g. Burger&Pizza) — Classic in its colors, the rest
      // in the site's „Sketchbook” look
      return pageTheme(lokal.slug) ? <Classic lokal={lokal} /> : <SketchVenue lokal={lokal} />;
  }
}
