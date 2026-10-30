import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/konfiguracja";

export default function robots(): MetadataRoute.Robots {
  return {
    // propozycje wyglądu (noindex) — tylko do pokazania, nie dla wyszukiwarek; panel właściciela — za logowaniem;
    // naklejki do druku dla lokali
    rules: { userAgent: "*", allow: "/", disallow: ["/propozycje", "/panel", "/naklejka"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
