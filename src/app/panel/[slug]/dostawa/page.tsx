import type { Metadata } from "next";
import { dostawaDoEdycji, nazwyMiejscowosci } from "@/lib/panel/lokal";
import { wymagajLokalu } from "@/lib/panel/konta";
import { zapiszDostawe } from "../akcje";
import EdytorDostawy from "./EdytorDostawy";

export const metadata: Metadata = { title: "Dostawa" };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
export const instant = false;

export default async function Dostawa({ params }: PageProps<"/panel/[slug]/dostawa">) {
  const { slug } = await params;
  const { lokal } = await wymagajLokalu(slug);
  const { strefy, uwagi } = dostawaDoEdycji(lokal.id);
  return (
    <EdytorDostawy
      strefy={strefy}
      uwagi={uwagi}
      miejscowosci={nazwyMiejscowosci()}
      zapisz={zapiszDostawe.bind(null, slug)}
    />
  );
}
