import type { Metadata } from "next";
import { cenyDan, promocjeDoEdycji } from "@/lib/panel/lokal";
import { wymagajLokalu } from "@/lib/panel/konta";
import { usunPromocje, zapiszPromocje } from "../akcje";
import Promocje from "./Promocje";

export const metadata: Metadata = { title: "Promocje" };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
export const instant = false;

export default async function StronaPromocji({ params }: PageProps<"/panel/[slug]/promocje">) {
  const { slug } = await params;
  const { lokal } = await wymagajLokalu(slug);
  return (
    <Promocje
      promocje={promocjeDoEdycji(lokal.id)}
      dania={cenyDan(lokal.id)}
      zapisz={zapiszPromocje.bind(null, slug)}
      usun={usunPromocje.bind(null, slug)}
    />
  );
}
