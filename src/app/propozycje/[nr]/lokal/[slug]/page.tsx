import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LokalPropozycji } from "@/components/propozycje";
import { PROPOZYCJE } from "@/components/propozycje/wspolne";
import { pobierzLokal, pobierzLokale } from "@/lib/lokale";

export async function generateStaticParams() {
  const lokale = await pobierzLokale();
  return lokale.length ? lokale.map((l) => ({ slug: l.slug })) : [{ slug: "brak" }];
}

export default function LokalWPropozycji({ params }: PageProps<"/propozycje/[nr]/lokal/[slug]">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-screen animate-pulse bg-obrys" />}>
      <Tresc params={params} />
    </Suspense>
  );
}

async function Tresc({ params }: Pick<PageProps<"/propozycje/[nr]/lokal/[slug]">, "params">) {
  const { nr: tekstNr, slug } = await params;
  const nr = Number(tekstNr);
  const lokal = await pobierzLokal(slug);
  if (!lokal || !PROPOZYCJE.some((p) => p.nr === nr)) notFound();
  return <LokalPropozycji lokal={lokal} nr={nr} />;
}
