import Naglowek from "@/components/serwis/Naglowek";
import Stopka from "@/components/serwis/Stopka";

export default function UkladSerwisu({ children }: LayoutProps<"/">) {
  return (
    <>
      <Naglowek />
      <main id="tresc" className="flex-1">
        {children}
      </main>
      <Stopka />
    </>
  );
}
