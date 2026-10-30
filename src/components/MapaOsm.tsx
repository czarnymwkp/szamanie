"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mapa OpenStreetMap w ramce, wczytywana dopiero tuż przed wjazdem na ekran. Samo loading="lazy" w Chrome na telefonie
 * ładuje ramkę z dużym zapasem (ok. 1250–2500 px), a to ok. 470 KB skryptów i kafelków, które spowalniały wejście na
 * stronę lokalu.
 */
export default function MapaOsm({ title, src, className }: { title: string; src: string; className?: string }) {
  const ramka = useRef<HTMLIFrameElement>(null);
  const [blisko, setBlisko] = useState(false);

  useEffect(() => {
    const el = ramka.current;
    if (!el) return;
    const obserwator = new IntersectionObserver(
      ([wpis]) => {
        if (!wpis.isIntersecting) return;
        setBlisko(true);
        obserwator.disconnect();
      },
      { rootMargin: "300px" },
    );
    obserwator.observe(el);
    return () => obserwator.disconnect();
  }, []);

  return <iframe ref={ramka} title={title} src={blisko ? src : undefined} loading="lazy" className={className} />;
}
