import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChartColumn, Images, LayoutTemplate, LogIn, Mail, ShoppingCart, TrendingUp, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/konfiguracja";

export const metadata: Metadata = {
  title: "Dla lokali — wyróżnij swój lokal",
  description:
    "Prowadzisz restaurację, bar lub kawiarnię w powiecie kraśnickim? Wyróżnij lokal na szamanie.pl i dodaj menu z cenami.",
  alternates: { canonical: "/dla-lokali" },
};

const PAKIETY: { ikona: ReactNode; nazwa: string; opis: string; wkrotce?: boolean }[] = [
  {
    ikona: <TrendingUp className="size-6" aria-hidden />,
    nazwa: "Wyróżnienie TOP",
    opis: "Lokal na górze listy i w wynikach filtrów, z etykietą „Promowane”.",
  },
  {
    ikona: <UtensilsCrossed className="size-6" aria-hidden />,
    nazwa: "Menu z cenami i promocje",
    opis: "Dania, ceny i promocje na stronie lokalu. Zmieniasz je sam w panelu lokalu.",
  },
  {
    ikona: <Images className="size-6" aria-hidden />,
    nazwa: "Galeria zdjęć",
    opis: "Zdjęcia zamiast kolorowego banera, na liście i na stronie lokalu.",
    wkrotce: true,
  },
  {
    ikona: <LayoutTemplate className="size-6" aria-hidden />,
    nazwa: "Własny wygląd strony",
    opis: "Wybierasz jeden z gotowych szablonów strony swojego lokalu.",
    wkrotce: true,
  },
  {
    ikona: <ShoppingCart className="size-6" aria-hidden />,
    nazwa: "Zamówienia do hurtowni",
    opis: "Składasz zamówienie u swojej hurtowni prosto z panelu i masz całą historię.",
    wkrotce: true,
  },
  {
    ikona: <ChartColumn className="size-6" aria-hidden />,
    nazwa: "Statystyki",
    opis: "Ile osób oglądało lokal, kliknęło w telefon i w nawigację.",
    wkrotce: true,
  },
];

export default function DlaLokali() {
  return (
    <>
      <section className="relative overflow-hidden rounded-b-[2.25rem] bg-akcent">
        <Image
          src="/znak.png"
          alt=""
          width={220}
          height={220}
          priority
          className="pointer-events-none absolute -right-10 -bottom-12 w-48 -rotate-12 animate-unoszenie opacity-25 lg:right-16 lg:bottom-auto lg:top-10 lg:w-64 lg:opacity-100"
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-14 lg:pt-16 lg:pb-20">
          <p className="animate-wjazd text-sm font-black tracking-wider uppercase">Dla restauracji, barów i kawiarni</p>
          <h1 className="mt-2 max-w-2xl animate-wjazd text-4xl leading-[1.05] font-black tracking-tight [animation-delay:80ms] lg:text-6xl">
            Twój lokal wyżej w wynikach
          </h1>
          <p className="mt-4 max-w-xl animate-wjazd text-base leading-relaxed font-semibold [animation-delay:160ms] lg:text-lg">
            Podstawowy wpis na szamanie.pl jest bezpłatny. Za dodatki płacisz tylko wtedy, gdy chcesz się wyróżnić.
          </p>
          <div className="mt-6 flex animate-wjazd flex-wrap gap-3 [animation-delay:240ms]">
            <Link
              href="/panel"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full bg-tekst px-5 py-3 font-black text-white transition hover:-translate-y-0.5"
            >
              <LogIn className="size-5" aria-hidden /> Panel lokalu
            </Link>
            {CONTACT_EMAIL && (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-tekst px-5 py-3 font-black transition hover:-translate-y-0.5"
              >
                <Mail className="size-5" aria-hidden /> Napisz do nas
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <section aria-labelledby="pakiety" className="pt-10">
          <h2 id="pakiety" className="text-2xl font-black lg:text-3xl">
            Co możesz dostać
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PAKIETY.map((p) => (
              <li
                key={p.nazwa}
                className="pojawianie rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.05)] transition hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-full bg-krem text-akcent-tekst">
                    {p.ikona}
                  </span>
                  {p.wkrotce && (
                    <span className="rounded-full bg-obrys px-2.5 py-1 text-xs font-extrabold text-tekst-2">Wkrótce</span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-black">{p.nazwa}</h3>
                <p className="mt-1 text-sm leading-relaxed font-semibold text-tekst-2">{p.opis}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <section id="wpis" aria-labelledby="wpis-tytul" className="pojawianie scroll-mt-24 rounded-2xl bg-krem p-6">
            <h2 id="wpis-tytul" className="text-xl font-black">
              Bezpłatny wpis
            </h2>
            <p className="mt-2 leading-relaxed font-semibold">
              Dane są nieaktualne? Wejdź do panelu lokalu i popraw menu, ceny albo godziny sam. Nie ma Twojego
              lokalu na liście? Napisz do nas, a dodamy go za darmo.
            </p>
            {!CONTACT_EMAIL && <p className="mt-3 text-sm font-bold text-tekst-2">Formularz kontaktowy wkrótce.</p>}
          </section>
          <section aria-labelledby="kolejnosc" className="pojawianie rounded-2xl bg-white p-6 shadow-sm">
            <h2 id="kolejnosc" className="text-xl font-black">
              Jak ustalamy kolejność
            </h2>
            <p className="mt-2 leading-relaxed font-semibold text-tekst-2">
              Najpierw pokazujemy lokale z pakietem TOP, oznaczone etykietą „Promowane”. Pozostałe są ułożone
              alfabetycznie.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
