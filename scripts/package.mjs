// Grants paid packages by hand until there is a panel and payments.
// Usage:
//   npm run package -- <slug> <top|galeria> <number of days>   adds a package starting today
//   npm run package -- lista                                   shows active and future packages
import { openDatabase } from "../src/lib/db/open.mjs";

const [polecenie, rodzaj, dni] = process.argv.slice(2);
const db = openDatabase();
// Local date (not UTC), so a package bought at 0:30 does not start „yesterday”.
const day = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

if (polecenie === "lista" || !polecenie) {
  const packages = db
    .prepare(
      `SELECT p.id, l.slug, p.rodzaj, p.od_dnia, p.do_dnia FROM pakiety p
       JOIN lokale l ON l.id = p.lokal_id WHERE p.do_dnia >= ? ORDER BY p.do_dnia`,
    )
    .all(day(new Date()));
  if (!packages.length) console.log("Brak aktywnych pakietów.");
  for (const p of packages) console.log(`#${p.id}  ${p.rodzaj.padEnd(8)} ${p.od_dnia} → ${p.do_dnia}  ${p.slug}`);
} else {
  const slug = polecenie;
  const dayCount = Number(dni);
  if (!["top", "galeria"].includes(rodzaj) || !Number.isInteger(dayCount) || dayCount < 1) {
    console.error("Użycie: npm run pakiet -- <slug> <top|galeria> <liczba dni>");
    process.exit(1);
  }
  const venue = db.prepare("SELECT id, nazwa FROM lokale WHERE slug = ?").get(slug);
  if (!venue) {
    console.error(`Nie ma lokalu o slugu „${slug}”.`);
    process.exit(1);
  }
  const from = new Date();
  const untilDay = new Date(from);
  untilDay.setDate(untilDay.getDate() + dayCount - 1);
  db.prepare("INSERT INTO pakiety (lokal_id, rodzaj, od_dnia, do_dnia) VALUES (?, ?, ?, ?)").run(
    venue.id,
    rodzaj,
    day(from),
    day(untilDay),
  );
  console.log(`${venue.nazwa}: pakiet „${rodzaj}” od ${day(from)} do ${day(untilDay)}.`);
  console.log("Strona pokaże zmianę w ciągu ok. minuty.");
}
