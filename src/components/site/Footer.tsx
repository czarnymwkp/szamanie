import { getVenues } from "@/lib/venues";
import FooterContent from "./FooterContent";
import { footerLinks } from "./footerLinks";

export default async function Footer() {
  // Links to the phrase pages (/krasnik/pizza…) from every subpage — Google reaches all of them through these.
  const venues = await getVenues();
  return <FooterContent linki={footerLinks(venues)} szaman="szkic" />;
}
