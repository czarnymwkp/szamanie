"use client";

import { useMemo, useState } from "react";
import { formatGodz, parsujGodziny, statusOtwarcia } from "@/lib/godziny";
import type { Lokal, Miejscowosc } from "@/lib/lokale";
import { KATEGORIE, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import { odlegloscKm, opisOdleglosci } from "@/lib/odleglosc";
import { useTeraz } from "./useTeraz";

export type Tryb = "wszystko" | "na-miejscu" | "zamowie";
export type Pozycja = { lat: number; lon: number; opis: string };

export const TRYBY: { id: Tryb; nazwa: string }[] = [
  { id: "wszystko", nazwa: "Wszystko" },
  { id: "na-miejscu", nazwa: "Zjem na miejscu" },
  { id: "zamowie", nazwa: "Zamówię" },
];
export const PROMIENIE = [1, 2, 5, 10];
export const TWOJA_LOKALIZACJA = "Twoja lokalizacja";

// Wyszukiwanie bez polskich znaków: „krasnik” znajdzie „Kraśnik”.
export const normalizuj = (s: string) =>
  s.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Cała logika listy lokali: wyszukiwanie, kategorie, tryb, „otwarte teraz” i „blisko mnie”. Wygląd — osobno. */
export function useKatalog(lokale: Lokal[], miejscowosci: Miejscowosc[]) {
  const [szukaj, setSzukaj] = useState("");
  const [kategoria, setKategoria] = useState("wszystko");
  const [tryb, setTryb] = useState<Tryb>("wszystko");
  const [tylkoOtwarte, setTylkoOtwarte] = useState(false);
  // listek „Wege”: lokale z opcjami wegetariańskimi albo wegańskimi (OSM, poprawki, dania wege w menu)
  const [tylkoWege, setTylkoWege] = useState(false);
  const [pozycja, setPozycja] = useState<Pozycja | null>(null);
  const [promien, setPromien] = useState(2);
  const [szukamPozycji, setSzukamPozycji] = useState(false);
  const [bladPozycji, setBladPozycji] = useState("");
  const teraz = useTeraz();

  const kategorie = useMemo(() => KATEGORIE.filter((k) => lokale.some(k.pasuje)), [lokale]);
  const ileWKategorii = useMemo(
    () => new Map(KATEGORIE.map((k) => [k.id, lokale.filter(k.pasuje).length])),
    [lokale],
  );
  const indeks = useMemo(
    () =>
      new Map(
        lokale.map((l) => [
          l.id,
          {
            tekst: normalizuj([l.nazwa, opisLokalu(l), pelnyAdres(l), l.gmina].join(" ")),
            tydzien: parsujGodziny(l.godziny),
          },
        ]),
      ),
    [lokale],
  );
  const odleglosci = useMemo(
    () => (pozycja ? new Map(lokale.map((l) => [l.id, odlegloscKm(pozycja, l)])) : null),
    [lokale, pozycja],
  );

  // „Otwarte do późna”: czynne teraz i co najmniej do 23:00 (albo po północy), najpóźniej zamykane pierwsze.
  const doPozna = useMemo(() => {
    if (!teraz) return [];
    return lokale
      .flatMap((l) => {
        const tydzien = indeks.get(l.id)?.tydzien;
        const s = tydzien && statusOtwarcia(tydzien, teraz);
        if (!s || !s.otwarte) return [];
        if (odleglosci && odleglosci.get(l.id)! > promien) return [];
        const koniec = s.doMin > 24 * 60 ? s.doMin - 24 * 60 : s.doMin;
        const kolejnosc = koniec <= 6 * 60 ? koniec + 24 * 60 : koniec;
        return kolejnosc >= 23 * 60 ? [{ lokal: l, doGodziny: formatGodz(s.doMin), kolejnosc }] : [];
      })
      .sort((a, b) => b.kolejnosc - a.kolejnosc);
  }, [lokale, indeks, teraz, odleglosci, promien]);

  const czyOtwarte = (l: Lokal) => {
    const tydzien = indeks.get(l.id)?.tydzien;
    return !!teraz && !!tydzien && statusOtwarcia(tydzien, teraz).otwarte;
  };

  const pasujeKategoria = (KATEGORIE.find((k) => k.id === kategoria) ?? KATEGORIE[0]).pasuje;
  const fraza = normalizuj(szukaj.trim());
  const wyniki = lokale.filter((l) => {
    if (!pasujeKategoria(l) || !indeks.get(l.id)!.tekst.includes(fraza)) return false;
    if (tryb === "na-miejscu" && l.cechy.tylkoNaWynos) return false;
    if (tryb === "zamowie" && !l.dostawa && !l.naWynos) return false;
    if (odleglosci && odleglosci.get(l.id)! > promien) return false;
    if (tylkoWege && !l.cechy.wege && !l.cechy.wegan) return false;
    if (tylkoOtwarte && teraz) return czyOtwarte(l);
    return true;
  });
  // Promowane zawsze pierwsze; z lokalizacją dalej od najbliższych, bez niej — alfabetycznie (kolejność z serwera).
  if (odleglosci) {
    wyniki.sort(
      (a, b) => Number(b.promowany) - Number(a.promowany) || odleglosci.get(a.id)! - odleglosci.get(b.id)!,
    );
  }

  const uzyjLokalizacji = () => {
    setBladPozycji("");
    // Przeglądarki udostępniają lokalizację tylko przez HTTPS (i na localhost).
    if (!window.isSecureContext || !("geolocation" in navigator)) {
      setBladPozycji("Lokalizacja nie jest dostępna na tym połączeniu. Wybierz miejscowość z listy.");
      return;
    }
    setSzukamPozycji(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setSzukamPozycji(false);
        setPozycja({ lat: p.coords.latitude, lon: p.coords.longitude, opis: TWOJA_LOKALIZACJA });
      },
      (blad) => {
        setSzukamPozycji(false);
        setBladPozycji(
          blad.code === blad.PERMISSION_DENIED
            ? "Nie ma zgody na lokalizację. Wybierz miejscowość z listy."
            : "Nie udało się ustalić lokalizacji. Wybierz miejscowość z listy.",
        );
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  };
  const wybierzMiejscowosc = (nazwa: string) => {
    setBladPozycji("");
    const m = miejscowosci.find((x) => x.nazwa === nazwa);
    setPozycja(m ? { lat: m.lat, lon: m.lon, opis: m.nazwa } : null);
  };
  const wyczysc = () => {
    setSzukaj("");
    setKategoria("wszystko");
    setTryb("wszystko");
    setTylkoOtwarte(false);
    setTylkoWege(false);
    setPozycja(null);
  };

  return {
    szukaj,
    setSzukaj,
    kategoria,
    setKategoria,
    tryb,
    setTryb,
    tylkoOtwarte,
    setTylkoOtwarte,
    tylkoWege,
    setTylkoWege,
    ileWege: lokale.filter((l) => l.cechy.wege || l.cechy.wegan).length,
    pozycja,
    promien,
    setPromien,
    szukamPozycji,
    bladPozycji,
    uzyjLokalizacji,
    wybierzMiejscowosc,
    wyczysc,
    teraz,
    kategorie,
    ileWKategorii,
    wyniki,
    doPozna,
    czyOtwarte,
    wiekszyPromien: PROMIENIE.find((p) => p > promien),
    odleglosc: (l: Lokal) => (odleglosci ? opisOdleglosci(odleglosci.get(l.id)!) : undefined),
    zLokalizacja: pozycja?.opis === TWOJA_LOKALIZACJA,
  };
}

export type Katalog = ReturnType<typeof useKatalog>;
