"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, BookOpen, Store, Truck } from "lucide-react";

export default function Tabs({ slug }: { slug: string }) {
  const path = usePathname();
  const tabs = [
    // short names on a phone — four tabs fit in one row
    { href: `/panel/${slug}`, nazwa: "Dane lokalu", krotko: "Dane", Ikona: Store },
    { href: `/panel/${slug}/menu`, nazwa: "Menu i ceny", krotko: "Menu", Ikona: BookOpen },
    { href: `/panel/${slug}/dostawa`, nazwa: "Dostawa", krotko: "Dostawa", Ikona: Truck },
    { href: `/panel/${slug}/promocje`, nazwa: "Promocje", krotko: "Promocje", Ikona: BadgePercent },
  ];
  return (
    <nav aria-label="Sekcje panelu lokalu" className="-mx-4 mt-5 overflow-x-auto px-4">
      <ul className="flex w-max gap-1 border-b border-obrys pb-px sm:w-auto sm:gap-2">
        {tabs.map(({ href, nazwa, krotko, Ikona }) => {
          const active = path === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px flex items-center gap-1.5 border-b-[3px] px-2.5 py-2.5 text-sm font-extrabold whitespace-nowrap transition sm:gap-2 sm:px-3 ${
                  active ? "border-akcent text-tekst" : "border-transparent text-tekst-2 hover:text-tekst"
                }`}
              >
                <Ikona className="size-4" aria-hidden />
                <span className="sm:hidden">{krotko}</span>
                <span className="hidden sm:inline">{nazwa}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
