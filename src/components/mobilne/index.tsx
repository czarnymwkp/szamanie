import Link from "next/link";
import { Hammer } from "lucide-react";
import { GlownaM01, LokalM01 } from "./M01Zorza";
import { GlownaM02, LokalM02 } from "./M02Neon";
import { GlownaM03, LokalM03 } from "./M03Szkicownik";
import { GlownaM04, LokalM04 } from "./M04Litery";
import { GlownaM05, LokalM05 } from "./M05Talia";
import { GlownaM06, LokalM06 } from "./M06Mapa";
import { GlownaM07, LokalM07 } from "./M07Bento";
import { GlownaM08, LokalM08 } from "./M08PoraDnia";
import { GlownaM09, LokalM09 } from "./M09Smak";
import { GlownaM10, LokalM10 } from "./M10Plynny";
import { GlownaM11, LokalM11 } from "./M11Automat";
import { GlownaM12, LokalM12 } from "./M12Gazeta";
import { GlownaM13, LokalM13 } from "./M13Paragon";
import { GlownaM14, LokalM14 } from "./M14Glina";
import { GlownaM15, LokalM15 } from "./M15Kosmos";
import { GlownaM16, LokalM16 } from "./M16Akwarela";
import { GlownaM17, LokalM17 } from "./M17Ogrod";
import { GlownaM18, LokalM18 } from "./M18Komiks";
import { GlownaM19, LokalM19 } from "./M19Bauhaus";
import { GlownaM20, LokalM20 } from "./M20Kino";
import { PROPOZYCJE_M, type PropsGlownejM, type PropsLokaluM } from "./wspolne";

// Rejestr propozycji wyglądu na telefon: numer → strona główna i strona lokalu.
const GLOWNE: Record<number, (p: PropsGlownejM) => React.ReactNode> = {
  1: GlownaM01,
  2: GlownaM02,
  3: GlownaM03,
  4: GlownaM04,
  5: GlownaM05,
  6: GlownaM06,
  7: GlownaM07,
  8: GlownaM08,
  9: GlownaM09,
  10: GlownaM10,
  11: GlownaM11,
  12: GlownaM12,
  13: GlownaM13,
  14: GlownaM14,
  15: GlownaM15,
  16: GlownaM16,
  17: GlownaM17,
  18: GlownaM18,
  19: GlownaM19,
  20: GlownaM20,
};
const LOKALE: Record<number, (p: PropsLokaluM) => React.ReactNode> = {
  1: LokalM01,
  2: LokalM02,
  3: LokalM03,
  4: LokalM04,
  5: LokalM05,
  6: LokalM06,
  7: LokalM07,
  8: LokalM08,
  9: LokalM09,
  10: LokalM10,
  11: LokalM11,
  12: LokalM12,
  13: LokalM13,
  14: LokalM14,
  15: LokalM15,
  16: LokalM16,
  17: LokalM17,
  18: LokalM18,
  19: LokalM19,
  20: LokalM20,
};

/** Numery propozycji, które już można oglądać. */
export const GOTOWE = new Set(Object.keys(GLOWNE).map(Number));

function WBudowie({ nr }: { nr: number }) {
  const p = PROPOZYCJE_M.find((x) => x.nr === nr);
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
      <Hammer className="mx-auto size-12 animate-kolysanie text-akcent-tekst" aria-hidden />
      <h1 className="mt-4 text-2xl font-black">
        {nr} · {p?.nazwa} — w budowie
      </h1>
      <p className="mt-2 font-semibold text-tekst-2">{p?.opis}</p>
      <Link href="/propozycje/m" className="mx-auto mt-6 rounded-full bg-tekst px-5 py-2.5 font-black text-white">
        Wszystkie propozycje
      </Link>
    </main>
  );
}

export function GlownaPropozycjiM(props: PropsGlownejM) {
  const Glowna = GLOWNE[props.nr];
  return Glowna ? <Glowna {...props} /> : <WBudowie nr={props.nr} />;
}

export function LokalPropozycjiM(props: PropsLokaluM) {
  const Lokal = LOKALE[props.nr];
  return Lokal ? <Lokal {...props} /> : <WBudowie nr={props.nr} />;
}
