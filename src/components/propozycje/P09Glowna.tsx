"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import StatusOtwarcia from "../StatusOtwarcia";
import SzybkieAkcje from "../SzybkieAkcje";
import { useKatalog } from "../useKatalog";
import { StopkaPropozycji, prefiksLokalu, type PropsGlownej } from "./wspolne";

const PODPOWIEDZI = [
  { tekst: "Pizza", kategoria: "pizza" },
  { tekst: "Kebab", kategoria: "kebab" },
  { tekst: "Burgery", kategoria: "burgery" },
  { tekst: "Kawa", kategoria: "kawiarnie" },
  { tekst: "Lody", kategoria: "lody" },
  { tekst: "Obiad", kategoria: "restauracje" },
];

const tekstowy = (aktywny: boolean) =>
  `text-sm font-extrabold transition ${aktywny ? "text-tekst underline decoration-akcent decoration-[3px] underline-offset-[6px]" : "text-tekst-2 hover:text-tekst"}`;

// 9 · Minimal — najpierw wyszukiwarka, czysta lista bez zdjęć i ozdobników.
export default function P09Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  const k = useKatalog(lokale, miejscowosci);
  return (
    <div className="min-h-screen bg-white">
      <main id="tresc" className="mx-auto max-w-3xl px-5 pt-14 lg:pt-24">
        <div className="text-center">
          <Image src="/znak.png" alt="" width={64} height={64} priority className="mx-auto animate-unoszenie" />
          <h1 className="mt-5 animate-wjazd text-4xl font-black tracking-tight lg:text-6xl">Gdzie zjeść w Kraśniku?</h1>
          <label className="mx-auto mt-7 flex h-16 max-w-2xl animate-wjazd items-center gap-3 rounded-full border-2 border-obrys px-6 shadow-sm transition focus-within:border-tekst focus-within:shadow-lg [animation-delay:100ms]">
            <Search className="size-6 text-tekst-2" aria-hidden />
            <span className="sr-only">Szukaj lokalu</span>
            <input
              type="search"
              autoComplete="off"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Pizza, kebab, nazwa lokalu…"
              className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
            />
          </label>
          <div className="mt-4 flex animate-wjazd flex-wrap justify-center gap-2 [animation-delay:160ms]">
            {PODPOWIEDZI.map((p) => (
              <button
                key={p.tekst}
                type="button"
                aria-pressed={k.kategoria === p.kategoria}
                onClick={() => k.setKategoria(k.kategoria === p.kategoria ? "wszystko" : p.kategoria)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition ${k.kategoria === p.kategoria ? "bg-tekst text-white" : "bg-tlo hover:bg-krem"}`}
              >
                {p.tekst}
              </button>
            ))}
          </div>
          <div className="mt-6 flex animate-wjazd justify-center gap-5 [animation-delay:220ms]">
            <button type="button" onClick={k.uzyjLokalizacji} className={tekstowy(k.zLokalizacja)}>
              Blisko mnie
            </button>
            <button type="button" disabled={!k.teraz} onClick={() => k.setTylkoOtwarte(!k.tylkoOtwarte)} className={tekstowy(k.tylkoOtwarte)}>
              Otwarte teraz
            </button>
            <button type="button" onClick={() => k.setTryb(k.tryb === "zamowie" ? "wszystko" : "zamowie")} className={tekstowy(k.tryb === "zamowie")}>
              Na wynos
            </button>
          </div>
          {k.bladPozycji && <p className="mt-3 text-sm font-bold text-zamkniete">{k.bladPozycji}</p>}
        </div>

        <section id="wyniki" aria-label="Lokale" className="mt-14">
          <p className="text-xs font-black tracking-wider text-tekst-2 uppercase" aria-live="polite">
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])} · najpierw promowane
          </p>
          <ul className="mt-2 divide-y divide-obrys">
            {k.wyniki.map((l) => (
              <li key={l.id} className="group pojawianie relative flex items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-extrabold">
                    <Link href={`${prefiksLokalu(nr)}${l.slug}`} className="outline-none after:absolute after:inset-0 group-hover:underline">
                      {l.nazwa}
                    </Link>
                    {l.promowany && <span className="ml-2 align-middle text-xs font-black text-akcent-tekst">promowane</span>}
                  </h3>
                  <p className="truncate text-sm font-semibold text-tekst-2">
                    {opisLokalu(l)} · {pelnyAdres(l)}
                    {k.odleglosc(l) && ` · ${k.odleglosc(l)}`}
                  </p>
                  <StatusOtwarcia godziny={l.godziny} className="text-sm" />
                </div>
                <SzybkieAkcje lokal={l} />
              </li>
            ))}
          </ul>
          {k.wyniki.length === 0 && (
            <p className="py-10 text-center font-semibold text-tekst-2">
              Brak wyników.{" "}
              <button type="button" onClick={k.wyczysc} className="font-black text-tekst underline">
                Wyczyść
              </button>
            </p>
          )}
        </section>
      </main>
      <StopkaPropozycji className="mt-10 [&>div]:max-w-3xl" />
    </div>
  );
}
