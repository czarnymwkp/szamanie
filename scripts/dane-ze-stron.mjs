// Uzupełnia dane lokali z ich własnych stron www: telefon, e-mail, Facebook, Instagram, link do menu.
// Wypełnia tylko puste pola (nie nadpisuje danych z OSM ani ręcznych poprawek).
// Logo i zdjęcia zapisuje jako kandydatów (zdjecia.zatwierdzone = 0) w data/kandydaci/ — NIE są publikowane,
// dopóki właściciel lokalu się nie zgodzi (prawa autorskie).
// Grzecznie: sprawdzamy robots.txt, jedno zapytanie o stronę główną, przedstawiamy się w User-Agent.
// Facebooka i Instagrama nie pobieramy (regulaminy zabraniają) — tylko zapisujemy linki.
// Użycie: npm run dane:strony            (strony niesprawdzane od 30 dni)
//         npm run dane:strony -- --wszystkie
import { mkdirSync, writeFileSync } from "node:fs";
import { openDatabase } from "../src/lib/db/otworz.mjs";

const UA = "szamanie.pl-bot/0.1 (+https://szamanie.pl; katalog lokali gastronomicznych)";
const KANDYDACI = "data/kandydaci";
const MAKS_GRAFIKA = 5 * 1024 * 1024;
const wszystkie = process.argv.includes("--wszystkie");

const db = openDatabase();
const lokale = db
  .prepare(
    `SELECT id, slug, nazwa, www FROM lokale WHERE www IS NOT NULL
     ${wszystkie ? "" : "AND (strona_sprawdzona IS NULL OR strona_sprawdzona < datetime('now', '-30 days'))"}`,
  )
  .all();

const uzupelnij = db.prepare(
  `UPDATE lokale SET telefon = COALESCE(telefon, @telefon), email = COALESCE(email, @email),
     facebook = COALESCE(facebook, @facebook), instagram = COALESCE(instagram, @instagram),
     menu_url = COALESCE(menu_url, @menu_url), strona_sprawdzona = datetime('now')
   WHERE id = @id`,
);
const juzJest = db.prepare("SELECT 1 FROM zdjecia WHERE lokal_id = ? AND zrodlo = ?");
const dodajKandydata = db.prepare(
  "INSERT INTO zdjecia (lokal_id, plik, kolejnosc, rodzaj, zrodlo, zatwierdzone) VALUES (?, ?, 0, ?, ?, 0)",
);

const pobierz = (url, akceptuj) =>
  fetch(url, {
    headers: { "User-Agent": UA, Accept: akceptuj },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });

async function robotsPozwala(adres) {
  try {
    const odp = await pobierz(new URL("/robots.txt", adres), "text/plain");
    if (!odp.ok) return true;
    let dlaWszystkich = false;
    for (const linia of (await odp.text()).split(/\r?\n/)) {
      const [klucz, ...reszta] = linia.split(":");
      const k = klucz.trim().toLowerCase();
      const v = reszta.join(":").trim();
      if (k === "user-agent") dlaWszystkich = v === "*" || v.toLowerCase().includes("szamanie");
      else if (dlaWszystkich && k === "disallow" && v === "/") return false;
    }
    return true;
  } catch {
    return true;
  }
}

const bezTagow = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const atrybut = (tag, nazwa) => tag.match(new RegExp(`\\b${nazwa}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1];
const bezwzgledny = (href, baza) => {
  try {
    return new URL(href, baza).href;
  } catch {
    return null;
  }
};

function telefonZLinku(href) {
  const numer = decodeURIComponent(href.replace(/^tel:/i, "")).trim();
  const cyfry = numer.replace(/\D/g, "");
  return cyfry.length === 9 || (cyfry.length === 11 && cyfry.startsWith("48")) ? numer : null;
}

/** Wyciąga z HTML-a dane kontaktowe i adresy grafik. */
function przeanalizuj(html, baza) {
  const wynik = { telefon: null, email: null, facebook: null, instagram: null, menu_url: null, logo: null, zdjecie: null };

  for (const [, atrybuty, tresc] of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = atrybut(atrybuty, "href");
    if (!href) continue;
    if (/^tel:/i.test(href)) wynik.telefon ??= telefonZLinku(href);
    else if (/^mailto:/i.test(href)) wynik.email ??= decodeURIComponent(href.slice(7).split("?")[0]).trim() || null;
    else if (/facebook\.com\/(?!sharer|share|dialog|plugins|tr\b)/i.test(href)) wynik.facebook ??= href;
    else if (/instagram\.com\/(?!p\/|share)/i.test(href)) wynik.instagram ??= href;
    else if (!href.startsWith("#") && /\b(menu|karta|cennik)\b/i.test(bezTagow(tresc))) {
      wynik.menu_url ??= bezwzgledny(href, baza);
    }
  }

  // Dane strukturalne (schema.org) — bywają dokładniejsze niż linki.
  for (const [, json] of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const obiekty = [JSON.parse(json)].flat().flatMap((o) => (o["@graph"] ? o["@graph"] : [o]));
      for (const o of obiekty) {
        if (typeof o.telephone === "string") wynik.telefon ??= o.telephone;
        if (typeof o.email === "string") wynik.email ??= o.email.replace(/^mailto:/i, "");
        const logo = typeof o.logo === "string" ? o.logo : o.logo?.url;
        if (logo) wynik.logo ??= bezwzgledny(logo, baza);
        const menu = typeof o.hasMenu === "string" ? o.hasMenu : typeof o.menu === "string" ? o.menu : null;
        if (menu) wynik.menu_url ??= bezwzgledny(menu, baza);
      }
    } catch {
      // nieprawidłowy JSON-LD — pomijamy
    }
  }

  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (/property=["']og:image["']/i.test(tag)) wynik.zdjecie ??= bezwzgledny(atrybut(tag, "content") ?? "", baza);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    if (/logo/i.test(tag)) {
      const src = atrybut(tag, "src");
      if (src && !src.startsWith("data:")) wynik.logo ??= bezwzgledny(src, baza);
    }
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    if (/rel=["']apple-touch-icon/i.test(tag)) wynik.logo ??= bezwzgledny(atrybut(tag, "href") ?? "", baza);
  }
  return wynik;
}

async function zapiszGrafike(lokal, rodzaj, url) {
  if (!url || juzJest.get(lokal.id, url)) return false;
  try {
    const odp = await pobierz(url, "image/*");
    const typ = odp.headers.get("content-type") ?? "";
    const rozszerzenie = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg" }[
      typ.split(";")[0]
    ];
    if (!odp.ok || !rozszerzenie) return false;
    const dane = Buffer.from(await odp.arrayBuffer());
    if (dane.length > MAKS_GRAFIKA) return false;
    const plik = `${lokal.slug}/${rodzaj}.${rozszerzenie}`;
    mkdirSync(`${KANDYDACI}/${lokal.slug}`, { recursive: true });
    writeFileSync(`${KANDYDACI}/${plik}`, dane);
    dodajKandydata.run(lokal.id, plik, rodzaj, url);
    return true;
  } catch {
    return false;
  }
}

const raport = [];
for (const lokal of lokale) {
  const adres = /^https?:\/\//i.test(lokal.www) ? lokal.www : `https://${lokal.www}`;
  const host = new URL(adres).hostname;
  const brak = { telefon: null, email: null, facebook: null, instagram: null, menu_url: null };

  // Strona www wpisana jako profil FB/IG — nie pobieramy, tylko przenosimy link do właściwego pola.
  if (/(^|\.)facebook\.com$/i.test(host) || /(^|\.)instagram\.com$/i.test(host)) {
    const fb = /facebook/i.test(host);
    uzupelnij.run({ ...brak, id: lokal.id, facebook: fb ? adres : null, instagram: fb ? null : adres });
    raport.push(`${lokal.nazwa}: www to profil ${fb ? "Facebook" : "Instagram"} — przeniesiono link`);
    continue;
  }
  if (!(await robotsPozwala(adres))) {
    uzupelnij.run({ ...brak, id: lokal.id });
    raport.push(`${lokal.nazwa}: robots.txt nie pozwala — pominięto`);
    continue;
  }

  try {
    const odp = await pobierz(adres, "text/html");
    if (!odp.ok || !odp.headers.get("content-type")?.includes("html")) throw new Error(`HTTP ${odp.status}`);
    const dane = przeanalizuj((await odp.text()).slice(0, 2_000_000), odp.url);
    const { logo, zdjecie, ...fakty } = dane;
    uzupelnij.run({ ...fakty, id: lokal.id });
    const grafiki = [
      (await zapiszGrafike(lokal, "logo", logo)) && "logo",
      (await zapiszGrafike(lokal, "zdjecie", zdjecie)) && "zdjęcie",
    ].filter(Boolean);
    const znalezione = Object.entries(fakty)
      .filter(([, v]) => v)
      .map(([k]) => k);
    raport.push(
      `${lokal.nazwa}: ${[...znalezione, ...grafiki.map((g) => `${g} (czeka na zgodę)`)].join(", ") || "nic nowego"}`,
    );
  } catch (blad) {
    raport.push(`${lokal.nazwa}: strona nie odpowiada (${blad.message})`);
  }
}

console.log(raport.length ? raport.join("\n") : "Brak stron do sprawdzenia.");
