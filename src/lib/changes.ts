import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

/**
 * When a venue's data last changed (the venue itself, manual corrections or the menu) — `lastmod` in the sitemap, so
 * Google revisits changed pages sooner. Key = slug, value = ISO date.
 */
export async function venueChanges(): Promise<Record<string, string>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("lokale");

  const rows = db
    .prepare(
      `SELECT l.slug,
              MAX(l.zaktualizowano,
                  COALESCE((SELECT MAX(p.utworzono) FROM poprawki p WHERE p.lokal_id = l.id), ''),
                  COALESCE(l.menu_sprawdzono, '')) AS zmiana
       FROM lokale l WHERE l.ukryty = 0`,
    )
    .all() as { slug: string; zmiana: string }[];
  // SQLite stores UTC time as „2026-10-31 12:00:00”, menu_sprawdzono just the day
  return Object.fromEntries(
    rows.map((w) => [w.slug, w.zmiana.length > 10 ? `${w.zmiana.replace(" ", "T")}Z` : w.zmiana]),
  );
}
