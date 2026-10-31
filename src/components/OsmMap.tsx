"use client";

import { useEffect, useRef, useState } from "react";

/**
 * OpenStreetMap map in an iframe, loaded only just before it scrolls into view. loading="lazy" alone makes Chrome on a
 * phone load the iframe with a large margin (about 1250–2500 px), and that is about 470 KB of scripts and tiles that
 * slowed down opening a venue page.
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
