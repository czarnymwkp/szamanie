import type { Metadata } from "next";
import { menuDraft } from "@/lib/panel/venue";
import { requireVenue } from "@/lib/panel/accounts";
import { saveMenu } from "../actions";
import MenuEditor from "./MenuEditor";

export const metadata: Metadata = { title: "Menu i ceny" };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
export const instant = false;

export default async function Menu({ params }: PageProps<"/panel/[slug]/menu">) {
  const { slug } = await params;
  const { lokal } = await requireVenue(slug);
  return <MenuEditor menu={menuDraft(lokal.id)} zapisz={saveMenu.bind(null, slug)} />;
}
