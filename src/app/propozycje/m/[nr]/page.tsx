import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GlownaPropozycjiM } from "@/components/mobilne";
import { linkiStopki } from "@/components/mobilne/linki";
import { PROPOZYCJE_M } from "@/components/mobilne/wspolne";
import { pobierzLokale, pobierzMiejscowosci } from "@/lib/lokale";

export function generateStaticParams() {
  return PROPOZYCJE_M.map((p) => ({ nr: String(p.nr) }));
}

export default function GlownaM({ params }: PageProps<"/propozycje/m/[nr]">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-screen animate-pulse bg-obrys" />}>
      <Tresc params={params} />
    </Suspense>
  );
}

async function Tresc({ params }: Pick<PageProps<"/propozycje/m/[nr]">, "params">) {
  const nr = Number((await params).nr);
  if (!PROPOZYCJE_M.some((p) => p.nr === nr)) notFound();
  const [lokale, miejscowosci] = await Promise.all([pobierzLokale(), pobierzMiejscowosci()]);
  return <GlownaPropozycjiM lokale={lokale} miejscowosci={miejscowosci} nr={nr} linki={linkiStopki(lokale)} />;
}
