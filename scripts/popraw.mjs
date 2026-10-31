// Ręczne poprawki danych lokalu (dopóki nie ma panelu). Nakładane na dane z OSM przy odczycie,
// więc ponowny import ich nie kasuje.
// Użycie:
//   npm run popraw -- <slug> kuchnie pizza,burger
//   npm run popraw -- <slug> telefon "+48 81 825 00 00"
//   npm run popraw -- <slug> dostawa tak|nie
//   npm run popraw -- <slug> zwierzeta tak|nie    też: wozek (dostępny dla niepełnosprawnych), wege, wegan
//   npm run popraw -- <slug> usun <pole>          cofa poprawkę
//   npm run popraw -- lista
import { openDatabase } from "../src/lib/db/otworz.mjs";

const FIELDS = {
  nazwa: "tekst",
  kuchnie: "lista",
  adres: "tekst",
  miejscowosc: "tekst",
  telefon: "tekst",
  www: "tekst",
  facebook: "tekst",
  instagram: "tekst",
  email: "tekst",
  menu_url: "tekst",
  godziny: "tekst",
  opis: "tekst",
  dostawa: "takNie",
  na_wynos: "takNie",
  // udogodnienia — trafiają do lokalu jako cechy (src/lib/lokale.ts)
  zwierzeta: "takNie",
  wozek: "takNie",
  wege: "takNie",
  wegan: "takNie",
};

const [slug, pole, ...reszta] = process.argv.slice(2);
const db = openDatabase();

if (!slug || slug === "lista") {
  const rows = db
    .prepare("SELECT l.slug, p.pole, p.wartosc FROM poprawki p JOIN lokale l ON l.id = p.lokal_id ORDER BY l.slug")
    .all();
  if (!rows.length) console.log("Brak poprawek.");
  for (const w of rows) console.log(`${w.slug}  ${w.pole} = ${w.wartosc}`);
  process.exit(0);
}

const venue = db.prepare("SELECT id, nazwa FROM lokale WHERE slug = ?").get(slug);
if (!venue) {
  console.error(`Nie ma lokalu o slugu „${slug}”.`);
  process.exit(1);
}

if (pole === "usun") {
  db.prepare("DELETE FROM poprawki WHERE lokal_id = ? AND pole = ?").run(venue.id, reszta[0]);
  console.log(`${venue.nazwa}: usunięto poprawkę „${reszta[0]}”.`);
  process.exit(0);
}

const type = FIELDS[pole];
const text = reszta.join(" ").trim();
if (!type || !text) {
  console.error(`Użycie: npm run popraw -- <slug> <pole> <wartość>. Pola: ${Object.keys(FIELDS).join(", ")}`);
  process.exit(1);
}
const value =
  type === "lista"
    ? text.split(",").map((s) => s.trim()).filter(Boolean)
    : type === "takNie"
      ? /^(tak|1|yes)$/i.test(text)
      : text;

db.prepare(
  `INSERT INTO poprawki (lokal_id, pole, wartosc, autor) VALUES (?, ?, ?, 'admin')
   ON CONFLICT(lokal_id, pole) DO UPDATE SET wartosc = excluded.wartosc, utworzono = datetime('now')`,
).run(venue.id, pole, JSON.stringify(value));
console.log(`${venue.nazwa}: ${pole} = ${JSON.stringify(value)}. Strona pokaże zmianę w ciągu ok. minuty.`);
