import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireVenue } from "@/lib/panel/accounts";
import Tabs from "./Tabs";

// jak cały panel: zależy od konta, więc czeka na serwer (bez tego Next ostrzega o odczycie adresu przy prerenderze)
export const instant = false;

export default async function VenueLayout({ children, params }: LayoutProps<"/panel/[slug]">) {
  const { slug } = await params;
  const { lokal } = await requireVenue(slug);
  return (
    <div>
      <Link href="/panel" className="inline-flex items-center gap-1.5 text-sm font-bold text-tekst-2 hover:text-tekst">
        <ArrowLeft className="size-4" aria-hidden /> Twoje lokale
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h1 className="font-grotesk text-3xl font-bold tracking-tight sm:text-4xl">{lokal.nazwa}</h1>
        <a
          href={`/lokal/${lokal.slug}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-sm font-extrabold text-akcent-tekst hover:underline"
        >
          Zobacz stronę lokalu <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
      <Tabs slug={lokal.slug} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
