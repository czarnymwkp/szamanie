import Header from "@/components/serwis/Naglowek";
import Analytics from "@/components/serwis/Statystyki";
import Footer from "@/components/serwis/Stopka";
import { PAPER, SketchBackground } from "@/components/szkic/szkic";

// Cały serwis w wyglądzie „Szkicownik” (wybrany 29.10): papier w kropki i rysowane ikony jedzenia w tle.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div style={PAPER} className="m-papier relative isolate flex flex-1 flex-col overflow-x-clip text-tekst">
      <SketchBackground />
      <Header />
      <main id="tresc" className="flex-1">
        {children}
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}
