"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mapa OpenStreetMap w ramce, wczytywana dopiero tuż przed wjazdem na ekran. Samo loading="lazy" w Chrome na telefonie
 * ładuje ramkę z dużym zapasem (ok. 1250–2500 px), a to ok. 470 KB skryptów i kafelków, które spowalniały wejście na
 * stronę lokalu.
 */
export default function OsmMap({ title, src, className }: { title: string; src: string; className?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [blisko, setBlisko] = useState(false);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([wpis]) => {
        if (!wpis.isIntersecting) return;
        setBlisko(true);
        observer.disconnect();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <iframe ref={frame} title={title} src={blisko ? src : undefined} loading="lazy" className={className} />;
}
