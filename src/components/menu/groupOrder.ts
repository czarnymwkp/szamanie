// „Zamawiamy razem” (ordering together): the order list travels between phones in a link (QR code or sharing).
// Everything lives in the part of the URL after „#”, which the browser never sends to the server — no accounts and
// nothing stored on our side. The link holds names, dish names with their variant and quantities; the recipient's phone
// takes prices from the menu on the venue page. By name, not by item id: a menu loaded again (menu file, sync on the
// server) gets new ids, and dishes added to the list earlier must still reach the recipient.
import type { ListItem } from "./useOrderList";

export const MARKER = "#razem=";

type Dish = Omit<ListItem, "ilosc" | "kto">;
// v2: [person, name, variant (0 = no variant), quantity]; old links: [person, item key, quantity]
type Payload = { v?: 2; o: string[]; p: ([number, string, string | 0, number] | [number, string, number])[]; u?: string };

const toBase64 = (text: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(text)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64 = (text: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (z) => z.charCodeAt(0)));

const byName = (name: string, variant: string | null) => `${name.toLowerCase()}|${variant ?? ""}`;

/** The part of the link after „#razem=”: other people's items with their names, mine (without `kto`) under my name. */
export function encode(items: ListItem[], notes: string, myName: string): string {
  const people: string[] = [];
  const index = (who: string) => (people.includes(who) ? people.indexOf(who) : people.push(who) - 1);
  const payload: Payload = {
    v: 2,
    o: people,
    p: items.map((p) => [index(p.kto ?? myName), p.nazwa, p.wariant ?? 0, p.ilosc]),
  };
  if (notes) payload.u = notes;
  return toBase64(JSON.stringify(payload));
}

/**
 * Items from the link (kto = the person's name), or null when the link is broken. `dishes`: the venue menu by item key.
 */
export function decode(code: string, dishes: Map<string, Dish>): { pozycje: ListItem[]; uwagi: string } | null {
  try {
    const { v, o, p, u } = JSON.parse(fromBase64(code)) as Payload;
    const byNameIndex = new Map([...dishes.values()].map((d) => [byName(d.nazwa, d.wariant), d]));
    const items = p.flatMap((w) => {
      const person = w[0];
      const [d, ilosc] =
        v === 2 && w.length === 4
          ? [byNameIndex.get(byName(w[1], w[2] || null)), w[3]]
          : [dishes.get(w[1]), w[2] as number];
      // a dish that is no longer on the menu (the venue changed its card) is simply skipped
      return d && o[person] && ilosc > 0 ? [{ ...d, ilosc, kto: o[person].slice(0, 30) }] : [];
    });
    return { pozycje: items, uwagi: typeof u === "string" ? u.slice(0, 500) : "" };
  } catch {
    return null;
  }
}
