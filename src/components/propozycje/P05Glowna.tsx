"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { odmiana, opisLokalu } from "@/lib/nazwy";
import EtykietaPromo from "../EtykietaPromo";
import MapaLokali from "../MapaLokali";
import Miniatura from "../Miniatura";
import StatusOtwarcia from "../StatusOtwarcia";
import SzybkieAkcje from "../SzybkieAkcje";
import { useKatalog } from "../useKatalog";
import { prefiksLokalu, type PropsGlownej } from "./wspolne";

const chip = (aktywny: boolean) =>
  `flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-extrabold transition disabled:opacity-50 ${
    aktywny ? "border-tekst bg-tekst text-white" : "border-obrys-2 bg-white hover:border-tekst"
  }`;

// 5 · Mapa + lista — jak w Mapach Google: lista po lewej, mapa z pinezkami po prawej (na telefonie mapa u góry).
export default function P05Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  const k = useKatalog(lokale, miejscowosci);
  const [wybrany, setWybrany] = useState<number | null>(null);
  const wybierz = useCallback((id: number) => {
    setWybrany(id);
    document.getElementById(`lokal-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white lg:h-screen">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-obrys px-4">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={111} height={24} priority className="h-6 w-auto" />
        <label className="hidden max-w-md flex-1 items-center gap-2 rounded-full bg-tlo px-4 py-2 md:flex">
          <Search className="size-4 text-tekst-2" aria-hidden />
          <span className="sr-only">Szukaj lokalu</span>
          <input
            type="search"
            value={k.szukaj}
            onChange={(e) => k.setSzukaj(e.target.value)}
            placeholder="Szukaj na mapie: pizza, kebab, nazwa…"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
          />
        </label>
        <Link href="/dla-lokali" className="ml-auto text-sm font-extrabold hover:text-akcent-tekst">
          Dla lokali
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[26rem_1fr]">
        <MapaLokali
          lokale={k.wyniki}
          wybrany={wybrany}
          onWybierz={wybierz}
          className="sticky top-0 h-[42svh] shrink-0 lg:order-2 lg:h-full"
        />

        <section aria-label="Lokale" className="relative z-10 -mt-5 flex min-h-0 flex-col rounded-t-3xl bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] lg:mt-0 lg:rounded-none lg:shadow-[8px_0_24px_rgba(0,0,0,0.06)]">
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-obrys-2 lg:hidden" aria-hidden />
          <div className="space-y-3 p-4 pb-2">
            <label className="flex items-center gap-2 rounded-full bg-tlo px-4 py-2.5 md:hidden">
              <Search className="size-4 text-tekst-2" aria-hidden />
              <span className="sr-only">Szukaj lokalu</span>
              <input
                type="search"
                value={k.szukaj}
                onChange={(e) => k.setSzukaj(e.target.value)}
                placeholder="Pizza, kebab, nazwa…"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
              />
            </label>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
              <button type="button" onClick={k.uzyjLokalizacji} className={chip(k.zLokalizacja)}>
                <LocateFixed className="size-4" aria-hidden /> Blisko mnie
              </button>
              <button
                type="button"
                aria-pressed={k.tylkoOtwarte}
                disabled={!k.teraz}
                onClick={() => k.setTylkoOtwarte(!k.tylkoOtwarte)}
                className={chip(k.tylkoOtwarte)}
              >
                Otwarte teraz
              </button>
              <select
                value={k.kategoria}
                onChange={(e) => k.setKategoria(e.target.value)}
                aria-label="Kategoria"
                className={`${chip(k.kategoria !== "wszystko")} appearance-none`}
              >
                {k.kategorie.map((kat) => (
                  <option key={kat.id} value={kat.id}>
                    {kat.nazwa}
                  </option>
                ))}
              </select>
            </div>
            {k.bladPozycji && <p className="text-sm font-bold text-zamkniete">{k.bladPozycji}</p>}
            <p className="text-sm font-black" aria-live="polite">
              {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])} na mapie
            </p>
          </div>

          <ul className="min-h-0 flex-1 divide-y divide-obrys overflow-y-auto px-2 pb-20">
            {k.wyniki.map((l) => (
              <li
                key={l.id}
                id={`lokal-${l.id}`}
                onMouseEnter={() => setWybrany(l.id)}
                className={`group relative flex items-center gap-3 rounded-2xl p-2 transition ${wybrany === l.id ? "bg-krem" : "hover:bg-tlo"}`}
              >
                <Miniatura lokal={l} className="size-16 shrink-0 rounded-xl" sizes="64px" dopisek={false} />
                <div className="min-w-0 flex-1">
                  {l.promowany && <EtykietaPromo className="mb-0.5 scale-90 origin-left" />}
                  <h3 className="truncate font-black">
                    <Link href={`${prefiksLokalu(nr)}${l.slug}`} className="outline-none after:absolute after:inset-0">
                      {l.nazwa}
                    </Link>
                  </h3>
                  <p className="truncate text-xs font-bold text-tekst-2">
                    {opisLokalu(l)}
                    {k.odleglosc(l) && ` · ${k.odleglosc(l)}`}
                  </p>
                  <StatusOtwarcia godziny={l.godziny} className="text-xs" />
                </div>
                <SzybkieAkcje lokal={l} />
              </li>
            ))}
            {k.wyniki.length === 0 && (
              <li className="p-6 text-center text-sm font-semibold text-tekst-2">
                Nic tu nie ma.{" "}
                <button type="button" onClick={k.wyczysc} className="font-black text-akcent-tekst underline">
                  Wyczyść filtry
                </button>
              </li>
            )}
          </ul>
          <p className="px-4 pb-3 text-[11px] font-semibold text-tekst-2">
            Zdjęcia na liście są poglądowe. Dane: © współtwórcy OpenStreetMap.
          </p>
        </section>
      </div>
    </div>
  );
}
