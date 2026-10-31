// Pobiera lokale gastronomiczne z OpenStreetMap (Overpass API) z powiatów z listy POWIATY
// i zapisuje je do bazy. Lokale z reczna_edycja = 1 są pomijane, a lokali usuniętych z OSM nie kasujemy.
// Użycie: npm run import:osm
import { openDatabase } from "../src/lib/db/otworz.mjs";
import { slugify } from "../src/lib/slug.mjs";

// Obszar katalogu. Priorytet: powiat kraśnicki; kolejne powiaty dopisuj tutaj (nazwy jak w OSM).
const COUNTIES = ["powiat kraśnicki"];
const TYPES = ["restaurant", "fast_food", "cafe", "pub", "bar", "ice_cream", "food_court"];

// Najpierw miejscowości powiatu, potem dla każdej gminy: jej relacja i lokale w jej granicach.
const query = `[out:json][timeout:120];
rel["boundary"="administrative"]["admin_level"="6"]["name"~"^(${COUNTIES.join("|")})$"];
map_to_area->.powiat;
node["place"~"^(town|village|hamlet)$"](area.powiat);
out;
rel["boundary"="administrative"]["admin_level"="7"](area.powiat)->.gminy;
foreach.gminy->.g(
  .g out tags;
  .g map_to_area->.a;
  nwr["amenity"~"^(${TYPES.join("|")})$"](area.a)(area.powiat);
  out center tags;
);`;

// Publiczne serwery Overpass bywają przeciążone (502/504/429), więc próbujemy po kolei.
const SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function fetchData() {
  // kilka rund po wszystkich serwerach, z przerwą — przeciążenie zwykle mija po paru minutach
  for (let round = 1; round <= 6; round++) {
    try {
      return await oneRound();
    } catch (error) {
      if (round === 6 || error.message.startsWith("Błąd w zapytaniu")) throw error;
      console.warn(`Runda ${round} nieudana, ponawiam za 30 s…`);
      await new Promise((r) => setTimeout(r, 30_000));
    }
  }
}

async function oneRound() {
  for (const server of SERVERS) {
    const res = await fetch(server, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "szamanie.pl/0.1" },
      body: "data=" + encodeURIComponent(query),
    }).catch((error) => ({ ok: false, status: error.message, text: async () => "" }));
    if (res.ok) {
      const date = await res.json();
      // Niektóre serwery zapasowe nie mają danych o obszarach (map_to_area) i zwracają pusty wynik.
      if (date.elements?.some((e) => e.type === "relation")) return date;
      console.warn(`${server}: pusta odpowiedź (brak danych o gminach), próbuję następny serwer…`);
      continue;
    }
    if (res.status === 400) throw new Error(`Błąd w zapytaniu Overpass:\n${(await res.text()).slice(0, 1500)}`);
    console.warn(`${server}: ${res.status}, próbuję następny serwer…`);
  }
  throw new Error("Żaden serwer Overpass nie odpowiedział. Spróbuj za kilka minut.");
}

const { elements } = await fetchData();

const towns = elements.filter((e) => e.type === "node" && e.tags?.place && e.tags.name);

// Dla lokali bez adresu przyjmujemy najbliższą miejscowość.
function nearestTown(lat, lon) {
  let best = null;
  let min = Infinity;
  for (const m of towns) {
    const d = (m.lat - lat) ** 2 + ((m.lon - lon) * Math.cos((lat * Math.PI) / 180)) ** 2;
    if (d < min) {
      min = d;
      best = m.tags.name;
    }
  }
  return best;
}

const isFirst = (value) => value?.split(";")[0].trim() || null;

// Udogodnienia z tagów OSM, zapisywane jako JSON w lokale.cechy.
function features(t) {
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

const venues = new Map();
let commune = null;
for (const e of elements) {
  if (e.type === "relation") {
    commune = e.tags.name;
    continue;
  }
  const t = e.tags;
  const osmId = `${e.type}-${e.id}`;
  if (!t?.amenity || !t.name || venues.has(osmId)) continue;
  const lat = e.lat ?? e.center.lat;
  const lon = e.lon ?? e.center.lon;
  const urbanCommune = !commune.startsWith("gmina ");
  const street = t["addr:street"] ?? t["addr:place"] ?? null;
  venues.set(osmId, {
    osm_id: osmId,
    nazwa: t.name,
    typ: t.amenity,
    kuchnie: JSON.stringify(t.cuisine ? t.cuisine.split(";").map((k) => k.trim()).filter(Boolean) : []),
    lat,
    lon,
    gmina: urbanCommune ? commune : commune.replace(/^gmina /, "gm. "),
    miejscowosc:
      t["addr:city"] ?? t["addr:place"] ?? (urbanCommune ? commune : nearestTown(lat, lon)),
    adres: street ? [street, t["addr:housenumber"]].filter(Boolean).join(" ") : null,
    // część lokali ma w OSM tylko „mobile” (np. Smakuś)
    telefon: isFirst(t.phone ?? t["contact:phone"] ?? t.mobile ?? t["contact:mobile"]),
    www: isFirst(t.website ?? t["contact:website"]),
    facebook: isFirst(t["contact:facebook"] ?? t.facebook),
    instagram: isFirst(t["contact:instagram"] ?? t.instagram),
    email: isFirst(t.email ?? t["contact:email"]),
    menu_url: isFirst(t["website:menu"] ?? t["menu:url"]),
    godziny: t.opening_hours ?? null,
    dostawa: t.delivery === "yes" ? 1 : 0,
    na_wynos: t.takeaway === "yes" || t.takeaway === "only" ? 1 : 0,
    cechy: features(t),
  });
}

// Te pola mogą też przyjść z innych źródeł (np. ze strony lokalu), więc import nadpisuje je tylko
// wtedy, gdy OSM ma wartość — brak w OSM nie kasuje danych zdobytych gdzie indziej.
const FILLED_IN = ["adres", "telefon", "www", "facebook", "instagram", "email", "menu_url", "godziny"];

const db = openDatabase();
const find = db.prepare("SELECT id, reczna_edycja FROM lokale WHERE osm_id = ?");
const slugTaken = db.prepare("SELECT 1 FROM lokale WHERE slug = ?");
const FIELDS = Object.keys(venues.values().next().value ?? {});
const insert = db.prepare(
  `INSERT INTO lokale (slug, ${FIELDS.join(", ")}) VALUES (@slug, ${FIELDS.map((p) => "@" + p).join(", ")})`,
);
const update = db.prepare(
  `UPDATE lokale SET ${FIELDS.map((p) => (FILLED_IN.includes(p) ? `${p} = COALESCE(@${p}, ${p})` : `${p} = @${p}`)).join(", ")},
       zaktualizowano = datetime('now')
   WHERE id = @id`,
);

function freeSlug(venue) {
  const name = slugify(venue.nazwa);
  const place = venue.miejscowosc ? slugify(venue.miejscowosc) : "";
  const database = place && !name.includes(place) ? `${name}-${place}` : name;
  let slug = database;
  for (let i = 2; slugTaken.get(slug); i++) slug = `${database}-${i}`;
  return slug;
}

const counter = { nowe: 0, zaktualizowane: 0, pominiete: 0 };
const saveTown = db.prepare(
  `INSERT INTO miejscowosci (nazwa, typ, lat, lon) VALUES (?, ?, ?, ?)
   ON CONFLICT(nazwa) DO UPDATE SET typ = excluded.typ, lat = excluded.lat, lon = excluded.lon`,
);
db.exec("BEGIN");
try {
  for (const m of towns) {
    if (m.tags.place !== "hamlet") saveTown.run(m.tags.name, m.tags.place, m.lat, m.lon);
  }
  for (const venue of venues.values()) {
    const existingOne = find.get(venue.osm_id);
    if (!existingOne) {
      insert.run({ ...venue, slug: freeSlug(venue) });
      counter.nowe++;
    } else if (existingOne.reczna_edycja) {
      counter.pominiete++;
    } else {
      update.run({ ...venue, id: existingOne.id });
      counter.zaktualizowane++;
    }
  }
  db.exec("COMMIT");
} catch (failure) {
  db.exec("ROLLBACK");
  throw failure;
}

console.log(
  `Z OSM: ${venues.size} lokali. Nowe: ${counter.nowe}, zaktualizowane: ${counter.zaktualizowane}, ` +
    `pominięte (ręczna edycja): ${counter.pominiete}.`,
);
