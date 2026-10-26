"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Clock, LocateFixed, Search, Store } from "lucide-react";
import { ZDJECIA_KATEGORII, type KluczZdjecia } from "@/lib/zdjeciaKategorii";
import { odmiana } from "@/lib/nazwy";
import EtykietaPromo from "../EtykietaPromo";
import Miniatura from "../Miniatura";
import StatusOtwarcia from "../StatusOtwarcia";
import SzybkieAkcje from "../SzybkieAkcje";
import { TRYBY, useKatalog } from "../useKatalog";
import { StopkaPropozycji, prefiksLokalu, type PropsGlownej } from "./wspolne";

const kafel = "pojawianie relative overflow-hidden rounded-[1.75rem] p-5 transition duration-300 hover:-translate-y-1";

// 4 · Bento — kafelki różnej wielkości: wyszukiwarka, „otwarte teraz”, kategorie ze zdjęciami, oferta dla lokali.
export default function P04Glowna({ lokale, miejscowosci, nr }: PropsGlownej) {
  const k = useKatalog(lokale, miejscowosci);
  const otwarteTeraz = k.teraz ? lokale.filter(k.czyOtwarte).length : null;
  const doWynikow = () => document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
  const kategoria = (id: string) => {
    k.setKategoria(id);
    doWynikow();
  };

  return (
    <div className="min-h-screen bg-tlo">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className="h-7 w-auto" />
        <Link href="/dla-lokali" className="rounded-full bg-white px-4 py-1.5 text-sm font-extrabold shadow-sm">
          Dla lokali
        </Link>
      </header>

      <main id="tresc" className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-[repeat(3,minmax(0,11rem))]">
          <section className={`${kafel} col-span-2 bg-akcent lg:row-span-2 lg:p-8`} aria-label="Szukaj">
            <Image src="/znak.png" alt="" width={200} height={200} className="pointer-events-none absolute -right-8 -bottom-10 w-44 rotate-12 animate-unoszenie opacity-30" />
            <h1 className="relative text-3xl leading-tight font-black lg:text-5xl">
              Głodny?
              <br />
              {lokale.length} {odmiana(lokale.length, ["lokal", "lokale", "lokali"])} czeka.
            </h1>
            <div role="radiogroup" aria-label="Co chcesz zrobić" className="relative mt-4 flex w-fit flex-wrap gap-1 rounded-full bg-black/10 p-1">
              {TRYBY.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={k.tryb === t.id}
                  onClick={() => k.setTryb(t.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition lg:text-sm ${k.tryb === t.id ? "bg-white" : "hover:bg-white/40"}`}
                >
                  {t.nazwa}
                </button>
              ))}
            </div>
            <label className="relative mt-3 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg">
              <Search className="size-5 text-tekst-2" aria-hidden />
              <span className="sr-only">Szukaj lokalu</span>
              <input
                type="search"
                value={k.szukaj}
                onChange={(e) => k.setSzukaj(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doWynikow()}
                placeholder="Pizza, kebab, nazwa lokalu…"
                className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
              />
            </label>
          </section>

          <button
            type="button"
            aria-pressed={k.tylkoOtwarte}
            disabled={otwarteTeraz === null}
            onClick={() => {
              k.setTylkoOtwarte(!k.tylkoOtwarte);
              doWynikow();
            }}
            className={`${kafel} col-span-2 flex flex-col justify-between bg-tekst text-left text-white sm:col-span-1 ${k.tylkoOtwarte ? "ring-4 ring-akcent" : ""}`}
          >
            <span className="flex items-center gap-2 text-sm font-extrabold">
              <Clock className="size-4 text-akcent" aria-hidden /> Otwarte teraz
            </span>
            <span className="text-6xl font-black">{otwarteTeraz ?? "…"}</span>
            <span className="text-sm font-bold text-white/70">{k.tylkoOtwarte ? "Pokazuję tylko otwarte" : "Pokaż tylko otwarte →"}</span>
          </button>

          <KafelZdjecie zdjecie="pizza" tytul="Pizza" ile={k.ileWKategorii.get("pizza")} onClick={() => kategoria("pizza")} />
          <KafelZdjecie zdjecie="kebab" tytul="Kebab" ile={k.ileWKategorii.get("kebab")} onClick={() => kategoria("kebab")} />

          <button
            type="button"
            onClick={() => {
              k.uzyjLokalizacji();
              doWynikow();
            }}
            className={`${kafel} flex flex-col justify-between bg-krem text-left ${k.zLokalizacja ? "ring-4 ring-akcent" : ""}`}
          >
            <LocateFixed className="size-8 text-akcent-tekst" aria-hidden />
            <span className="text-lg leading-tight font-black">
              Blisko
              <br />
              mnie
            </span>
          </button>

          <KafelZdjecie zdjecie="kawa" tytul="Kawiarnie" ile={k.ileWKategorii.get("kawiarnie")} onClick={() => kategoria("kawiarnie")} />
          <KafelZdjecie zdjecie="burger" tytul="Burgery" ile={k.ileWKategorii.get("burgery")} onClick={() => kategoria("burgery")} />
          <Link href="/dla-lokali" className={`${kafel} col-span-2 flex items-center justify-between gap-3 bg-white shadow-sm sm:col-span-1`}>
            <span>
              <Store className="mb-2 size-6 text-akcent-tekst" aria-hidden />
              <span className="block text-lg leading-tight font-black">Prowadzisz lokal?</span>
              <span className="text-sm font-bold text-tekst-2">Wyróżnij go</span>
            </span>
            <ArrowRight className="size-6 shrink-0" aria-hidden />
          </Link>
        </div>

        {k.bladPozycji && <p className="mt-3 text-sm font-bold text-zamkniete">{k.bladPozycji}</p>}

        <section id="wyniki" aria-label="Lokale" className="mt-10 scroll-mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-auto text-2xl font-black" aria-live="polite">
              {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
            </h2>
            {k.kategorie.map((kat) => (
              <button
                key={kat.id}
                type="button"
                aria-pressed={k.kategoria === kat.id}
                onClick={() => k.setKategoria(kat.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-extrabold transition ${k.kategoria === kat.id ? "bg-tekst text-white" : "bg-white hover:bg-krem"}`}
              >
                {kat.nazwa}
              </button>
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {k.wyniki.map((l) => (
              <li key={l.id} className="group pojawianie relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <Miniatura lokal={l} className="aspect-[4/3]" sizes="(min-width: 1024px) 280px, 50vw" />
                {l.promowany && <EtykietaPromo className="absolute top-2 left-2" />}
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="leading-tight font-black">
                    <Link href={`${prefiksLokalu(nr)}${l.slug}`} className="outline-none after:absolute after:inset-0">
                      {l.nazwa}
                    </Link>
                  </h3>
                  <p className="text-xs font-bold text-tekst-2">
                    {l.miejscowosc}
                    {k.odleglosc(l) && ` · ${k.odleglosc(l)}`}
                  </p>
                  <StatusOtwarcia godziny={l.godziny} className="mt-1 text-xs" />
                  <div className="mt-auto pt-2">
                    <SzybkieAkcje lokal={l} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {k.wyniki.length === 0 && (
            <p className="py-12 text-center font-semibold text-tekst-2">
              Nic nie znaleźliśmy.{" "}
              <button type="button" onClick={k.wyczysc} className="font-black text-akcent-tekst underline">
                Wyczyść filtry
              </button>
            </p>
          )}
        </section>
      </main>
      <StopkaPropozycji className="mt-10" />
    </div>
  );
}

function KafelZdjecie(props: { zdjecie: KluczZdjecia; tytul: string; ile?: number; onClick: () => void }) {
  const z = ZDJECIA_KATEGORII[props.zdjecie];
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`${kafel} group flex aspect-square flex-col justify-end bg-tekst text-left text-white lg:aspect-auto`}
    >
      {z && (
        <Image
          src={z.plik}
          alt=""
          fill
          sizes="(min-width: 1024px) 280px, 50vw"
          className="object-cover transition duration-700 group-hover:scale-110"
          style={{ objectPosition: z.pozycja }}
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <Napis>{props.tytul}</Napis>
      <span className="relative text-sm font-bold text-white/80">{props.ile ?? 0} lokali</span>
    </button>
  );
}

function Napis({ children }: { children: ReactNode }) {
  return <span className="relative text-2xl font-black">{children}</span>;
}
