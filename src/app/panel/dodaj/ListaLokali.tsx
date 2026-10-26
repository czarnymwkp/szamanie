"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { kartaRamka, pole } from "@/components/panel/style";
import { bezPolskich } from "@/lib/slug.mjs";

type Lokal = { slug: string; nazwa: string; adres: string | null; miejscowosc: string | null };

export default function ListaLokali({ lokale }: { lokale: Lokal[] }) {
  const [fraza, setFraza] = useState("");
  const f = bezPolskich(useDeferredValue(fraza).trim());
  const wyniki = f
    ? lokale.filter((l) => bezPolskich(`${l.nazwa} ${l.adres ?? ""} ${l.miejscowosc ?? ""}`).includes(f))
    : lokale;

  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">Szukaj lokalu</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-tekst-2" aria-hidden />
        <input
          value={fraza}
          onChange={(e) => setFraza(e.target.value)}
          placeholder="Nazwa lokalu albo ulica"
          className={`${pole} pl-11`}
          autoFocus
        />
      </label>
      <ul className={`${kartaRamka} divide-y divide-obrys`}>
        {wyniki.slice(0, 60).map((l) => (
          <li key={l.slug}>
            <Link href={`/panel/przejmij/${l.slug}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-krem">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">{l.nazwa}</span>
                <span className="block truncate text-sm text-tekst-2">
                  {[l.adres, l.miejscowosc].filter(Boolean).join(", ")}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </li>
        ))}
        {!wyniki.length && <li className="px-5 py-4 text-tekst-2">Nic nie pasuje do „{fraza}”.</li>}
      </ul>
    </div>
  );
}
