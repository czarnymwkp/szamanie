import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/konfiguracja";
import { getVenues } from "@/lib/lokale";
import { toIndex, areasWithDelivery, allPages } from "@/lib/seo";
import { venueChanges } from "@/lib/zmiany";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [lokale, zmiany] = await Promise.all([getVenues(), venueChanges()]);
  // strony lokali z noindex (bez telefonu, godzin, www i menu) nie idą do mapy
  const index = await Promise.all(lokale.map(toIndex));
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    // strony fraz: /krasnik, /krasnik/pizza…
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
