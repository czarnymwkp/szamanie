// Uzupełnia dane lokali z ich własnych stron www: telefon, e-mail, Facebook, Instagram, link do menu.
// Wypełnia tylko puste pola (nie nadpisuje danych z OSM ani ręcznych poprawek).
// Logo i zdjęcia zapisuje jako kandydatów (zdjecia.zatwierdzone = 0) w data/kandydaci/ — NIE są publikowane,
// dopóki właściciel lokalu się nie zgodzi (prawa autorskie).
// Grzecznie: sprawdzamy robots.txt, jedno zapytanie o stronę główną, przedstawiamy się w User-Agent.
// Facebooka i Instagrama nie pobieramy (regulaminy zabraniają) — tylko zapisujemy linki.
// Użycie: npm run dane:strony            (strony niesprawdzane od 30 dni)
//         npm run dane:strony -- --wszystkie
import { mkdirSync, writeFileSync } from "node:fs";
import { openDatabase } from "../src/lib/db/open.mjs";

const UA = "szamanie.pl-bot/0.1 (+https://szamanie.pl; katalog lokali gastronomicznych)";
const CANDIDATES = "data/kandydaci";
const MAX_IMAGE = 5 * 1024 * 1024;
const all = process.argv.includes("--wszystkie");

const db = openDatabase();
const venues = db
  .prepare(
    `SELECT id, slug, nazwa, www FROM lokale WHERE www IS NOT NULL
     ${all ? "" : "AND (strona_sprawdzona IS NULL OR strona_sprawdzona < datetime('now', '-30 days'))"}`,
  )
  .all();

const fillIn = db.prepare(
  `UPDATE lokale SET telefon = COALESCE(telefon, @telefon), email = COALESCE(email, @email),
     facebook = COALESCE(facebook, @facebook), instagram = COALESCE(instagram, @instagram),
     menu_url = COALESCE(menu_url, @menu_url), strona_sprawdzona = datetime('now')
   WHERE id = @id`,
);
const alreadyExists = db.prepare("SELECT 1 FROM zdjecia WHERE lokal_id = ? AND zrodlo = ?");
const addCandidate = db.prepare(
  "INSERT INTO zdjecia (lokal_id, plik, kolejnosc, rodzaj, zrodlo, zatwierdzone) VALUES (?, ?, 0, ?, ?, 0)",
);

const fetchData = (url, accept) =>
  fetch(url, {
    headers: { "User-Agent": UA, Accept: accept },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });

async function robotsAllows(address) {
  try {
    const res = await fetchData(new URL("/robots.txt", address), "text/plain");
    if (!res.ok) return true;
    let forEveryone = false;
    for (const line of (await res.text()).split(/\r?\n/)) {
      const [klucz, ...reszta] = line.split(":");
      const k = klucz.trim().toLowerCase();
      const v = reszta.join(":").trim();
      if (k === "user-agent") forEveryone = v === "*" || v.toLowerCase().includes("szamanie");
      else if (forEveryone && k === "disallow" && v === "/") return false;
    }
    return true;
  } catch {
    return true;
  }
}

const stripTags = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1];
const absolute = (href, database) => {
  try {
    return new URL(href, database).href;
  } catch {
    return null;
  }
};

function phoneFromLink(href) {
  const number = decodeURIComponent(href.replace(/^tel:/i, "")).trim();
  const digits = number.replace(/\D/g, "");
  return digits.length === 9 || (digits.length === 11 && digits.startsWith("48")) ? number : null;
}

/** Wyciąga z HTML-a dane kontaktowe i adresy grafik. */
function analyze(html, database) {
  const result = { telefon: null, email: null, facebook: null, instagram: null, menu_url: null, logo: null, zdjecie: null };

  for (const [, atrybuty, tresc] of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attribute(atrybuty, "href");
    if (!href) continue;
    if (/^tel:/i.test(href)) result.telefon ??= phoneFromLink(href);
    else if (/^mailto:/i.test(href)) result.email ??= decodeURIComponent(href.slice(7).split("?")[0]).trim() || null;
    else if (/facebook\.com\/(?!sharer|share|dialog|plugins|tr\b)/i.test(href)) result.facebook ??= href;
    else if (/instagram\.com\/(?!p\/|share)/i.test(href)) result.instagram ??= href;
    else if (!href.startsWith("#") && /\b(menu|karta|cennik)\b/i.test(stripTags(tresc))) {
      result.menu_url ??= absolute(href, database);
    }
  }

  // Dane strukturalne (schema.org) — bywają dokładniejsze niż linki.
  for (const [, json] of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const objects = [JSON.parse(json)].flat().flatMap((o) => (o["@graph"] ? o["@graph"] : [o]));
      for (const o of objects) {
        if (typeof o.telephone === "string") result.telefon ??= o.telephone;
        if (typeof o.email === "string") result.email ??= o.email.replace(/^mailto:/i, "");
        const logo = typeof o.logo === "string" ? o.logo : o.logo?.url;
        if (logo) result.logo ??= absolute(logo, database);
        const menu = typeof o.hasMenu === "string" ? o.hasMenu : typeof o.menu === "string" ? o.menu : null;
        if (menu) result.menu_url ??= absolute(menu, database);
      }
    } catch {
      // nieprawidłowy JSON-LD — pomijamy
    }
  }

  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (/property=["']og:image["']/i.test(tag)) result.zdjecie ??= absolute(attribute(tag, "content") ?? "", database);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    if (/logo/i.test(tag)) {
      const src = attribute(tag, "src");
      if (src && !src.startsWith("data:")) result.logo ??= absolute(src, database);
    }
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    if (/rel=["']apple-touch-icon/i.test(tag)) result.logo ??= absolute(attribute(tag, "href") ?? "", database);
  }
  return result;
}

async function saveImage(venue, kind, url) {
  if (!url || alreadyExists.get(venue.id, url)) return false;
  try {
    const res = await fetchData(url, "image/*");
    const type = res.headers.get("content-type") ?? "";
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg" }[
      type.split(";")[0]
    ];
    if (!res.ok || !extension) return false;
    const date = Buffer.from(await res.arrayBuffer());
    if (date.length > MAX_IMAGE) return false;
    const file = `${venue.slug}/${kind}.${extension}`;
    mkdirSync(`${CANDIDATES}/${venue.slug}`, { recursive: true });
    writeFileSync(`${CANDIDATES}/${file}`, date);
    addCandidate.run(venue.id, file, kind, url);
    return true;
  } catch {
    return false;
  }
}

const report = [];
for (const venue of venues) {
  const address = /^https?:\/\//i.test(venue.www) ? venue.www : `https://${venue.www}`;
  const host = new URL(address).hostname;
  const missing = { telefon: null, email: null, facebook: null, instagram: null, menu_url: null };

  // Strona www wpisana jako profil FB/IG — nie pobieramy, tylko przenosimy link do właściwego pola.
  if (/(^|\.)facebook\.com$/i.test(host) || /(^|\.)instagram\.com$/i.test(host)) {
    const fb = /facebook/i.test(host);
    fillIn.run({ ...missing, id: venue.id, facebook: fb ? address : null, instagram: fb ? null : address });
    report.push(`${venue.nazwa}: www to profil ${fb ? "Facebook" : "Instagram"} — przeniesiono link`);
    continue;
  }
  if (!(await robotsAllows(address))) {
    fillIn.run({ ...missing, id: venue.id });
    report.push(`${venue.nazwa}: robots.txt nie pozwala — pominięto`);
    continue;
  }

  try {
    const res = await fetchData(address, "text/html");
    if (!res.ok || !res.headers.get("content-type")?.includes("html")) throw new Error(`HTTP ${res.status}`);
    const date = analyze((await res.text()).slice(0, 2_000_000), res.url);
    const { logo, zdjecie, ...fakty } = date;
    fillIn.run({ ...fakty, id: venue.id });
    const images = [
      (await saveImage(venue, "logo", logo)) && "logo",
      (await saveImage(venue, "zdjecie", zdjecie)) && "zdjęcie",
    ].filter(Boolean);
    const found = Object.entries(fakty)
      .filter(([, v]) => v)
      .map(([k]) => k);
    report.push(
      `${venue.nazwa}: ${[...found, ...images.map((g) => `${g} (czeka na zgodę)`)].join(", ") || "nic nowego"}`,
    );
  } catch (error) {
    report.push(`${venue.nazwa}: strona nie odpowiada (${error.message})`);
  }
}

console.log(report.length ? report.join("\n") : "Brak stron do sprawdzenia.");
