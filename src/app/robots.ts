import type { MetadataRoute } from "next";
import { ADRES_SERWISU } from "@/lib/konfiguracja";

export default function robots(): MetadataRoute.Robots {
  return {
    // propozycje wyglądu (noindex) — tylko do pokazania, nie dla wyszukiwarek
    rules: { userAgent: "*", allow: "/", disallow: "/propozycje" },
    sitemap: `${ADRES_SERWISU}/sitemap.xml`,
  };
}
