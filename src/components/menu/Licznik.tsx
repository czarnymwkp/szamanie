import { Minus, Plus } from "lucide-react";

/** Okrągły „+”, a po dodaniu: − ilość +. */
export default function Licznik({
  ile,
  nazwa,
  dodaj,
  zmien,
}: {
  ile: number;
  nazwa: string;
  dodaj: () => void;
  zmien: (o: number) => void;
}) {
  if (!ile) {
    return (
      <button
        type="button"
        onClick={dodaj}
        aria-label={`Dodaj do listy: ${nazwa}`}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-akcent text-na-akcencie shadow-sm transition hover:scale-110 active:scale-95"
      >
        <Plus className="size-5" aria-hidden />
      </button>
    );
  }
  return (
    <div className="flex h-10 shrink-0 animate-wjazd items-center rounded-full bg-tekst text-tlo [animation-duration:0.3s]">
      <button type="button" onClick={() => zmien(-1)} aria-label={`Odejmij: ${nazwa}`} className="flex size-10 items-center justify-center">
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="min-w-4 text-center font-black" aria-live="polite">
        {ile}
      </span>
      <button type="button" onClick={() => zmien(1)} aria-label={`Dodaj jeszcze: ${nazwa}`} className="flex size-10 items-center justify-center">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
