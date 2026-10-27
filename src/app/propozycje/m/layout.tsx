import { Suspense } from "react";
import PrzelacznikM from "@/components/mobilne/PrzelacznikM";
import "@/components/mobilne/mobilne.css";

export default function UkladPropozycjiM({ children }: LayoutProps<"/propozycje/m">) {
  return (
    <>
      {children}
      {/* przełącznik czyta adres strony (usePathname), więc nie może blokować wspólnego szkieletu */}
      <Suspense fallback={null}>
        <PrzelacznikM />
      </Suspense>
    </>
  );
}
