import { getVenues } from "@/lib/lokale";
import FooterContent from "../mobilne/StopkaM";
import { footerLinks } from "../mobilne/linki";

export default async function Footer() {
  // Linki do stron fraz (/krasnik/pizza…) z każdej podstrony — Google trafia po nich do wszystkich.
  const venues = await getVenues();
  return <FooterContent linki={footerLinks(venues)} szaman="szkic" />;
}
