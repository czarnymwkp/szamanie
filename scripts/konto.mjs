// Konta panelu właściciela (logowanie: /panel/logowanie).
// Użycie:
//   npm run konto -- lista                         konta, role i lokale
//   npm run konto -- admin jan@example.com         nadaje rolę admina (zakłada konto, jeśli go nie ma)
//   npm run konto -- lokal jan@example.com <slug>  daje dostęp do lokalu bez zgłoszenia (np. po rozmowie osobiście)
//   npm run konto -- odbierz jan@example.com <slug>
import { otworzBaze } from "../src/lib/db/otworz.mjs";

const [polecenie, emailSurowy, slug] = process.argv.slice(2);
const db = otworzBaze();
const email = emailSurowy?.trim().toLowerCase();

function konto() {
  db.prepare("INSERT OR IGNORE INTO konta (email) VALUES (?)").run(email);
  return db.prepare("SELECT id FROM konta WHERE email = ?").get(email).id;
}

function lokal() {
  const l = db.prepare("SELECT id, nazwa FROM lokale WHERE slug = ?").get(slug);
  if (!l) {
    console.error(`Nie ma lokalu o slugu „${slug}”.`);
    process.exit(1);
  }
  return l;
}

if (!polecenie || polecenie === "lista") {
  const konta = db.prepare("SELECT id, email, rola, ostatnio FROM konta ORDER BY email").all();
  if (!konta.length) console.log("Brak kont.");
  for (const k of konta) {
    const lokale = db
      .prepare("SELECT l.slug FROM lokale_konta lk JOIN lokale l ON l.id = lk.lokal_id WHERE lk.konto_id = ?")
      .all(k.id)
      .map((l) => l.slug);
    console.log(`${k.email}  ${k.rola}  ${lokale.join(", ") || "—"}  ostatnio: ${k.ostatnio ?? "nigdy"}`);
  }
  process.exit(0);
}

if (!email || !email.includes("@")) {
  console.error("Podaj adres e-mail konta.");
  process.exit(1);
}

if (polecenie === "admin") {
  const id = konto();
  db.prepare("UPDATE konta SET rola = 'admin' WHERE id = ?").run(id);
  console.log(`${email}: admin. Zaloguj się na /panel/logowanie.`);
} else if (polecenie === "lokal") {
  const l = lokal();
  db.prepare("INSERT OR IGNORE INTO lokale_konta (lokal_id, konto_id) VALUES (?, ?)").run(l.id, konto());
  console.log(`${email}: dostęp do „${l.nazwa}”.`);
} else if (polecenie === "odbierz") {
  const l = lokal();
  db.prepare("DELETE FROM lokale_konta WHERE lokal_id = ? AND konto_id = (SELECT id FROM konta WHERE email = ?)").run(
    l.id,
    email,
  );
  console.log(`${email}: bez dostępu do „${l.nazwa}”.`);
} else {
  console.error(`Nieznane polecenie „${polecenie}”. Zobacz opis na początku scripts/konto.mjs.`);
  process.exit(1);
}
