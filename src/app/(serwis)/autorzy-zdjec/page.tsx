import type { Metadata } from "next";
import Image from "next/image";
import { DISH_PHOTOS } from "@/lib/zdjeciaDan";
import { CATEGORY_PHOTOS } from "@/lib/zdjeciaKategorii";

export const metadata: Metadata = {
  title: "Źródła danych i zdjęć",
  description: "Skąd pochodzą dane o lokalach i zdjęcia poglądowe na szamanie.pl — źródła i licencje.",
  alternates: { canonical: "/autorzy-zdjec" },
};

type Photo = { plik: string; opis: string; autor: string; licencja: string; zrodlo: string };

function OrderList({ zdjecia, kwadrat = false }: { zdjecia: Photo[]; kwadrat?: boolean }) {
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

export default function PhotoCredits() {
  const dishes = Object.values(DISH_PHOTOS);
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="animate-wjazd text-3xl font-black lg:text-4xl">Źródła danych i zdjęć</h1>
      <h2 className="mt-8 text-xl font-black">Dane o lokalach</h2>
      <p className="mt-3 max-w-2xl font-semibold text-tekst-2">
        Nazwy, adresy, położenie i godziny otwarcia lokali pochodzą w dużej części z OpenStreetMap: ©{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="font-bold text-akcent-tekst underline">
          współtwórcy OpenStreetMap
        </a>
        , licencja ODbL. Pozostałe dane (menu, ceny, dowóz) sprawdzamy na stronach i profilach lokali albo podają je
        same lokale.
      </p>
      <h2 className="mt-10 text-xl font-black">Zdjęcia poglądowe</h2>
      <p className="mt-3 max-w-2xl animate-wjazd font-semibold text-tekst-2 [animation-delay:80ms]">
        Dopóki lokal nie doda własnych zdjęć, pokazujemy zdjęcia poglądowe jedzenia z danej kategorii i rodzaju dania. Nie
        przedstawiają dań konkretnego lokalu. Pochodzą z wolnych licencji — dziękujemy autorom. Zdjęcia na licencji CC BY-SA
        zostały przycięte i są udostępniane na tej samej licencji.
      </p>
      <h3 className="mt-8 text-lg font-black">Kategorie</h3>
      <OrderList zdjecia={Object.values(CATEGORY_PHOTOS)} />
      {dishes.length > 0 && (
        <>
          <h3 className="mt-10 text-lg font-black">Dania w menu</h3>
          <OrderList zdjecia={dishes} kwadrat />
        </>
      )}
    </div>
  );
}
