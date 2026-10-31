import Image from "next/image";
import type { Venue } from "@/lib/lokale";
import { venueTheme } from "@/lib/motyw";
import TypeIcon from "./IkonaTypu";

/**
 * Zdjęcie lokalu w dowolnym kadrze (rozmiar z className). Dopóki lokal nie ma własnych zdjęć — zdjęcie poglądowe
 * (każdy lokal inne — z jego menu albo kuchni) z dyskretnym dopiskiem, a bez zdjęcia — kolor z ikoną.
 */
export default function Thumbnail({
  lokal,
  className = "",
  sizes = "160px",
  priorytet = false,
  dopisek = true,
}: {
  lokal: Venue;
  className?: string;
  sizes?: string;
  priorytet?: boolean;
  dopisek?: boolean;
}) {
  const { kolor, ikona, zdjecie: zKategorii } = venueTheme(lokal);
  // każdy lokal ma swoje zdjęcie poglądowe (pobierzLokale); zdjęcie kategorii tylko, gdy go nie dostał
  const photo = lokal.zdjecie ?? zKategorii;
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: kolor }}>
      {photo ? (
        <>
          <Image
            src={photo.plik}
            alt=""
            fill
            sizes={sizes}
            priority={priorytet}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            style={{ objectPosition: photo.pozycja }}
          />
          {dopisek && (
            <span className="absolute right-1 bottom-1 rounded bg-black/45 px-1 text-[9px] leading-[14px] font-bold text-white/90">
              poglądowe
            </span>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <TypeIcon ikona={ikona} className="size-1/3 text-white/90" />
        </div>
      )}
    </div>
  );
}
