import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/konfiguracja";
import { pobierzLokale } from "@/lib/lokale";
import { doIndeksu, obszaryZDowozem, wszystkieStrony } from "@/lib/seo";
import { zmianyLokali } from "@/lib/zmiany";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [lokale, zmiany] = await Promise.all([pobierzLokale(), zmianyLokali()]);
  // strony lokali z noindex (bez telefonu, godzin, www i menu) nie idą do mapy
  const indeks = await Promise.all(lokale.map(doIndeksu));
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    // strony fraz: /krasnik, /krasnik/pizza…
    ...wszystkieStrony(lokale).map(({ obszar, kategoria }) => ({
      url: `${SITE_URL}/${obszar.slug}${kategoria ? `/${kategoria.slug}` : ""}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...obszaryZDowozem(lokale).map((o) => ({
      url: `${SITE_URL}/${o.slug}/dowoz`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    { url: `${SITE_URL}/sale-weselne`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/dla-lokali`, changeFrequency: "monthly", priority: 0.5 },
    ...lokale
      .filter((_, i) => indeks[i])
      .map((l) => ({
        url: `${SITE_URL}/lokal/${l.slug}`,
        lastModified: zmiany[l.slug],
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
