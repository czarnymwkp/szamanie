import type { Metadata } from "next";
import Link from "next/link";
import { ChartColumn, Images, LayoutTemplate, LogIn, Mail, ShoppingCart, TrendingUp, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";
import SketchMascot from "@/components/SketchMascot";
import { Underline, hand } from "@/components/sketch/sketch";
import { CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Dla lokali — wyróżnij swój lokal",
  description:
    "Prowadzisz restaurację, bar lub kawiarnię w powiecie kraśnickim? Wyróżnij lokal na szamanie.pl i dodaj menu z cenami.",
  alternates: { canonical: "/dla-lokali" },
};

const PACKAGES: { ikona: ReactNode; nazwa: string; opis: string; wkrotce?: boolean }[] = [
  {
    ikona: <TrendingUp className="size-6 text-tekst" aria-hidden />,
    nazwa: "Wyróżnienie TOP",
    opis: "Lokal na górze listy i w wynikach filtrów, z etykietą „Promowane”.",
  },
  {
    ikona: <UtensilsCrossed className="size-6 text-tekst" aria-hidden />,
    nazwa: "Menu z cenami i promocje",
    opis: "Dania, ceny i promocje na stronie lokalu. Zmieniasz je sam w panelu lokalu.",
  },
  {
    ikona: <Images className="size-6 text-tekst" aria-hidden />,
    nazwa: "Galeria zdjęć",
    opis: "Zdjęcia zamiast kolorowego banera, na liście i na stronie lokalu.",
    wkrotce: true,
  },
  {
    ikona: <LayoutTemplate className="size-6 text-tekst" aria-hidden />,
    nazwa: "Własny wygląd strony",
    opis: "Wybierasz jeden z gotowych szablonów strony swojego lokalu.",
    wkrotce: true,
  },
  {
    ikona: <ShoppingCart className="size-6 text-tekst" aria-hidden />,
    nazwa: "Zamówienia do hurtowni",
    opis: "Składasz zamówienie u swojej hurtowni prosto z panelu i masz całą historię.",
    wkrotce: true,
  },
  {
    ikona: <ChartColumn className="size-6 text-tekst" aria-hidden />,
    nazwa: "Statystyki",
    opis: "Ile osób oglądało lokal, kliknęło w telefon i w nawigację.",
    wkrotce: true,
  },
];

const bigButton =
  "m-reczna-ramka inline-flex h-14 items-center justify-center gap-2 border-[2.5px] border-tekst px-6 text-lg font-black shadow-[4px_4px_0_#1d1b19] transition active:translate-y-0.5 active:shadow-none";

/** Offer for venues in the „Sketchbook” look: sticky notes with packages, notes and handwritten remarks. */
export default function ForVenues() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-6">
      <section className="relative pt-8">
        <SketchMascot className="pointer-events-none absolute top-0 -right-2 w-28 rotate-3 animate-wjazd [animation-delay:300ms] lg:right-6 lg:w-40" />
        <p className={`${hand.className} ml-1 rotate-[-1.5deg] text-2xl text-tekst-2`}>dla restauracji, barów i kawiarni</p>
        <h1 className="mt-1 max-w-2xl animate-wjazd pr-24 text-[2.6rem] leading-[0.98] font-black tracking-tight lg:pr-0 lg:text-6xl">
          Twój lokal{" "}
          <span className={`${hand.className} relative inline-block -rotate-2 text-[3.8rem] text-akcent-tekst lg:text-[5.5rem]`}>
            wyżej
            <Underline className="absolute -bottom-2 left-0 h-4 w-full" />
          </span>{" "}
          w wynikach
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed font-semibold">
          Podstawowy wpis na szamanie.pl jest bezpłatny. Za dodatki płacisz tylko wtedy, gdy chcesz się wyróżnić.
        </p>
        <div className="relative mt-10 flex flex-wrap gap-3">
          <span className={`${hand.className} pointer-events-none absolute -top-8 left-6 rotate-[-8deg] text-xl text-akcent-tekst`}>
            zacznij tu ↓
          </span>
          <Link href="/panel" prefetch={false} className={`${bigButton} bg-akcent text-na-akcencie`}>
            <LogIn className="size-5" aria-hidden /> Panel lokalu
          </Link>
          {CONTACT_EMAIL && (
            <a href={`mailto:${CONTACT_EMAIL}`} className={`${bigButton} bg-white`}>
              <Mail className="size-5" aria-hidden /> Napisz do nas
            </a>
          )}
        </div>
      </section>

      <section aria-labelledby="pakiety" className="mt-12">
        <h2 id="pakiety" className={`${hand.className} text-[2.1rem] leading-none`}>
          Co możesz dostać
        </h2>
        <ul className="mt-6 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <li
              key={p.nazwa}
              className="pojawianie m-reczna-ramka relative border-2 border-tekst bg-white p-5 shadow-[4px_4px_0_#1d1b19] transition hover:rotate-0"
              style={{ rotate: `${[-1, 0.8, -0.5][i % 3]}deg` }}
            >
              <span className="flex size-12 -rotate-6 items-center justify-center rounded-full border-2 border-tekst bg-[#ffd36e]">
                {p.ikona}
              </span>
              {p.wkrotce && (
                <span className={`${hand.className} absolute top-3 right-4 rotate-6 text-2xl text-akcent-tekst`}>wkrótce!</span>
              )}
              <h3 className="mt-4 text-lg font-black">{p.nazwa}</h3>
              <p className="mt-1 text-sm leading-relaxed font-semibold text-tekst-2">{p.opis}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <section
          id="wpis"
          aria-labelledby="wpis-tytul"
          className="pojawianie scroll-mt-24 rotate-[-1.2deg] bg-[#fff3a8] p-6 shadow-[2px_8px_16px_rgba(0,0,0,0.12)]"
        >
          <h2 id="wpis-tytul" className={`${hand.className} text-3xl`}>
            Bezpłatny wpis
          </h2>
          <p className="mt-2 leading-relaxed font-semibold">
            Dane są nieaktualne? Wejdź do panelu lokalu i popraw menu, ceny albo godziny sam. Nie ma Twojego lokalu na
            liście? Napisz do nas, a dodamy go za darmo.
          </p>
          {!CONTACT_EMAIL && <p className="mt-3 text-sm font-bold text-tekst-2">Formularz kontaktowy wkrótce.</p>}
        </section>
        <section
          aria-labelledby="kolejnosc"
          className="pojawianie m-tasma relative rotate-[0.8deg] bg-white p-6 pt-7 shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
        >
          <h2 id="kolejnosc" className={`${hand.className} text-3xl`}>
            Jak ustalamy kolejność
          </h2>
          <p className="mt-2 leading-relaxed font-semibold text-tekst-2">
            Najpierw pokazujemy lokale z pakietem TOP, oznaczone etykietą „Promowane”. Pozostałe są ułożone alfabetycznie.
          </p>
        </section>
      </div>
    </div>
  );
}
