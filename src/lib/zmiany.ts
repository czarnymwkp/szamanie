import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

/**
 * Kiedy ostatnio zmieniły się dane lokalu (sam lokal, ręczne poprawki albo menu) — `lastmod` w sitemap, żeby Google
 * wracał szybciej do zmienionych stron. Klucz = slug, wartość = data w ISO.
 */
export async function zmianyLokali(): Promise<Record<string, string>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("lokale");

  const wiersze = db
    .prepare(
      `SELECT l.slug,
              MAX(l.zaktualizowano,
                  COALESCE((SELECT MAX(p.utworzono) FROM poprawki p WHERE p.lokal_id = l.id), ''),
                  COALESCE(l.menu_sprawdzono, '')) AS zmiana
       FROM lokale l WHERE l.ukryty = 0`,
    )
    .all() as { slug: string; zmiana: string }[];
  // SQLite zapisuje czas UTC jako „2026-10-31 12:00:00”, menu_sprawdzono sam dzień
  return Object.fromEntries(
    wiersze.map((w) => [w.slug, w.zmiana.length > 10 ? `${w.zmiana.replace(" ", "T")}Z` : w.zmiana]),
  );
}
