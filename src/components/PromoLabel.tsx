import { Sparkles } from "lucide-react";

// Płatne wyróżnienie musi być wyraźnie oznaczone (przepisy o nieuczciwych praktykach rynkowych).
export default function PromoLabel({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-tekst px-2.5 py-1 text-xs font-extrabold text-tlo ${className}`}
    >
      <Sparkles className="size-3.5 animate-migotanie" aria-hidden />
      Promowane
    </span>
  );
}
