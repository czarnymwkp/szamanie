import Image from "next/image";
import Link from "next/link";
import { hand } from "../szkic/szkic";

export default function Header({ start = "/" }: { start?: string }) {
  return (
    <header className="naglowek sticky top-0 z-40 border-b-2 border-dashed border-obrys-2 bg-[#fffdf7]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-8 px-5">
        <Link href={start} aria-label="szamanie.pl — strona główna" className="transition hover:opacity-80">
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-6 w-auto" />
        </Link>
        <nav aria-label="Główne" className="hidden text-[15px] font-extrabold md:block">
          <Link href={`${start === "/" ? "" : start}/#wyniki`} className="transition hover:text-akcent-tekst">
            Wszystkie lokale
          </Link>
        </nav>
        <span aria-hidden className={`${hand.className} ml-auto hidden -rotate-3 text-xl text-akcent-tekst sm:block`}>
          smacznego!
        </span>
        <Link
          href="/dla-lokali"
          className="m-reczna-ramka ml-auto border-2 border-tekst bg-white px-3.5 py-1.5 text-sm font-extrabold shadow-[3px_3px_0_#1d1b19] transition active:translate-y-0.5 active:shadow-none sm:ml-0"
        >
          Dla lokali
        </Link>
      </div>
    </header>
  );
}
