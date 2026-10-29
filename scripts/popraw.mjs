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

const POLA = {
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
  const wiersze = db
    .prepare("SELECT l.slug, p.pole, p.wartosc FROM poprawki p JOIN lokale l ON l.id = p.lokal_id ORDER BY l.slug")
    .all();
  if (!wiersze.length) console.log("Brak poprawek.");
  for (const w of wiersze) console.log(`${w.slug}  ${w.pole} = ${w.wartosc}`);
  process.exit(0);
}

const lokal = db.prepare("SELECT id, nazwa FROM lokale WHERE slug = ?").get(slug);
if (!lokal) {
  console.error(`Nie ma lokalu o slugu „${slug}”.`);
  process.exit(1);
}

if (pole === "usun") {
  db.prepare("DELETE FROM poprawki WHERE lokal_id = ? AND pole = ?").run(lokal.id, reszta[0]);
  console.log(`${lokal.nazwa}: usunięto poprawkę „${reszta[0]}”.`);
  process.exit(0);
}

const typ = POLA[pole];
const tekst = reszta.join(" ").trim();
if (!typ || !tekst) {
  console.error(`Użycie: npm run popraw -- <slug> <pole> <wartość>. Pola: ${Object.keys(POLA).join(", ")}`);
  process.exit(1);
}
const wartosc =
  typ === "lista"
    ? tekst.split(",").map((s) => s.trim()).filter(Boolean)
    : typ === "takNie"
      ? /^(tak|1|yes)$/i.test(tekst)
      : tekst;

db.prepare(
  `INSERT INTO poprawki (lokal_id, pole, wartosc, autor) VALUES (?, ?, ?, 'admin')
   ON CONFLICT(lokal_id, pole) DO UPDATE SET wartosc = excluded.wartosc, utworzono = datetime('now')`,
).run(lokal.id, pole, JSON.stringify(wartosc));
console.log(`${lokal.nazwa}: ${pole} = ${JSON.stringify(wartosc)}. Strona pokaże zmianę w ciągu ok. minuty.`);
