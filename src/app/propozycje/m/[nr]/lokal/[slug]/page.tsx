import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LokalPropozycjiM } from "@/components/mobilne";
import { LOKALE_DO_PODGLADU, PROPOZYCJE_M } from "@/components/mobilne/wspolne";
import { pobierzLokal } from "@/lib/lokale";
import { pobierzDostawe, pobierzMenu } from "@/lib/menu";

// Z góry tylko lokale z listy podglądu; reszta generuje się przy pierwszym wejściu.
export function generateStaticParams() {
  return LOKALE_DO_PODGLADU.map((l) => ({ slug: l.slug }));
}

export default function LokalM({ params }: PageProps<"/propozycje/m/[nr]/lokal/[slug]">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-screen animate-pulse bg-obrys" />}>
      <Tresc params={params} />
    </Suspense>
  );
}

async function Tresc({ params }: Pick<PageProps<"/propozycje/m/[nr]/lokal/[slug]">, "params">) {
  const { nr: tekstNr, slug } = await params;
  const nr = Number(tekstNr);
  const lokal = await pobierzLokal(slug);
  if (!lokal || !PROPOZYCJE_M.some((p) => p.nr === nr)) notFound();
  const [menu, dostawa] = await Promise.all([pobierzMenu(lokal.id), pobierzDostawe(lokal.id)]);
  return <LokalPropozycjiM lokal={lokal} menu={menu} dostawa={dostawa} nr={nr} />;
}
