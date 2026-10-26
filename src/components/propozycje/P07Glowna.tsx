"use client";

import Image from "next/image";
import Link from "next/link";
import { LocateFixed, Search, Sparkles } from "lucide-react";
import type { Lokal } from "@/lib/lokale";
import { odmiana, opisLokalu } from "@/lib/nazwy";
import { ZDJECIA_KATEGORII, type KluczZdjecia } from "@/lib/zdjeciaKategorii";
import EtykietaPromo from "../EtykietaPromo";
import Miniatura from "../Miniatura";
import StatusOtwarcia from "../StatusOtwarcia";
import SzybkieAkcje from "../SzybkieAkcje";
import { useKatalog } from "../useKatalog";
import { StopkaPropozycji, prefiksLokalu, type PropsGlownej } from "./wspolne";

const ZDJECIE_KATEGORII: Record<string, KluczZdjecia> = {
  pizza: "pizza",
  kebab: "kebab",
  burgery: "burger",
  restauracje: "restauracja",
  fastfood: "fastfood",
  kawiarnie: "kawa",
  lody: "lody",
  azjatycka: "azjatycka",
  puby: "piwo",
};

const chip = (aktywny: boolean) =>
  `flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-extrabold transition disabled:opacity-50 ${
    aktywny ? "bg-tekst text-white" : "bg-tlo hover:bg-krem"
  }`;

// 7 · Stories — kategorie jak relacje na Instagramie, duże miejsce na wyróżniony lokal, duże karty ze zdjęciami.
export default function P07Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  const k = useKatalog(lokale, miejscowosci);
  const prefiks = prefiksLokalu(nr);
  const wyrozniony = lokale.find((l) => l.promowany);

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-7 w-auto" />
        <Link href="/dla-lokali" className="rounded-full bg-tlo px-4 py-1.5 text-sm font-extrabold">
          Dla lokali
        </Link>
      </header>

      <main id="tresc" className="mx-auto max-w-6xl px-5">
        <h1 className="animate-wjazd text-3xl font-black lg:text-4xl">Na co masz dziś ochotę?</h1>

        <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none]" aria-label="Kategorie">
          {k.kategorie.map((kat, i) => {
            const aktywna = k.kategoria === kat.id;
            const zdjecie = ZDJECIA_KATEGORII[ZDJECIE_KATEGORII[kat.id]];
            return (
              <button
                key={kat.id}
                type="button"
                aria-pressed={aktywna}
                onClick={() => k.setKategoria(kat.id)}
                className="group flex w-[4.75rem] shrink-0 animate-wjazd flex-col items-center gap-1.5"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <span className="relative size-[4.75rem]">
                  <span
                    aria-hidden
                    className={`absolute inset-0 rounded-full ${
                      aktywna
                        ? "animate-obrot bg-[conic-gradient(#ff6400,#ffd0a8,#c24a00,#ff6400)]"
                        : "bg-[conic-gradient(#ff6400,#ffb380,#ff6400)] opacity-70 group-hover:opacity-100"
                    }`}
                  />
                  <span className="absolute inset-[3px] overflow-hidden rounded-full border-[3px] border-white bg-krem">
                    {zdjecie ? (
                      <Image src={zdjecie.plik} alt="" fill sizes="76px" className="object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <Image src="/znak.png" alt="" fill sizes="76px" className="object-contain p-2" />
                    )}
                  </span>
                </span>
                <span className={`text-xs font-extrabold whitespace-nowrap ${aktywna ? "text-akcent-tekst" : ""}`}>{kat.nazwa}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-full bg-tlo px-4 py-3">
            <Search className="size-5 text-tekst-2" aria-hidden />
            <span className="sr-only">Szukaj</span>
            <input
              type="search"
              value={k.szukaj}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            <button type="button" onClick={k.uzyjLokalizacji} className={chip(k.zLokalizacja)}>
              <LocateFixed className="size-4" aria-hidden /> Blisko mnie
            </button>
            <button type="button" aria-pressed={k.tylkoOtwarte} disabled={!k.teraz} onClick={() => k.setTylkoOtwarte(!k.tylkoOtwarte)} className={chip(k.tylkoOtwarte)}>
              Otwarte
            </button>
            <button type="button" aria-pressed={k.tryb === "zamowie"} onClick={() => k.setTryb(k.tryb === "zamowie" ? "wszystko" : "zamowie")} className={chip(k.tryb === "zamowie")}>
              Zamówię
            </button>
          </div>
        </div>
        {k.bladPozycji && <p className="mt-2 text-sm font-bold text-zamkniete">{k.bladPozycji}</p>}

        <section aria-labelledby="wyroznione" className="mt-8">
          <h2 id="wyroznione" className="flex items-center gap-2 text-xl font-black">
            <Sparkles className="size-5 text-akcent-tekst" aria-hidden /> Wyróżnione
          </h2>
          {wyrozniony ? (
            <DuzaKarta lokal={wyrozniony} prefiks={prefiks} odleglosc={k.odleglosc(wyrozniony)} duza />
          ) : (
            <Link
              href="/dla-lokali"
              className="pojawianie mt-3 flex h-48 flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-obrys-2 bg-tlo text-center transition hover:border-akcent lg:h-64"
            >
              <span className="text-lg font-black">Tu może być Twój lokal</span>
              <span className="mt-1 text-sm font-bold text-tekst-2">Wyróżnienie TOP — najlepsze miejsce na stronie →</span>
            </Link>
          )}
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-10">
          <h2 className="text-xl font-black" aria-live="polite">
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])} w okolicy
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {k.wyniki.map((l) => (
              <DuzaKarta key={l.id} lokal={l} prefiks={prefiks} odleglosc={k.odleglosc(l)} />
            ))}
          </ul>
          {k.wyniki.length === 0 && (
            <p className="py-10 text-center font-semibold text-tekst-2">
              Nic nie znaleźliśmy.{" "}
              <button type="button" onClick={k.wyczysc} className="font-black text-akcent-tekst underline">
                Wyczyść
              </button>
            </p>
          )}
        </section>
      </main>
      <StopkaPropozycji className="mt-10" />
    </div>
  );
}

function DuzaKarta({ lokal, prefiks, odleglosc, duza = false }: { lokal: Lokal; prefiks: string; odleglosc?: string; duza?: boolean }) {
  const Kontener = duza ? "div" : "li";
  return (
    <Kontener className={`group pojawianie relative overflow-hidden rounded-[1.75rem] ${duza ? "mt-3 h-72 lg:h-96" : "h-64"}`}>
      <div className="absolute inset-0">
        <Miniatura lokal={lokal} className="h-full w-full" sizes={duza ? "100vw" : "(min-width: 1024px) 380px, 100vw"} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {lokal.promowany && <EtykietaPromo className="absolute top-3 left-3 !bg-akcent !text-tekst" />}
      {odleglosc && <span className="absolute top-3 right-3 rounded-full bg-white px-2.5 py-1 text-xs font-extrabold">{odleglosc}</span>}
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5 text-white">
        <div className="min-w-0 flex-1">
          <h3 className={`truncate font-black ${duza ? "text-3xl lg:text-5xl" : "text-xl"}`}>
            <Link href={`${prefiks}${lokal.slug}`} className="outline-none after:absolute after:inset-0">
              {lokal.nazwa}
            </Link>
          </h3>
          <p className="truncate text-sm font-semibold text-white/80">{opisLokalu(lokal)}</p>
          <StatusOtwarcia godziny={lokal.godziny} ciemne className="mt-1 text-sm" />
        </div>
        <SzybkieAkcje lokal={lokal} ciemne />
      </div>
    </Kontener>
  );
}
