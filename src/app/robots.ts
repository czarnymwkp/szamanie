import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/konfiguracja";

export default function robots(): MetadataRoute.Robots {
  return {
    // propozycje wyglądu (noindex) — tylko do pokazania, nie dla wyszukiwarek
    rules: { userAgent: "*", allow: "/", disallow: "/propozycje" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
