"use client";

import { useMemo, useState } from "react";
import { formatHour, parseHours, openingStatus } from "@/lib/hours";
import type { Venue, Town } from "@/lib/venues";
import { CATEGORIES, venueDescription, fullAddress } from "@/lib/format";
import { distanceKm, distanceDescription } from "@/lib/distance";
import { useNow } from "./useNow";

export type Mode = "wszystko" | "na-miejscu" | "zamowie";
export type Item = { lat: number; lon: number; opis: string };

export const MODES: { id: Mode; nazwa: string }[] = [
  { id: "wszystko", nazwa: "Wszystko" },
  { id: "na-miejscu", nazwa: "Zjem na miejscu" },
  { id: "zamowie", nazwa: "Zamówię" },
];
export const RADII = [1, 2, 5, 10];
export const YOUR_LOCATION = "Twoja lokalizacja";

// Search without Polish characters: „krasnik” finds „Kraśnik”.
export const normalize = (s: string) =>
  s.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "");

/** All the logic of the venue list: search, categories, mode, „open now” and „near me”. The look is separate. */
export function useCatalog(venues: Venue[], towns: Town[]) {
  const [szukaj, setSzukaj] = useState("");
  const [kategoria, setKategoria] = useState("wszystko");
  const [tryb, setTryb] = useState<Mode>("wszystko");
  const [tylkoOtwarte, setTylkoOtwarte] = useState(false);
  // the „Wege” leaf: venues with vegetarian or vegan options (OSM, corrections, vegetarian dishes in the menu)
  const [tylkoWege, setTylkoWege] = useState(false);
  const [pozycja, setPozycja] = useState<Item | null>(null);
  const [promien, setPromien] = useState(2);
  const [szukamPozycji, setSzukamPozycji] = useState(false);
  const [bladPozycji, setBladPozycji] = useState("");
  const now = useNow();

  const categories = useMemo(() => CATEGORIES.filter((k) => venues.some(k.pasuje)), [venues]);
  const countInCategory = useMemo(
    () => new Map(CATEGORIES.map((k) => [k.id, venues.filter(k.pasuje).length])),
    [venues],
  );
  const index = useMemo(
    () =>
      new Map(
        venues.map((l) => [
          l.id,
          {
            tekst: normalize([l.nazwa, venueDescription(l), fullAddress(l), l.gmina].join(" ")),
            tydzien: parseHours(l.godziny),
          },
        ]),
      ),
    [venues],
  );
  const distances = useMemo(
    () => (pozycja ? new Map(venues.map((l) => [l.id, distanceKm(pozycja, l)])) : null),
    [venues, pozycja],
  );

  // „Open late”: open now and at least until 23:00 (or past midnight), the latest closing first.
  const openLate = useMemo(() => {
    if (!now) return [];
    return venues
      .flatMap((l) => {
        const week = index.get(l.id)?.tydzien;
        const s = week && openingStatus(week, now);
        if (!s || !s.otwarte) return [];
        if (distances && distances.get(l.id)! > promien) return [];
        const end = s.doMin > 24 * 60 ? s.doMin - 24 * 60 : s.doMin;
        const order = end <= 6 * 60 ? end + 24 * 60 : end;
        return order >= 23 * 60 ? [{ lokal: l, doGodziny: formatHour(s.doMin), kolejnosc: order }] : [];
      })
      .sort((a, b) => b.kolejnosc - a.kolejnosc);
  }, [venues, index, now, distances, promien]);

  const isOpen = (l: Venue) => {
    const week = index.get(l.id)?.tydzien;
    return !!now && !!week && openingStatus(week, now).otwarte;
  };

  const matchesCategory = (CATEGORIES.find((k) => k.id === kategoria) ?? CATEGORIES[0]).pasuje;
  const phrase = normalize(szukaj.trim());
  const results = venues.filter((l) => {
    if (!matchesCategory(l) || !index.get(l.id)!.tekst.includes(phrase)) return false;
    if (tryb === "na-miejscu" && l.cechy.tylkoNaWynos) return false;
    if (tryb === "zamowie" && !l.dostawa && !l.naWynos) return false;
    if (distances && distances.get(l.id)! > promien) return false;
    if (tylkoWege && !l.cechy.wege && !l.cechy.wegan) return false;
    if (tylkoOtwarte && now) return isOpen(l);
    return true;
  });
  // Promoted always first; with a location then by distance, without it — alphabetically (order from the server).
  if (distances) {
    results.sort(
      (a, b) => Number(b.promowany) - Number(a.promowany) || distances.get(a.id)! - distances.get(b.id)!,
    );
  }

  const useLocation = () => {
    setBladPozycji("");
    // Browsers share the location only over HTTPS (and on localhost).
    if (!window.isSecureContext || !("geolocation" in navigator)) {
      setBladPozycji("Lokalizacja nie jest dostępna na tym połączeniu. Wybierz miejscowość z listy.");
      return;
    }
    setSzukamPozycji(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setSzukamPozycji(false);
        setPozycja({ lat: p.coords.latitude, lon: p.coords.longitude, opis: YOUR_LOCATION });
      },
      (error) => {
        setSzukamPozycji(false);
        setBladPozycji(
          error.code === error.PERMISSION_DENIED
            ? "Nie ma zgody na lokalizację. Wybierz miejscowość z listy."
            : "Nie udało się ustalić lokalizacji. Wybierz miejscowość z listy.",
        );
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  };
  const chooseTown = (name: string) => {
    setBladPozycji("");
    const m = towns.find((x) => x.nazwa === name);
    setPozycja(m ? { lat: m.lat, lon: m.lon, opis: m.nazwa } : null);
  };
  const clear = () => {
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
    ileWege: venues.filter((l) => l.cechy.wege || l.cechy.wegan).length,
    pozycja,
    promien,
    setPromien,
    szukamPozycji,
    bladPozycji,
    uzyjLokalizacji: useLocation,
    wybierzMiejscowosc: chooseTown,
    wyczysc: clear,
    teraz: now,
    kategorie: categories,
    ileWKategorii: countInCategory,
    wyniki: results,
    doPozna: openLate,
    czyOtwarte: isOpen,
    wiekszyPromien: RADII.find((p) => p > promien),
    odleglosc: (l: Venue) => (distances ? distanceDescription(distances.get(l.id)!) : undefined),
    zLokalizacja: pozycja?.opis === YOUR_LOCATION,
  };
}

export type Catalog = ReturnType<typeof useCatalog>;
