import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    // /propozycje — the old design proposals (removed; the rule stays for old links); the owner panel — behind a link;
    // printable stickers for venues
    rules: { userAgent: "*", allow: "/", disallow: ["/propozycje", "/panel", "/naklejka"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
