import type { Metadata } from "next";
import { menuDoEdycji } from "@/lib/panel/lokal";
import { wymagajLokalu } from "@/lib/panel/konta";
import { zapiszMenu } from "../akcje";
import EdytorMenu from "./EdytorMenu";

export const metadata: Metadata = { title: "Menu i ceny" };

export default async function Menu({ params }: PageProps<"/panel/[slug]/menu">) {
  const { slug } = await params;
  const { lokal } = await wymagajLokalu(slug);
  return <EdytorMenu menu={menuDoEdycji(lokal.id)} zapisz={zapiszMenu.bind(null, slug)} />;
}
