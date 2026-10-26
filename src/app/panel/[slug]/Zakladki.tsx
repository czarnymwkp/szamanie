"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, BookOpen, Store, Truck } from "lucide-react";

export default function Zakladki({ slug }: { slug: string }) {
  const sciezka = usePathname();
  const zakladki = [
    { href: `/panel/${slug}`, nazwa: "Dane lokalu", Ikona: Store },
    { href: `/panel/${slug}/menu`, nazwa: "Menu i ceny", Ikona: BookOpen },
    { href: `/panel/${slug}/dostawa`, nazwa: "Dostawa", Ikona: Truck },
    { href: `/panel/${slug}/promocje`, nazwa: "Promocje", Ikona: BadgePercent },
  ];
  return (
    <nav aria-label="Sekcje panelu lokalu" className="-mx-4 mt-5 overflow-x-auto px-4">
      <ul className="flex w-max gap-2 border-b border-obrys pb-px sm:w-auto">
        {zakladki.map(({ href, nazwa, Ikona }) => {
          const aktywna = sciezka === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktywna ? "page" : undefined}
                className={`-mb-px flex items-center gap-2 border-b-[3px] px-3 py-2.5 text-sm font-extrabold whitespace-nowrap transition ${
                  aktywna ? "border-akcent text-tekst" : "border-transparent text-tekst-2 hover:text-tekst"
                }`}
              >
                <Ikona className="size-4" aria-hidden /> {nazwa}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
