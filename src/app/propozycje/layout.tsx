import type { Metadata } from "next";
import { Suspense } from "react";
import Przelacznik from "@/components/propozycje/Przelacznik";

export const metadata: Metadata = {
  title: "Propozycje wyglądu",
  robots: { index: false, follow: false },
};

export default function UkladPropozycji({ children }: LayoutProps<"/propozycje">) {
  return (
    <>
      {children}
      {/* przełącznik czyta adres strony (usePathname), więc nie może blokować wspólnego szkieletu */}
      <Suspense fallback={null}>
        <Przelacznik />
      </Suspense>
    </>
  );
}
