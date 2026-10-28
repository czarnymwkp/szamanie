// Ręczne przyznawanie płatnych pakietów, dopóki nie ma panelu i płatności.
// Użycie:
//   npm run pakiet -- <slug> <top|galeria> <liczba dni>   dodaje pakiet od dziś
//   npm run pakiet -- lista                              pokazuje aktywne i przyszłe pakiety
import { openDatabase } from "../src/lib/db/otworz.mjs";

const [polecenie, rodzaj, dni] = process.argv.slice(2);
const db = openDatabase();
// Data lokalna (nie UTC), żeby pakiet kupiony o 0:30 nie zaczynał się „wczoraj”.
const dzien = (data) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;

if (polecenie === "lista" || !polecenie) {
  const pakiety = db
    .prepare(
      `SELECT p.id, l.slug, p.rodzaj, p.od_dnia, p.do_dnia FROM pakiety p
       JOIN lokale l ON l.id = p.lokal_id WHERE p.do_dnia >= ? ORDER BY p.do_dnia`,
    )
    .all(dzien(new Date()));
  if (!pakiety.length) console.log("Brak aktywnych pakietów.");
  for (const p of pakiety) console.log(`#${p.id}  ${p.rodzaj.padEnd(8)} ${p.od_dnia} → ${p.do_dnia}  ${p.slug}`);
} else {
  const slug = polecenie;
  const liczbaDni = Number(dni);
  if (!["top", "galeria"].includes(rodzaj) || !Number.isInteger(liczbaDni) || liczbaDni < 1) {
    console.error("Użycie: npm run pakiet -- <slug> <top|galeria> <liczba dni>");
    process.exit(1);
  }
  const lokal = db.prepare("SELECT id, nazwa FROM lokale WHERE slug = ?").get(slug);
  if (!lokal) {
    console.error(`Nie ma lokalu o slugu „${slug}”.`);
    process.exit(1);
  }
  const od = new Date();
  const doDnia = new Date(od);
  doDnia.setDate(doDnia.getDate() + liczbaDni - 1);
  db.prepare("INSERT INTO pakiety (lokal_id, rodzaj, od_dnia, do_dnia) VALUES (?, ?, ?, ?)").run(
    lokal.id,
    rodzaj,
    dzien(od),
    dzien(doDnia),
  );
  console.log(`${lokal.nazwa}: pakiet „${rodzaj}” od ${dzien(od)} do ${dzien(doDnia)}.`);
  console.log("Strona pokaże zmianę w ciągu ok. minuty.");
}
