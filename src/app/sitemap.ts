import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getVenues } from "@/lib/venues";
import { toIndex, areasWithDelivery, allPages } from "@/lib/seo";
import { venueChanges } from "@/lib/changes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [lokale, zmiany] = await Promise.all([getVenues(), venueChanges()]);
  // venue pages with noindex (no phone, hours, website or menu) are left out of the sitemap
  const index = await Promise.all(lokale.map(toIndex));
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    // phrase pages: /krasnik, /krasnik/pizza…
    ...allPages(lokale).map(({ obszar, kategoria }) => ({
      url: `${SITE_URL}/${obszar.slug}${kategoria ? `/${kategoria.slug}` : ""}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...areasWithDelivery(lokale).map((o) => ({
      url: `${SITE_URL}/${o.slug}/dowoz`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    { url: `${SITE_URL}/sale-weselne`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/dla-lokali`, changeFrequency: "monthly", priority: 0.5 },
    ...lokale
      .filter((_, i) => index[i])
      .map((l) => ({
        url: `${SITE_URL}/lokal/${l.slug}`,
        lastModified: zmiany[l.slug],
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
