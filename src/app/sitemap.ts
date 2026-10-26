import type { MetadataRoute } from "next";
import { ADRES_SERWISU } from "@/lib/konfiguracja";
import { pobierzLokale } from "@/lib/lokale";
import { doIndeksu, obszaryZDowozem, wszystkieStrony } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lokale = await pobierzLokale();
  // strony lokali z noindex (bez telefonu, godzin, www i menu) nie idą do mapy
  const indeks = await Promise.all(lokale.map(doIndeksu));
  return [
    { url: ADRES_SERWISU, changeFrequency: "daily", priority: 1 },
    // strony fraz: /krasnik, /krasnik/pizza…
    ...wszystkieStrony(lokale).map(({ obszar, kategoria }) => ({
      url: `${ADRES_SERWISU}/${obszar.slug}${kategoria ? `/${kategoria.slug}` : ""}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...obszaryZDowozem(lokale).map((o) => ({
      url: `${ADRES_SERWISU}/${o.slug}/dowoz`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    { url: `${ADRES_SERWISU}/dla-lokali`, changeFrequency: "monthly", priority: 0.5 },
    ...lokale
      .filter((_, i) => indeks[i])
      .map((l) => ({
        url: `${ADRES_SERWISU}/lokal/${l.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
