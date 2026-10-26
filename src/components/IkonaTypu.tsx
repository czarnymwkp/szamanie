import {
  Beer,
  Coffee,
  Hamburger,
  IceCreamCone,
  LayoutGrid,
  Pizza,
  Sandwich,
  Soup,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import type { KluczIkony } from "@/lib/motyw";

export default function IkonaTypu({ ikona, className }: { ikona: KluczIkony; className?: string }) {
  const p = { className, "aria-hidden": true } as const;
  switch (ikona) {
    case "wszystko":
      return <LayoutGrid {...p} />;
    case "pizza":
      return <Pizza {...p} />;
    case "burger":
      return <Hamburger {...p} />;
    case "kebab":
      return <Sandwich {...p} />;
    case "zupa":
      return <Soup {...p} />;
    case "kawa":
      return <Coffee {...p} />;
    case "lody":
      return <IceCreamCone {...p} />;
    case "piwo":
      return <Beer {...p} />;
    case "wino":
      return <Wine {...p} />;
    default:
      return <UtensilsCrossed {...p} />;
  }
}
