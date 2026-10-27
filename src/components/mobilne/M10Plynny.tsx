"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ArrowLeft, Clock, Leaf, MapPin, Navigation, Phone, Search, X } from "lucide-react";
import { parsujGodziny } from "@/lib/godziny";
import { motywLokalu } from "@/lib/motyw";
import { linkTelefonu, odmiana, opisLokalu, pelnyAdres } from "@/lib/nazwy";
import BaneryReklamowe from "../BaneryReklamowe";
import IkonaTypu from "../IkonaTypu";
import Miniatura from "../Miniatura";
import PrzyciskProwadz from "../PrzyciskProwadz";
import StatusOtwarcia from "../StatusOtwarcia";
import TabelaGodzin from "../TabelaGodzin";
import { useKatalog } from "../useKatalog";
import FiltryM from "./FiltryM";
import MenuZakladki from "./MenuZakladki";
import StopkaM from "./StopkaM";
import SzamanM from "./SzamanM";
import { szeroki } from "./fonty";
import { adresM, lokalM, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// 10 · Płynny kolor — tło liczy karta graficzna (WebGL): zawirowany szum miesza cztery kolory jak farba w wodzie.
// Na stronie głównej kolory szamanie.pl, na stronie lokalu — kolor lokalu. Szklane karty przechylają się za
// palcem (na telefonie z Androidem także za przechyleniem telefonu). Bez WebGL zostaje gradient CSS.

const SHADER = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform vec3 k1, k2, k3, k4;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / r;
  vec2 p = uv * vec2(r.x / r.y, 1.0) * 1.8;
  vec2 q = vec2(fbm(p + t * 0.05), fbm(p + vec2(5.2, 1.3) - t * 0.04));
  vec2 s = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.07), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.06));
  float f = fbm(p + 2.5 * s);
  vec3 c = mix(k1, k2, smoothstep(0.25, 0.8, f));
  c = mix(c, k3, smoothstep(0.35, 0.95, s.x));
  c = mix(c, k4, smoothstep(0.45, 1.0, q.y) * 0.7);
  gl_FragColor = vec4(c, 1.0);
}`;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

function TloShader({ kolory }: { kolory: [string, string, string, string] }) {
  const plotno = useRef<HTMLCanvasElement>(null);
  const [bezWebGL, setBezWebGL] = useState(false);
  const klucz = kolory.join();

  useEffect(() => {
    const c = plotno.current;
    const gl = c?.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!c || !gl) {
      setBezWebGL(true);
      return;
    }
    const shader = (typ: number, kod: string) => {
      const s = gl.createShader(typ)!;
      gl.shaderSource(s, kod);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }"));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, SHADER));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setBezWebGL(true);
      return;
    }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    klucz.split(",").forEach((k, i) => gl.uniform3fv(gl.getUniformLocation(prog, `k${i + 1}`), rgb(k)));

    // liczymy w ~35% rozdzielczości — gładkie plamy koloru tego nie potrzebują, a telefon się nie grzeje
    const rozmiar = () => {
      c.width = Math.max(64, Math.round(innerWidth * 0.35));
      c.height = Math.max(64, Math.round(innerHeight * 0.35));
      gl.viewport(0, 0, c.width, c.height);
      gl.uniform2f(uR, c.width, c.height);
    };
    rozmiar();
    addEventListener("resize", rozmiar);
    const spokoj = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let klatka = 0;
    let ostatnio = 0;
    const start = performance.now();
    const rysuj = (czas: number) => {
      klatka = requestAnimationFrame(rysuj);
      if (document.hidden || czas - ostatnio < 33) return; // ~30 klatek na sekundę
      ostatnio = czas;
      gl.uniform1f(uT, (czas - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    if (spokoj) {
      gl.uniform1f(uT, 12);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else klatka = requestAnimationFrame(rysuj);
    return () => {
      cancelAnimationFrame(klatka);
      removeEventListener("resize", rozmiar);
    };
  }, [klucz]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      {bezWebGL ? (
        <div
          className="fixed inset-0"
          style={{ background: `radial-gradient(at 20% 20%, ${kolory[1]}, transparent 55%), radial-gradient(at 80% 60%, ${kolory[2]}, transparent 55%), ${kolory[0]}` }}
        />
      ) : (
        <canvas ref={plotno} className="fixed inset-0 size-full" />
      )}
      <div className="fixed inset-0 bg-white/20" />
    </div>
  );
}

/** Szklana karta, która przechyla się za palcem / kursorem, z odblaskiem w miejscu dotyku. */
function Przechyl({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ruch = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width;
    const y = (e.clientY - b.top) / b.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
    el.style.setProperty("--px", `${x * 100}%`);
    el.style.setProperty("--py", `${y * 100}%`);
  };
  const koniec = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };
  return (
    <div ref={ref} onPointerMove={ruch} onPointerLeave={koniec} onPointerUp={koniec} className={`m-przechyl relative ${className}`}>
      {children}
      <span aria-hidden className="m-polysk pointer-events-none absolute inset-0 rounded-[inherit]" />
    </div>
  );
}

const szklo = "bg-white/45 ring-1 ring-white/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)]";

const chip = (aktywny: boolean) =>
  `flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold backdrop-blur-xl transition active:scale-95 ${
    aktywny ? "bg-tekst text-white" : "bg-white/50 ring-1 ring-white/60"
  }`;

export function GlownaM10({ lokale, miejscowosci, nr, linki }: PropsGlownejM) {
  const k = useKatalog(lokale, miejscowosci);
  const [rozwiniete, setRozwiniete] = useState(false);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip">
      <TloShader kolory={["#fff1e6", "#ff6400", "#ff4f8b", "#ffc46b"]} />
      <header className="sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4">
          <Image src="/logo-jasne-tlo.png" alt="szamanie" width={129} height={28} priority className={`h-6 w-auto transition-all duration-500 ${rozwiniete ? "w-0 opacity-0" : ""}`} />
          {/* „wyspa” wyszukiwania: mała pigułka, która po dotknięciu rozciąga się na całą szerokość */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`ml-auto flex h-11 items-center gap-2 rounded-full bg-tekst pr-1.5 pl-4 text-white shadow-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              rozwiniete ? "w-full" : "w-40"
            }`}
          >
            <Search className="size-4 shrink-0" aria-hidden />
            <input
              type="search"
              value={k.szukaj}
              onFocus={() => setRozwiniete(true)}
              onChange={(e) => k.setSzukaj(e.target.value)}
              placeholder="Szukaj"
              aria-label="Szukaj lokalu"
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-white/60"
            />
            {rozwiniete && (
              <button type="button" onClick={() => setRozwiniete(false)} aria-label="Zwiń" className="flex size-8 items-center justify-center rounded-full bg-white/15">
                <X className="size-4" aria-hidden />
              </button>
            )}
          </form>
        </div>
      </header>

      <main id="tresc" className="mx-auto max-w-2xl px-4">
        <Przechyl className={`${szklo} mt-2 overflow-hidden rounded-[2.25rem] p-6`}>
          <SzamanM styl="holo" className="pointer-events-none absolute -right-2 -bottom-2 w-32" />
          <h1 className={`${szeroki.className} max-w-[75%] text-[2.2rem] leading-[1.02] font-bold tracking-tight`}>Co dziś szamiesz?</h1>
          <p className="mt-3 max-w-[65%] text-sm font-bold text-tekst-2">{lokale.length} lokali w Kraśniku i okolicy. Dotknij i przesuń palcem po karcie.</p>
          <button
            type="button"
            onClick={() => k.setTylkoWege(!k.tylkoWege)}
            aria-pressed={k.tylkoWege}
            className={`mt-5 flex h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition ${k.tylkoWege ? "bg-[#15803d] text-white" : "bg-white/70 text-[#15803d]"}`}
          >
            <Leaf className="size-4" aria-hidden /> {k.tylkoWege ? "Tylko wege" : "Wege"}
          </button>
        </Przechyl>

        <BaneryReklamowe className="mt-5 [--promien-reklamy:2rem]" />

        <section aria-labelledby="kategorie" className="mt-6">
          <h2 id="kategorie" className={`${szeroki.className} text-xl font-bold`}>
            Na co masz ochotę?
          </h2>
          <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none]">
            {k.kategorie.map((kat) => {
              const aktywna = k.kategoria === kat.id;
              return (
                <button key={kat.id} type="button" aria-pressed={aktywna} onClick={() => k.setKategoria(kat.id)} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5">
                  <span className={`flex size-[4.5rem] items-center justify-center rounded-[1.75rem] transition ${aktywna ? "bg-tekst text-white shadow-xl" : szklo}`}>
                    <IkonaTypu ikona={kat.ikona} className="size-8" />
                  </span>
                  <span className="text-xs font-extrabold whitespace-nowrap">{kat.nazwa}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="wyniki" aria-label="Lokale" className="mt-4 scroll-mt-20">
          <FiltryM k={k} chip={chip} miejscowosci={miejscowosci} />
          <h2 className={`${szeroki.className} mt-3 text-xl font-bold`}>
            {k.wyniki.length} {odmiana(k.wyniki.length, ["lokal", "lokale", "lokali"])}
          </h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {k.wyniki.map((l) => (
              <li key={l.id} className="pojawianie">
                <Przechyl className={`${szklo} rounded-[2rem] p-2`}>
                  <Link href={lokalM(nr, l.slug)} className="block">
                    <Miniatura lokal={l} className="h-40 rounded-[1.6rem]" sizes="(min-width: 640px) 320px, 100vw" />
                    <div className="px-3 pt-3 pb-2">
                      <h3 className={`${szeroki.className} text-lg leading-tight font-bold`}>{l.nazwa}</h3>
                      <p className="truncate text-sm font-bold text-tekst-2">{opisLokalu(l)}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <StatusOtwarcia godziny={l.godziny} />
                        {(l.cechy.wege || l.cechy.wegan) && <Leaf className="size-4 text-[#15803d]" aria-label="wege" />}
                      </div>
                    </div>
                  </Link>
                </Przechyl>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <StopkaM linki={linki} szaman="holo" />
    </div>
  );
}

/** Paleta lokalu: kremowy, jego kolor, rozjaśniony kolor i pomarańcz serwisu. */
function paletaLokalu(kolor: string): [string, string, string, string] {
  const [r, g, b] = rgb(kolor).map((v) => Math.round(v * 255));
  const jasny = `#${[r, g, b].map((v) => Math.round(v + (255 - v) * 0.55).toString(16).padStart(2, "0")).join("")}`;
  return ["#fff6ee", kolor, jasny, "#ff8a3d"];
}

export function LokalM10({ lokal, menu, dostawa, nr, linki }: PropsLokaluM) {
  const tydzien = parsujGodziny(lokal.godziny);
  const { kolor } = motywLokalu(lokal);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip">
      <TloShader kolory={paletaLokalu(kolor)} />
      <main id="tresc" className="mx-auto max-w-2xl px-4 pt-4">
        <Link href={adresM(nr)} aria-label="Wszystkie lokale" className={`${szklo} flex size-11 items-center justify-center rounded-full`}>
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <Przechyl className={`${szklo} mt-4 overflow-hidden rounded-[2.25rem] p-2`}>
          <Miniatura lokal={lokal} className="h-56 rounded-[1.9rem]" sizes="100vw" priorytet />
          <div className="px-4 pt-4 pb-3">
            <h1 className={`${szeroki.className} text-[1.9rem] leading-[1.05] font-bold tracking-tight`}>{lokal.nazwa}</h1>
            <p className="mt-1 font-bold text-tekst-2">{opisLokalu(lokal)}</p>
            <StatusOtwarcia godziny={lokal.godziny} className="mt-2" />
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-tekst-2">
              <MapPin className="size-4" aria-hidden /> {pelnyAdres(lokal)}
            </p>
          </div>
        </Przechyl>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {lokal.telefon && (
            <a href={linkTelefonu(lokal.telefon)} className="flex h-14 items-center justify-center gap-2 rounded-full bg-tekst font-extrabold text-white shadow-xl">
              <Phone className="size-5" aria-hidden /> Zadzwoń
            </a>
          )}
          <PrzyciskProwadz lokal={lokal} className={`${szklo} flex h-14 items-center justify-center gap-2 rounded-full font-extrabold`}>
            <Navigation className="size-5" aria-hidden /> Prowadź
          </PrzyciskProwadz>
        </div>

        <section className={`${szklo} mt-5 rounded-[2rem] px-5 pt-2 pb-5`}>
          {menu ? (
            <MenuZakladki
              menu={menu}
              dostawa={dostawa}
              slug={lokal.slug}
              nazwa={lokal.nazwa}
              telefon={lokal.telefon}
              wyglad={{
                pasek: "bg-white/40 backdrop-blur-2xl rounded-b-2xl",
                aktywna: "bg-tekst text-white",
                nieaktywna: "bg-white/60",
                naglowek: `${szeroki.className} text-xl font-bold`,
                wiersz: "border-b border-white/70",
                miniatura: "rounded-[1.5rem]",
              }}
            />
          ) : (
            <p className="pt-3 font-semibold text-tekst-2">Menu jeszcze nie ma — zadzwoń i zapytaj.</p>
          )}
        </section>

        {tydzien && (
          <section className={`${szklo} mt-4 rounded-[2rem] p-5`}>
            <h2 className={`${szeroki.className} flex items-center gap-2 text-lg font-bold`}>
              <Clock className="size-5" aria-hidden /> Godziny
            </h2>
            <div className="mt-2">
              <TabelaGodzin tydzien={tydzien} />
            </div>
          </section>
        )}
        <div className="mt-8 flex items-center justify-center gap-3">
          <SzamanM styl="holo" className="w-20" />
          <p className={`${szeroki.className} text-lg font-bold`}>Smacznego!</p>
        </div>
      </main>
      <StopkaM linki={linki} szaman="holo" />
    </div>
  );
}
