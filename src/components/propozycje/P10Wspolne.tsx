"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Compass, Heart, Map as IkonaMapy, Store } from "lucide-react";
import { useUlubione } from "../useUlubione";
import { adresPropozycji } from "./wspolne";

/** Szkielet „aplikacji”: boczne menu na komputerze, dolne menu na telefonie. */
export function PowlokaAplikacji({ nr, children }: { nr: number; children: ReactNode }) {
  const { ulubione } = useUlubione();
  const pozycje = [
    { href: adresPropozycji(nr), ikona: Compass, nazwa: "Odkrywaj", aktywna: true },
    { href: "/propozycje/5", ikona: IkonaMapy, nazwa: "Mapa", aktywna: false },
    { href: `${adresPropozycji(nr)}#ulubione`, ikona: Heart, nazwa: `Ulubione${ulubione.size ? ` (${ulubione.size})` : ""}`, aktywna: false },
    { href: "/dla-lokali", ikona: Store, nazwa: "Dla lokali", aktywna: false },
  ];
  return (
    <div className="min-h-screen bg-tlo lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:gap-1 lg:border-r lg:border-obrys lg:bg-white lg:p-5">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="mb-8 h-7 w-auto self-start" />
        <nav aria-label="Menu aplikacji" className="flex flex-col gap-1">
          {pozycje.map(({ href, ikona: Ikona, nazwa, aktywna }) => (
            <Link
              key={nazwa}
              href={href}
              aria-current={aktywna ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-extrabold transition ${aktywna ? "bg-akcent" : "hover:bg-tlo"}`}
            >
              <Ikona className="size-5" aria-hidden /> {nazwa}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 pb-24 lg:pb-0">{children}</div>
      <nav aria-label="Menu aplikacji" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-obrys bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {pozycje.map(({ href, ikona: Ikona, nazwa, aktywna }) => (
          <Link
            key={nazwa}
            href={href}
            aria-current={aktywna ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-extrabold ${aktywna ? "text-akcent-tekst" : "text-tekst-2"}`}
          >
            <Ikona className="size-6" aria-hidden />
            {nazwa.replace(/ \(\d+\)$/, "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PrzyciskSerca({ slug, nazwa, className = "" }: { slug: string; nazwa: string; className?: string }) {
  const { ulubione, przelacz } = useUlubione();
  const jest = ulubione.has(slug);
  return (
    <button
      type="button"
      aria-pressed={jest}
      aria-label={jest ? `Usuń z ulubionych: ${nazwa}` : `Dodaj do ulubionych: ${nazwa}`}
      onClick={() => przelacz(slug)}
      className={`relative z-10 flex size-10 items-center justify-center rounded-full bg-white/95 shadow transition hover:scale-110 active:scale-90 ${className}`}
    >
      <Heart className={`size-5 transition ${jest ? "fill-akcent text-akcent-tekst" : ""}`} aria-hidden />
    </button>
  );
}
