"use client";

import { useId, type ReactNode } from "react";
import Mascot from "../Szaman";

/**
 * Animowany szaman w stylu propozycji: ta sama postać (je burgera, czaruje), przepuszczona przez filtr SVG.
 * szkic — ołówek; neon — świecący kontur; plakat — sitodruk w dwóch kolorach; zorza — opalizujący połysk;
 * naklejka — biała obwódka; piksele — jak ze starej gry; holo — rozszczepione kolory; cieply — przy piecu;
 * noc / dzien — światło pory dnia; crt — piksele na kineskopie; druk — raster gazety; termo — wydruk z kasy;
 * glina — miękka bryła 3D; kosmos — poświata; akwarela — rozlana farba; ogrod — zieleń; komiks — kontur i plamy
 * koloru; bauhaus — kolory podstawowe; kino — sepia w świetle reflektora. Pinezka nie ma filtra: szaman siedzi
 * w znaczniku mapy.
 */
export type MascotStyle =
  | "szkic"
  | "neon"
  | "plakat"
  | "zorza"
  | "naklejka"
  | "piksele"
  | "holo"
  | "cieply"
  | "noc"
  | "dzien"
  | "pinezka"
  | "crt"
  | "druk"
  | "termo"
  | "glina"
  | "kosmos"
  | "akwarela"
  | "ogrod"
  | "komiks"
  | "bauhaus"
  | "kino";

const EDGES = "-1 -1 -1 -1 8 -1 -1 -1 -1";

/** Raster jak w druku: odcienie szarości z szumem, potem próg — zostaje farba albo papier. */
function raster(frequency: string, paint: string, noiseStrength: string): ReactNode {
  return (
    <>
      <feColorMatrix type="saturate" values="0" result="szary" />
      <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves="1" seed="7" result="szum" />
      <feColorMatrix in="szum" type="saturate" values="0" result="szumSzary" />
      <feComposite in="szary" in2="szumSzary" operator="arithmetic" k2="1" k3={noiseStrength} k4="-0.22" result="zSzumem" />
      <feComponentTransfer in="zSzumem" result="prog">
        <feFuncR type="discrete" tableValues="0 1" />
        <feFuncG type="discrete" tableValues="0 1" />
        <feFuncB type="discrete" tableValues="0 1" />
      </feComponentTransfer>
      <feColorMatrix in="prog" type="luminanceToAlpha" result="jasne" />
      <feComponentTransfer in="jasne" result="farbaAlfa">
        <feFuncA type="table" tableValues="1 0" />
      </feComponentTransfer>
      <feFlood floodColor={paint} />
      <feComposite in2="farbaAlfa" operator="in" result="farbaNaPapierze" />
      <feComposite in="farbaNaPapierze" in2="SourceAlpha" operator="in" />
    </>
  );
}

function filterFn(style: MascotStyle): ReactNode {
  switch (style) {
    case "druk":
      return raster("0.9", "#1c1a17", "0.55");
    case "termo":
      return raster("1.6", "#3a3a3a", "0.4");
    case "glina":
      // miękka bryła: rozmyty kształt jako mapa wysokości, światło z lewej góry
      return (
        <>
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="wysokosc" />
          <feSpecularLighting in="wysokosc" surfaceScale="6" specularConstant="0.85" specularExponent="16" lightingColor="#ffffff" result="blask">
            <fePointLight x="-40" y="-60" z="140" />
          </feSpecularLighting>
          <feComposite in="blask" in2="SourceAlpha" operator="in" result="blaskNaKsztalcie" />
          <feComposite in="SourceGraphic" in2="blaskNaKsztalcie" operator="arithmetic" k2="1" k3="0.65" />
        </>
      );
    case "akwarela":
      return (
        <>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="2" result="papier" />
          <feDisplacementMap in="SourceGraphic" in2="papier" scale="7" xChannelSelector="R" yChannelSelector="G" result="rozlane" />
          <feGaussianBlur in="rozlane" stdDeviation="0.9" result="miekkie" />
          <feColorMatrix in="miekkie" type="saturate" values="0.75" result="blade" />
          <feComponentTransfer in="blade">
            <feFuncA type="linear" slope="0.88" />
          </feComponentTransfer>
        </>
      );
    case "komiks":
      return (
        <>
          <feComponentTransfer in="SourceGraphic" result="plaskie">
            <feFuncR type="discrete" tableValues="0 0.45 0.8 1" />
            <feFuncG type="discrete" tableValues="0 0.45 0.8 1" />
            <feFuncB type="discrete" tableValues="0 0.45 0.8 1" />
          </feComponentTransfer>
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="gruby" />
          <feFlood floodColor="#111111" />
          <feComposite in2="gruby" operator="in" result="kontur" />
          <feMerge>
            <feMergeNode in="kontur" />
            <feMergeNode in="plaskie" />
          </feMerge>
        </>
      );
    case "bauhaus":
      return (
        <>
          <feColorMatrix type="saturate" values="0" result="szary" />
          <feComponentTransfer in="szary">
            <feFuncR type="discrete" tableValues="0.11 0.9 0.12 0.97" />
            <feFuncG type="discrete" tableValues="0.11 0.2 0.31 0.78" />
            <feFuncB type="discrete" tableValues="0.1 0.14 0.64 0.02" />
          </feComponentTransfer>
        </>
      );
    case "szkic":
      // krawędzie → ciemne linie na białym, drżące jak rysowane ręką
      return (
        <>
          <feColorMatrix type="saturate" values="0" result="szary" />
          <feConvolveMatrix
            in="szary"
            order="3"
            kernelMatrix={EDGES}
            preserveAlpha="true"
            result="krawedzie"
          />
          <feColorMatrix
            in="krawedzie"
            type="matrix"
            values="-2.2 0 0 0 1.05  -2.2 0 0 0 1.03  -2.2 0 0 0 0.98  0 0 0 1 0"
            result="linie"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.06"
            numOctaves="2"
            seed="4"
            result="drzenie"
          />
          <feDisplacementMap
            in="linie"
            in2="drzenie"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </>
      );
    case "neon":
      return (
        <>
          <feColorMatrix type="saturate" values="0" result="szary" />
          <feConvolveMatrix
            in="szary"
            order="3"
            kernelMatrix={EDGES}
            preserveAlpha="true"
            result="krawedzie"
          />
          <feColorMatrix in="krawedzie" type="luminanceToAlpha" result="alfa" />
          <feComponentTransfer in="alfa" result="mocniej">
            <feFuncA type="linear" slope="5" />
          </feComponentTransfer>
          <feFlood floodColor="#ffd2b0" />
          <feComposite in2="mocniej" operator="in" result="linie" />
          <feFlood floodColor="#ff5a00" />
          <feComposite in2="mocniej" operator="in" result="pomaranczowe" />
          <feGaussianBlur
            in="pomaranczowe"
            stdDeviation="3.5"
            result="poswiata"
          />
          <feMerge>
            <feMergeNode in="poswiata" />
            <feMergeNode in="poswiata" />
            <feMergeNode in="linie" />
          </feMerge>
        </>
      );
    case "plakat":
      // dwa kolory farby, czarny lekko przesunięty jak w sitodruku
      return (
        <>
          <feColorMatrix type="saturate" values="0" result="szary" />
          <feComponentTransfer in="szary" result="pomaranczowy">
            <feFuncR type="discrete" tableValues="0.05 1 1" />
            <feFuncG type="discrete" tableValues="0.05 0.3 0.95" />
            <feFuncB type="discrete" tableValues="0.05 0 0.9" />
          </feComponentTransfer>
          <feOffset in="pomaranczowy" dx="3" dy="2" result="przesuniety" />
          <feColorMatrix
            in="przesuniety"
            type="matrix"
            values="0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0.9 0"
            result="cien"
          />
          <feMerge>
            <feMergeNode in="cien" />
            <feMergeNode in="pomaranczowy" />
          </feMerge>
        </>
      );
    case "zorza":
      return (
        <>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            seed="3"
            result="szum"
          />
          <feColorMatrix in="szum" type="hueRotate" values="0" result="tecza">
            <animate
              attributeName="values"
              from="0"
              to="360"
              dur="7s"
              repeatCount="indefinite"
            />
          </feColorMatrix>
          <feColorMatrix in="tecza" type="saturate" values="4" result="mocna" />
          <feComposite
            in="mocna"
            in2="SourceAlpha"
            operator="in"
            result="polysk"
          />
          <feBlend in="SourceGraphic" in2="polysk" mode="soft-light" />
        </>
      );
    case "naklejka":
      return (
        <>
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius="5"
            result="obrys"
          />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="obrys" operator="in" result="bialy" />
          <feMerge>
            <feMergeNode in="bialy" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </>
      );
    case "crt":
    case "piksele":
      // próbka co 5 px rozdmuchana do kwadratu 5×5
      return (
        <>
          <feFlood x="2" y="2" width="1" height="1" />
          <feComposite width="5" height="5" />
          <feTile result="siatka" />
          <feComposite in="SourceGraphic" in2="siatka" operator="in" />
          <feMorphology operator="dilate" radius="2" />
        </>
      );
    case "holo":
      return (
        <>
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="r"
          />
          <feOffset in="r" dx="-3" dy="0" result="r2">
            <animate
              attributeName="dx"
              values="-3;-6;-1;-3"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </feOffset>
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="g"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="b"
          />
          <feOffset in="b" dx="3" dy="1" result="b2">
            <animate
              attributeName="dx"
              values="3;6;1;3"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </feOffset>
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </>
      );
    default:
      return null;
  }
}

const CSS: Partial<Record<MascotStyle, string>> = {
  neon: "animate-[m-mruganie_6s_infinite]",
  naklejka: "-rotate-6 drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]",
  zorza: "drop-shadow-[0_10px_24px_rgba(255,61,127,0.35)]",
  cieply:
    "[filter:sepia(0.35)_saturate(1.35)_drop-shadow(0_0_18px_rgba(255,140,40,0.55))]",
  noc: "[filter:brightness(0.8)_saturate(0.85)_drop-shadow(0_0_16px_rgba(147,197,253,0.65))]",
  dzien:
    "[filter:brightness(1.05)_drop-shadow(0_6px_14px_rgba(255,170,0,0.45))]",
  crt: "drop-shadow-[0_0_8px_rgba(90,255,180,0.7)]",
  kosmos: "animate-unoszenie [filter:drop-shadow(0_0_16px_rgba(120,200,255,0.75))_saturate(1.15)]",
  ogrod: "[filter:saturate(1.1)_drop-shadow(0_10px_16px_rgba(21,128,61,0.35))]",
  kino: "[filter:sepia(0.55)_contrast(1.1)_drop-shadow(0_0_22px_rgba(255,220,150,0.45))]",
  glina: "drop-shadow-[0_14px_18px_rgba(120,60,160,0.3)]",
  komiks: "-rotate-3",
};

export default function StyledMascot({
  styl,
  className = "",
}: {
  styl: MascotStyle;
  className?: string;
}) {
  const id = `szaman-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const definition = filterFn(styl);

  if (styl === "pinezka") {
    // szaman w znaczniku mapy: okrągła główka z ogonkiem, opada i pulsuje krąg pod spodem
    return (
      <div aria-hidden className={className}>
        <div className="relative">
          <span className="m-fala absolute -bottom-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-[50%] bg-[#1a73e8]/40" />
          <div className="m-pinezka relative mx-auto aspect-square w-full rounded-full rounded-br-none border-4 border-white bg-[#e8f0fe] shadow-xl [rotate:45deg]">
            <div className="absolute inset-[6%] overflow-hidden rounded-full [rotate:-45deg]">
              <Mascot className="w-full translate-y-[6%]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden className={`${className} ${CSS[styl] ?? ""}`}>
      {definition && (
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter
              id={id}
              x="-15%"
              y="-15%"
              width="130%"
              height="130%"
              colorInterpolationFilters="sRGB"
            >
              {definition}
            </filter>
          </defs>
        </svg>
      )}
      <div style={definition ? { filter: `url(#${id})` } : undefined}>
        <Mascot className="w-full" />
      </div>
    </div>
  );
}
