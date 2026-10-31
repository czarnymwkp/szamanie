import { getVenues } from "@/lib/venues";
import FooterContent from "./FooterContent";
import { footerLinks } from "./footerLinks";

export default async function Footer() {
  // Linki do stron fraz (/krasnik/pizza…) z każdej podstrony — Google trafia po nich do wszystkich.
  const venues = await getVenues();
  return <FooterContent linki={footerLinks(venues)} szaman="szkic" />;
}
