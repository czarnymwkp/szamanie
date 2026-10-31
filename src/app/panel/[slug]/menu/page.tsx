import type { Metadata } from "next";
import { menuDraft } from "@/lib/panel/venue";
import { requireVenue } from "@/lib/panel/accounts";
import { saveMenu } from "../actions";
import MenuEditor from "./MenuEditor";

export const metadata: Metadata = { title: "Menu i ceny" };

// the page depends on the account and the URL — it waits for the server (like the whole panel)
export const instant = false;

export default async function Menu({ params }: PageProps<"/panel/[slug]/menu">) {
  const { slug } = await params;
  const { lokal } = await requireVenue(slug);
  return <MenuEditor menu={menuDraft(lokal.id)} zapisz={saveMenu.bind(null, slug)} />;
}
