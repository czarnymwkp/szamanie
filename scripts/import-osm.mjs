// Pobiera lokale gastronomiczne z OpenStreetMap (Overpass API) z powiatów z listy POWIATY
// i zapisuje je do bazy. Lokale z reczna_edycja = 1 są pomijane, a lokali usuniętych z OSM nie kasujemy.
// Użycie: npm run import:osm
import { otworzBaze } from "../src/lib/db/otworz.mjs";
import { slugify } from "../src/lib/slug.mjs";

// Obszar katalogu. Priorytet: powiat kraśnicki; kolejne powiaty dopisuj tutaj (nazwy jak w OSM).
const POWIATY = ["powiat kraśnicki"];
const TYPY = ["restaurant", "fast_food", "cafe", "pub", "bar", "ice_cream", "food_court"];

// Najpierw miejscowości powiatu, potem dla każdej gminy: jej relacja i lokale w jej granicach.
const zapytanie = `[out:json][timeout:120];
rel["boundary"="administrative"]["admin_level"="6"]["name"~"^(${POWIATY.join("|")})$"];
map_to_area->.powiat;
node["place"~"^(town|village|hamlet)$"](area.powiat);
out;
rel["boundary"="administrative"]["admin_level"="7"](area.powiat)->.gminy;
foreach.gminy->.g(
  .g out tags;
  .g map_to_area->.a;
  nwr["amenity"~"^(${TYPY.join("|")})$"](area.a)(area.powiat);
  out center tags;
);`;

// Publiczne serwery Overpass bywają przeciążone (502/504/429), więc próbujemy po kolei.
const SERWERY = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function pobierz() {
  // kilka rund po wszystkich serwerach, z przerwą — przeciążenie zwykle mija po paru minutach
  for (let runda = 1; runda <= 6; runda++) {
    try {
      return await jednaRunda();
    } catch (blad) {
      if (runda === 6 || blad.message.startsWith("Błąd w zapytaniu")) throw blad;
      console.warn(`Runda ${runda} nieudana, ponawiam za 30 s…`);
      await new Promise((r) => setTimeout(r, 30_000));
    }
  }
}

async function jednaRunda() {
  for (const serwer of SERWERY) {
    const odp = await fetch(serwer, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "szamanie.pl/0.1" },
      body: "data=" + encodeURIComponent(zapytanie),
    }).catch((blad) => ({ ok: false, status: blad.message, text: async () => "" }));
    if (odp.ok) {
      const dane = await odp.json();
      // Niektóre serwery zapasowe nie mają danych o obszarach (map_to_area) i zwracają pusty wynik.
      if (dane.elements?.some((e) => e.type === "relation")) return dane;
      console.warn(`${serwer}: pusta odpowiedź (brak danych o gminach), próbuję następny serwer…`);
      continue;
    }
    if (odp.status === 400) throw new Error(`Błąd w zapytaniu Overpass:\n${(await odp.text()).slice(0, 1500)}`);
    console.warn(`${serwer}: ${odp.status}, próbuję następny serwer…`);
  }
  throw new Error("Żaden serwer Overpass nie odpowiedział. Spróbuj za kilka minut.");
}

const { elements } = await pobierz();

const miejscowosci = elements.filter((e) => e.type === "node" && e.tags?.place && e.tags.name);

// Dla lokali bez adresu przyjmujemy najbliższą miejscowość.
function najblizszaMiejscowosc(lat, lon) {
  let najlepsza = null;
  let min = Infinity;
  for (const m of miejscowosci) {
    const d = (m.lat - lat) ** 2 + ((m.lon - lon) * Math.cos((lat * Math.PI) / 180)) ** 2;
    if (d < min) {
      min = d;
      najlepsza = m.tags.name;
    }
  }
  return najlepsza;
}

const pierwszy = (wartosc) => wartosc?.split(";")[0].trim() || null;

// Udogodnienia z tagów OSM, zapisywane jako JSON w lokale.cechy.
function cechy(t) {
  const c = {};
  if (t.outdoor_seating === "yes") c.ogrodek = true;
  if (t.wheelchair === "yes" || t.wheelchair === "limited") c.wozek = t.wheelchair;
  if (t.dog === "yes" || t.dog === "leashed") c.zwierzeta = true;
  if (["payment:cards", "payment:debit_cards", "payment:credit_cards", "payment:visa"].some((k) => t[k] === "yes")) {
    c.karta = true;
  }
  if (t.internet_access === "wlan" || t.internet_access === "yes") c.wifi = true;
  if (t["diet:vegetarian"] === "yes" || t["diet:vegetarian"] === "only") c.wege = true;
  if (t["diet:vegan"] === "yes" || t["diet:vegan"] === "only") c.wegan = true;
  if (t.air_conditioning === "yes") c.klimatyzacja = true;
  if (t.indoor_seating === "no" || t.takeaway === "only") c.tylkoNaWynos = true;
  return JSON.stringify(c);
}

const lokale = new Map();
let gmina = null;
for (const e of elements) {
  if (e.type === "relation") {
    gmina = e.tags.name;
    continue;
  }
  const t = e.tags;
  const osmId = `${e.type}-${e.id}`;
  if (!t?.amenity || !t.name || lokale.has(osmId)) continue;
  const lat = e.lat ?? e.center.lat;
  const lon = e.lon ?? e.center.lon;
  const gminaMiejska = !gmina.startsWith("gmina ");
  const ulica = t["addr:street"] ?? t["addr:place"] ?? null;
  lokale.set(osmId, {
    osm_id: osmId,
    nazwa: t.name,
    typ: t.amenity,
    kuchnie: JSON.stringify(t.cuisine ? t.cuisine.split(";").map((k) => k.trim()).filter(Boolean) : []),
    lat,
    lon,
    gmina: gminaMiejska ? gmina : gmina.replace(/^gmina /, "gm. "),
    miejscowosc:
      t["addr:city"] ?? t["addr:place"] ?? (gminaMiejska ? gmina : najblizszaMiejscowosc(lat, lon)),
    adres: ulica ? [ulica, t["addr:housenumber"]].filter(Boolean).join(" ") : null,
    // część lokali ma w OSM tylko „mobile” (np. Smakuś)
    telefon: pierwszy(t.phone ?? t["contact:phone"] ?? t.mobile ?? t["contact:mobile"]),
    www: pierwszy(t.website ?? t["contact:website"]),
    facebook: pierwszy(t["contact:facebook"] ?? t.facebook),
    instagram: pierwszy(t["contact:instagram"] ?? t.instagram),
    email: pierwszy(t.email ?? t["contact:email"]),
    menu_url: pierwszy(t["website:menu"] ?? t["menu:url"]),
    godziny: t.opening_hours ?? null,
    dostawa: t.delivery === "yes" ? 1 : 0,
    na_wynos: t.takeaway === "yes" || t.takeaway === "only" ? 1 : 0,
    cechy: cechy(t),
  });
}

// Te pola mogą też przyjść z innych źródeł (np. ze strony lokalu), więc import nadpisuje je tylko
// wtedy, gdy OSM ma wartość — brak w OSM nie kasuje danych zdobytych gdzie indziej.
const UZUPELNIANE = ["adres", "telefon", "www", "facebook", "instagram", "email", "menu_url", "godziny"];

const db = otworzBaze();
const znajdz = db.prepare("SELECT id, reczna_edycja FROM lokale WHERE osm_id = ?");
const slugZajety = db.prepare("SELECT 1 FROM lokale WHERE slug = ?");
const POLA = Object.keys(lokale.values().next().value ?? {});
const wstaw = db.prepare(
  `INSERT INTO lokale (slug, ${POLA.join(", ")}) VALUES (@slug, ${POLA.map((p) => "@" + p).join(", ")})`,
);
const aktualizuj = db.prepare(
  `UPDATE lokale SET ${POLA.map((p) => (UZUPELNIANE.includes(p) ? `${p} = COALESCE(@${p}, ${p})` : `${p} = @${p}`)).join(", ")},
       zaktualizowano = datetime('now')
   WHERE id = @id`,
);

function wolnySlug(lokal) {
  const nazwa = slugify(lokal.nazwa);
  const miejsce = lokal.miejscowosc ? slugify(lokal.miejscowosc) : "";
  const baza = miejsce && !nazwa.includes(miejsce) ? `${nazwa}-${miejsce}` : nazwa;
  let slug = baza;
  for (let i = 2; slugZajety.get(slug); i++) slug = `${baza}-${i}`;
  return slug;
}

const licznik = { nowe: 0, zaktualizowane: 0, pominiete: 0 };
const zapiszMiejscowosc = db.prepare(
  `INSERT INTO miejscowosci (nazwa, typ, lat, lon) VALUES (?, ?, ?, ?)
   ON CONFLICT(nazwa) DO UPDATE SET typ = excluded.typ, lat = excluded.lat, lon = excluded.lon`,
);
db.exec("BEGIN");
try {
  for (const m of miejscowosci) {
    if (m.tags.place !== "hamlet") zapiszMiejscowosc.run(m.tags.name, m.tags.place, m.lat, m.lon);
  }
  for (const lokal of lokale.values()) {
    const istniejacy = znajdz.get(lokal.osm_id);
    if (!istniejacy) {
      wstaw.run({ ...lokal, slug: wolnySlug(lokal) });
      licznik.nowe++;
    } else if (istniejacy.reczna_edycja) {
      licznik.pominiete++;
    } else {
      aktualizuj.run({ ...lokal, id: istniejacy.id });
      licznik.zaktualizowane++;
    }
  }
  db.exec("COMMIT");
} catch (blad) {
  db.exec("ROLLBACK");
  throw blad;
}

console.log(
  `Z OSM: ${lokale.size} lokali. Nowe: ${licznik.nowe}, zaktualizowane: ${licznik.zaktualizowane}, ` +
    `pominięte (ręczna edycja): ${licznik.pominiete}.`,
);
