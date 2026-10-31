import Image from "next/image";
import type { ReactNode } from "react";
import type { Venue } from "@/lib/venues";
import { venueTheme } from "@/lib/categoryTheme";
import TypeIcon from "./TypeIcon";

/**
 * Top part of a card and the header of a venue page: an illustrative category photo (with a caption), or without a
 * photo — a color with a large icon. `rozmiar` sets the icon size and the image size hint.
 */
export default function Banner({
  lokal,
  rozmiar,
  className = "",
  children,
}: {
  lokal: Venue;
  rozmiar: "karta" | "strona";
  className?: string;
  children?: ReactNode;
}) {
  const { kolor, ikona, zdjecie } = venueTheme(lokal);
  const card = rozmiar === "karta";
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: kolor }}>
      {zdjecie ? (
        <>
          <Image
            src={zdjecie.plik}
            alt=""
            fill
            sizes={card ? "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" : "100vw"}
            className={`object-cover ${card ? "transition-transform duration-700 ease-out group-hover:scale-110" : ""}`}
            style={{ objectPosition: zdjecie.pozycja }}
            // the venue page banner is the largest element on screen (LCP) — loaded right away, not lazily
            preload={!card}
          />
          {/* slight darkening at the top, so the labels on the photo stay readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/10" />
          <span className="absolute right-2 bottom-1.5 rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-bold text-white/90">
            zdjęcie poglądowe
          </span>
        </>
      ) : (
        <>
          <div className="wzor-kropki absolute inset-0" />
          <TypeIcon
            ikona={ikona}
            className={
              card
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
