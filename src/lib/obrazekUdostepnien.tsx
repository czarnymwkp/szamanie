// Obrazek, który Facebook, Messenger czy WhatsApp pokazują przy linku do szamanie.pl (og:image).
// Rysowany przez next/og: zdjęcie poglądowe, logo, tytuł strony. Fonty (OFL) leżą w public/fonty/ —
// generator nie czyta woff2 z next/font, a domyślny krój nie ma polskich znaków.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";

export const SIZE = { width: 1200, height: 630 };

const fromPublic = (path: string) => readFile(join(process.cwd(), "public", path));

async function fonts() {
  const [grotesk, groteskExt, nunito, nunitoExt, nunitoCzarny, nunitoCzarnyExt] = await Promise.all([
    fromPublic("fonty/space-grotesk-latin-700-normal.woff"),
    fromPublic("fonty/space-grotesk-latin-ext-700-normal.woff"),
    fromPublic("fonty/nunito-latin-700-normal.woff"),
    fromPublic("fonty/nunito-latin-ext-700-normal.woff"),
    fromPublic("fonty/nunito-latin-900-normal.woff"),
    fromPublic("fonty/nunito-latin-ext-900-normal.woff"),
  ]);
  // Każdy plik pod osobną nazwą: pliki o tej samej nazwie i grubości generator traktuje jak jeden krój
  // i gubi polskie znaki z drugiego (latin-ext). Style podają obie nazwy: KROJ_TYTULU, KROJ_TEKSTU.
  return [
    { name: "Grotesk", data: grotesk, weight: 700 as const },
    { name: "GroteskExt", data: groteskExt, weight: 700 as const },
    { name: "Nunito", data: nunito, weight: 700 as const },
    { name: "NunitoExt", data: nunitoExt, weight: 700 as const },
    { name: "Nunito", data: nunitoCzarny, weight: 900 as const },
    { name: "NunitoExt", data: nunitoCzarnyExt, weight: 900 as const },
  ];
}

const TITLE_FONT = "Grotesk, GroteskExt";
const BODY_FONT = "Nunito, NunitoExt";

async function image(path: string, type: string) {
  return `data:${type};base64,${(await fromPublic(path)).toString("base64")}`;
}

/** Długi tytuł („Restauracja Dom-bar Smacznie zdrowo bo domowo”) dostaje mniejszy krój, żeby zmieścił się w 3 wierszach. */
const titleSize = (title: string) => (title.length > 40 ? 60 : title.length > 24 ? 72 : 88);

type Image = {
  tytul: string;
  podtytul: string;
  zdjecie?: string; // ścieżka w public/, np. „/zdjecia/kategorie/pizza.jpg”
  dopisek?: string; // w pigułce obok adresu, np. „Menu z cenami”
};

export async function shareImage(date: Image) {
  return new Response(await draw(date), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
  });
}

/** PNG w cache — rysowanie trwa ok. pół sekundy, a dane strony zmieniają się rzadko. */
async function draw({ tytul, podtytul, zdjecie, dopisek }: Image): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  cacheLife("hours");

  const [czcionki, logo, tlo] = await Promise.all([
    fonts(),
    image("logo-ciemne-tlo.png", "image/png"),
    zdjecie ? image(zdjecie, "image/jpeg") : null,
  ]);

  const png = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#111111" }}>
        {tlo && (
          // eslint-disable-next-line @next/next/no-img-element -- w next/og działa tylko zwykły <img>
          <img
            src={tlo}
            alt=""
            width={SIZE.width}
            height={SIZE.height}
            style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(90deg, rgba(17,17,17,0.94) 0%, rgba(17,17,17,0.82) 48%, rgba(17,17,17,0.25) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            padding: "56px 64px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- w next/og działa tylko zwykły <img> */}
          <img src={logo} alt="" height={60} width={Math.round((60 * 1793) / 388)} />

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 860 }}>
            <div style={{ width: 96, height: 10, borderRadius: 5, background: "#ff6400" }} />
            <div
              style={{
                marginTop: 26,
                fontFamily: TITLE_FONT,
                fontWeight: 700,
                fontSize: titleSize(tytul),
                lineHeight: 1.04,
                letterSpacing: -1.5,
                color: "#ffffff",
              }}
            >
              {tytul}
            </div>
            <div
              style={{
                marginTop: 22,
                fontFamily: BODY_FONT,
                fontWeight: 700,
                fontSize: 32,
                lineHeight: 1.3,
                color: "#f5ebe1",
              }}
            >
              {podtytul}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: BODY_FONT, fontWeight: 900 }}>
            <div
              style={{
                display: "flex",
                padding: "10px 26px",
                borderRadius: 999,
                background: "#ff6400",
                color: "#111111",
                fontSize: 30,
              }}
            >
              szamanie.pl
            </div>
            {dopisek && (
              <div
                style={{
                  display: "flex",
                  padding: "10px 26px",
                  borderRadius: 999,
                  border: "2px solid rgba(245,235,225,0.5)",
                  color: "#f5ebe1",
                  fontSize: 28,
                }}
              >
                {dopisek}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...SIZE, fonts: czcionki },
  );
  return new Uint8Array(await png.arrayBuffer());
}
