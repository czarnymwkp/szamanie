"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { LayerGroup, Map as MapaLeaflet } from "leaflet";
import type { Lokal } from "@/lib/lokale";
import { motywLokalu } from "@/lib/motyw";

type Leaflet = typeof import("leaflet");
type Dane = { lokale: Lokal[]; wybrany: number | null; onWybierz: (id: number) => void };

const KRASNIK: [number, number] = [50.9244, 22.2203];
const klucz = (lokale: Lokal[]) => lokale.map((l) => l.id).join(",");

function rysujPinezki(L: Leaflet, mapa: MapaLeaflet, warstwa: LayerGroup, dane: Dane, dopasuj: boolean) {
  warstwa.clearLayers();
  for (const l of dane.lokale) {
    const wybrany = l.id === dane.wybrany;
    const ikona = L.divIcon({
      className: "",
      html: `<span class="pinezka${wybrany ? " pinezka--wybrana" : ""}" style="--kolor:${motywLokalu(l).kolor}"></span>`,
      iconSize: wybrany ? [34, 34] : [24, 24],
      iconAnchor: wybrany ? [17, 34] : [12, 24],
    });
    L.marker([l.lat, l.lon], { icon: ikona, title: l.nazwa, zIndexOffset: wybrany ? 1000 : 0 })
      .on("click", () => dane.onWybierz(l.id))
      .addTo(warstwa);
  }
  if (dopasuj && dane.lokale.length) {
    mapa.fitBounds(L.latLngBounds(dane.lokale.map((l) => [l.lat, l.lon] as [number, number])), { padding: [30, 30], maxZoom: 15 });
  }
}

/** Mapa OpenStreetMap z pinezkami lokali (Leaflet ładowany dopiero w przeglądarce). */
export default function MapaLokali({ lokale, wybrany, onWybierz, className = "" }: Dane & { className?: string }) {
  const kontener = useRef<HTMLDivElement>(null);
  const leaflet = useRef<{ L: Leaflet; mapa: MapaLeaflet; warstwa: LayerGroup } | null>(null);
  const dane = useRef<Dane>({ lokale, wybrany, onWybierz });
  const poprzedniaLista = useRef("");

  useEffect(() => {
    let anulowane = false;
    import("leaflet").then((L) => {
      if (anulowane || !kontener.current || leaflet.current) return;
      const mapa = L.map(kontener.current, { zoomControl: false }).setView(KRASNIK, 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);
      L.control.zoom({ position: "bottomright" }).addTo(mapa);
      const warstwa = L.layerGroup().addTo(mapa);
      leaflet.current = { L, mapa, warstwa };
      rysujPinezki(L, mapa, warstwa, dane.current, true);
      poprzedniaLista.current = klucz(dane.current.lokale);
    });
    return () => {
      anulowane = true;
      leaflet.current?.mapa.remove();
      leaflet.current = null;
    };
  }, []);

  useEffect(() => {
    dane.current = { lokale, wybrany, onWybierz };
    const l = leaflet.current;
    if (!l) return;
    // Dopasuj widok tylko przy zmianie listy (filtry), nie przy samym podświetleniu lokalu.
    const nowaLista = poprzedniaLista.current !== klucz(lokale);
    poprzedniaLista.current = klucz(lokale);
    rysujPinezki(l.L, l.mapa, l.warstwa, dane.current, nowaLista);
  }, [lokale, wybrany, onWybierz]);

  return <div ref={kontener} className={`z-0 bg-krem ${className}`} role="region" aria-label="Mapa lokali" />;
}
