import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GlownaPropozycji } from "@/components/propozycje";
import { PROPOZYCJE } from "@/components/propozycje/wspolne";
import { pobierzLokale, pobierzMiejscowosci } from "@/lib/lokale";

export function generateStaticParams() {
  return PROPOZYCJE.map((p) => ({ nr: String(p.nr) }));
}

export default function StronaPropozycji({ params }: PageProps<"/propozycje/[nr]">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-screen animate-pulse bg-obrys" />}>
      <Tresc params={params} />
    </Suspense>
  );
}

async function Tresc({ params }: Pick<PageProps<"/propozycje/[nr]">, "params">) {
  const nr = Number((await params).nr);
  if (!PROPOZYCJE.some((p) => p.nr === nr)) notFound();
  const [lokale, miejscowosci] = await Promise.all([pobierzLokale(), pobierzMiejscowosci()]);
  return <GlownaPropozycji lokale={lokale} miejscowosci={miejscowosci} nr={nr} />;
}
