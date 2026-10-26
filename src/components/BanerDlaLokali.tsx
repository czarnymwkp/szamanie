import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Czarny pas „Prowadzisz lokal w Kraśniku?” z odnośnikiem do pakietów. */
export default function BanerDlaLokali() {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-5">
      <div className="pojawianie relative overflow-hidden rounded-[1.4rem] bg-tekst px-6 py-7 text-white lg:flex lg:items-center lg:justify-between lg:px-12 lg:py-12">
        <Image
          src="/znak.png"
          alt=""
          width={180}
          height={180}
          className="pointer-events-none absolute -right-5 -bottom-7 w-32 -rotate-[10deg] animate-unoszenie lg:top-1/2 lg:right-12 lg:bottom-auto lg:w-44 lg:-translate-y-1/2"
        />
        <div className="relative max-w-60 lg:max-w-lg">
          <h2 className="text-[1.4rem] leading-tight font-black lg:text-4xl">Prowadzisz lokal w Kraśniku?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#e9e2da] lg:text-lg">
            Wyróżnij go na szamanie.pl: wyżej na liście, galeria zdjęć, więcej gości.
          </p>
        </div>
        <Link
          href="/dla-lokali"
          className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-akcent px-5 py-3 font-black text-tekst transition-all hover:gap-3 lg:mt-0 lg:mr-52"
        >
          Sprawdź pakiety <ArrowRight className="size-[18px]" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
