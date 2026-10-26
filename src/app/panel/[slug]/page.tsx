import type { Metadata } from "next";
import { daneLokalu } from "@/lib/panel/lokal";
import { wymagajLokalu } from "@/lib/panel/konta";
import { zapiszDane } from "./akcje";
import FormularzDanych from "./FormularzDanych";

export const metadata: Metadata = { title: "Dane lokalu" };

// strona zależy od konta i adresu — czeka na serwer (jak cały panel)
export const instant = false;

export default async function DaneLokalu({ params }: PageProps<"/panel/[slug]">) {
  const { slug } = await params;
  const { lokal } = await wymagajLokalu(slug);
  return <FormularzDanych dane={daneLokalu(lokal.id)} zapisz={zapiszDane.bind(null, slug)} />;
}
