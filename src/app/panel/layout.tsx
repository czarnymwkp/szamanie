import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import HeaderAccount from "./HeaderAccount";

export const metadata: Metadata = {
  title: { default: "Panel lokalu", template: "%s · Panel lokalu" },
  robots: { index: false, follow: false },
};

// The panel depends on the signed-in account (cookie), so there is nothing to prerender — pages wait for the server.
export const instant = false;

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-obrys bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4">
          <Link href="/" aria-label="szamanie.pl — strona główna" className="shrink-0 transition hover:opacity-80">
            <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto sm:h-7" />
          </Link>
          <Link href="/panel" className="rounded-full bg-krem px-3 py-1 text-sm font-black transition hover:bg-obrys">
            Panel lokalu
          </Link>
          <Suspense fallback={null}>
            <HeaderAccount />
          </Suspense>
        </div>
      </header>
      <main id="tresc" className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-24 sm:pt-10">
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </main>
    </>
  );
}

function Loading() {
  return (
    <div aria-busy className="animate-pulse space-y-4">
      <div className="h-9 w-2/3 rounded-xl bg-obrys" />
      <div className="h-40 rounded-2xl bg-obrys/70" />
      <div className="h-40 rounded-2xl bg-obrys/70" />
    </div>
  );
}
