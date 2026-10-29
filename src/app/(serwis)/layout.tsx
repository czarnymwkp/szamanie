import Naglowek from "@/components/serwis/Naglowek";
import Stopka from "@/components/serwis/Stopka";
import { PAPIER, TloSzkic } from "@/components/szkic/szkic";

// Cały serwis w wyglądzie „Szkicownik” (wybrany 29.10): papier w kropki i rysowane ikony jedzenia w tle.
export default function UkladSerwisu({ children }: LayoutProps<"/">) {
  return (
    <div style={PAPIER} className="m-papier relative isolate flex flex-1 flex-col overflow-x-clip text-tekst">
      <TloSzkic />
      <Naglowek />
      <main id="tresc" className="flex-1">
        {children}
      </main>
      <Stopka />
    </div>
  );
}
