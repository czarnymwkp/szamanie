import Image from "next/image";
import type { ReactNode } from "react";
import type { Lokal } from "@/lib/lokale";
import { motywLokalu } from "@/lib/motyw";
import IkonaTypu from "./IkonaTypu";

/**
 * Górna część karty i nagłówek strony lokalu: zdjęcie poglądowe kategorii (z podpisem), a bez zdjęcia —
 * kolor z dużą ikoną. `rozmiar` decyduje o wielkości ikony i podpowiedzi rozmiaru obrazka.
 */
export default function Baner({
  lokal,
  rozmiar,
  className = "",
  children,
}: {
  lokal: Lokal;
  rozmiar: "karta" | "strona";
  className?: string;
  children?: ReactNode;
}) {
  const { kolor, ikona, zdjecie } = motywLokalu(lokal);
  const karta = rozmiar === "karta";
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: kolor }}>
      {zdjecie ? (
        <>
          <Image
            src={zdjecie.plik}
            alt=""
            fill
            sizes={karta ? "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" : "100vw"}
            className={`object-cover ${karta ? "transition-transform duration-700 ease-out group-hover:scale-110" : ""}`}
            style={{ objectPosition: zdjecie.pozycja }}
            // baner strony lokalu to największy element na ekranie (LCP) — ładowany od razu, nie leniwie
            preload={!karta}
          />
          {/* lekkie przyciemnienie u góry, żeby etykiety na zdjęciu były czytelne */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/10" />
          <span className="absolute right-2 bottom-1.5 rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-bold text-white/90">
            zdjęcie poglądowe
          </span>
        </>
      ) : (
        <>
          <div className="wzor-kropki absolute inset-0" />
          <IkonaTypu
            ikona={ikona}
            className={
              karta
                ? "absolute top-1/2 right-6 size-16 -translate-y-1/2 text-white/90 transition-transform duration-500 ease-out group-hover:scale-115 group-hover:-rotate-6"
                : "absolute top-1/2 right-[8%] size-28 -translate-y-1/2 text-white/90 lg:size-40"
            }
          />
        </>
      )}
      {children}
    </div>
  );
}
