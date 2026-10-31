"use client";

import { useId } from "react";
import Mascot from "./Mascot";

const EDGES = "-1 -1 -1 -1 8 -1 -1 -1 -1";

/** The animated shaman (eats a burger, does magic) drawn in pencil: an SVG filter turns the figure into sketch lines. */
export default function SketchMascot({ className = "" }: { className?: string }) {
  const id = `shaman-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div aria-hidden className={className}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id={id} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            {/* edges → dark lines on white, trembling as if drawn by hand */}
            <feColorMatrix type="saturate" values="0" result="grey" />
            <feConvolveMatrix in="grey" order="3" kernelMatrix={EDGES} preserveAlpha="true" result="edges" />
            <feColorMatrix
              in="edges"
              type="matrix"
              values="-2.2 0 0 0 1.05  -2.2 0 0 0 1.03  -2.2 0 0 0 0.98  0 0 0 1 0"
              result="lines"
            />
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" result="tremble" />
            <feDisplacementMap in="lines" in2="tremble" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div style={{ filter: `url(#${id})` }}>
        <Mascot className="w-full" />
      </div>
    </div>
  );
}
