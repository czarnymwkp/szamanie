import type { Metadata } from "next";
import Image from "next/image";
import { ZDJECIA_DAN } from "@/lib/zdjeciaDan";
import { ZDJECIA_KATEGORII } from "@/lib/zdjeciaKategorii";

export const metadata: Metadata = {
  title: "Autorzy zdjęć",
  description: "Źródła i licencje zdjęć poglądowych używanych na szamanie.pl.",
  alternates: { canonical: "/autorzy-zdjec" },
};

type Zdjecie = { plik: string; opis: string; autor: string; licencja: string; zrodlo: string };

function Lista({ zdjecia, kwadrat = false }: { zdjecia: Zdjecie[]; kwadrat?: boolean }) {
  return (
    <ul className="mt-5 grid gap-4 sm:grid-cols-2">
      {zdjecia.map((z) => (
        <li key={z.plik} className="pojawianie flex gap-4 rounded-2xl bg-white p-3 shadow-sm">
          <Image
            src={z.plik}
            alt={z.opis}
            width={128}
            height={64}
            className={`${kwadrat ? "size-16" : "h-16 w-32"} shrink-0 rounded-xl object-cover`}
          />
          <div className="min-w-0 text-sm">
            <p className="font-black">{z.opis}</p>
            <p className="font-semibold text-tekst-2">
              {z.autor} · {z.licencja}
            </p>
            <a href={z.zrodlo} target="_blank" rel="noopener" className="font-bold text-akcent-tekst underline">
              źródło
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AutorzyZdjec() {
  const dania = Object.values(ZDJECIA_DAN);
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="animate-wjazd text-3xl font-black lg:text-4xl">Autorzy zdjęć</h1>
      <p className="mt-3 max-w-2xl animate-wjazd font-semibold text-tekst-2 [animation-delay:80ms]">
        Dopóki lokal nie doda własnych zdjęć, pokazujemy zdjęcia poglądowe jedzenia z danej kategorii i rodzaju dania. Nie
        przedstawiają dań konkretnego lokalu. Pochodzą z wolnych licencji — dziękujemy autorom. Zdjęcia na licencji CC BY-SA
        zostały przycięte i są udostępniane na tej samej licencji.
      </p>
      <h2 className="mt-8 text-xl font-black">Kategorie</h2>
      <Lista zdjecia={Object.values(ZDJECIA_KATEGORII)} />
      {dania.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-black">Dania w menu</h2>
          <Lista zdjecia={dania} kwadrat />
        </>
      )}
    </div>
  );
}
