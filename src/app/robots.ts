import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/konfiguracja";

export default function robots(): MetadataRoute.Robots {
  return {
    // propozycje wyglądu (noindex) — tylko do pokazania, nie dla wyszukiwarek; panel właściciela — za logowaniem
    rules: { userAgent: "*", allow: "/", disallow: ["/propozycje", "/panel"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
