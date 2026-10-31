// The image Facebook, Messenger or WhatsApp show next to a link to szamanie.pl (og:image). Drawn by next/og: an
// illustrative photo, the logo, the page title. The fonts (OFL) live in public/fonty/ — the generator does not read
// woff2 from next/font, and the default typeface has no Polish characters.

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
  // Every file under its own name: the generator treats files with the same name and weight as one typeface and loses
  // the Polish characters from the second one (latin-ext). Styles give both names: TITLE_FONT, BODY_FONT.
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

/** A long title („Restauracja Dom-bar Smacznie zdrowo bo domowo”) gets a smaller size, so it fits in 3 lines. */
const titleSize = (title: string) => (title.length > 40 ? 60 : title.length > 24 ? 72 : 88);

type Image = {
  tytul: string;
  podtytul: string;
  zdjecie?: string; // path in public/, e.g. „/zdjecia/kategorie/pizza.jpg”
  dopisek?: string; // in the pill next to the address, e.g. „Menu z cenami”
};

export async function shareImage(date: Image) {
  return new Response(await draw(date), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
  });
}

/** PNG in the cache — drawing takes about half a second, and page data changes rarely. */
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
          // eslint-disable-next-line @next/next/no-img-element -- next/og only supports a plain <img>
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
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og only supports a plain <img> */}
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
