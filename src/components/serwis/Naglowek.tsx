import Image from "next/image";
import Link from "next/link";

export default function Naglowek({ start = "/" }: { start?: string }) {
  return (
    <header className="naglowek sticky top-0 z-40 border-b border-obrys bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
        <Link href={start} aria-label="szamanie.pl — strona główna" className="transition hover:opacity-80">
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-7 w-auto" />
        </Link>
        <nav aria-label="Główne" className="hidden text-[15px] font-extrabold md:block">
          <Link href={`${start === "/" ? "" : start}/#wyniki`} className="transition hover:text-akcent-tekst">
            Wszystkie lokale
          </Link>
        </nav>
        <Link
          href="/dla-lokali"
          className="ml-auto rounded-full border-2 border-tekst px-3.5 py-1.5 text-sm font-extrabold transition hover:bg-tekst hover:text-white"
        >
          Dla lokali
        </Link>
      </div>
    </header>
  );
}
