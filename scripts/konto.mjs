// Konta panelu właściciela. Na razie bez logowania: do panelu wchodzi się prywatnym linkiem /panel/wejdz/<token>.
// Użycie:
//   npm run konto -- lista                         konta, role i lokale
//   npm run konto -- admin jan@example.com         nadaje rolę admina (zakłada konto, jeśli go nie ma) i daje link
//   npm run konto -- link jan@example.com          nowy link do panelu (poprzedni przestaje działać)
//   npm run konto -- lokal jan@example.com <slug>  daje dostęp do lokalu bez zgłoszenia (np. po rozmowie osobiście)
//   npm run konto -- odbierz jan@example.com <slug>
// Link z domeną z DOMENA (na serwerze, z /opt/szamanie/.env), lokalnie http://localhost:3000.
import { createHash, randomBytes } from "node:crypto";
import { otworzBaze } from "../src/lib/db/otworz.mjs";

const [polecenie, emailSurowy, slug] = process.argv.slice(2);
const db = otworzBaze();
const email = emailSurowy?.trim().toLowerCase();

function konto() {
  db.prepare("INSERT OR IGNORE INTO konta (email) VALUES (?)").run(email);
  return db.prepare("SELECT id FROM konta WHERE email = ?").get(email).id;
}

// jak nowyLink() w src/lib/panel/konta.ts: w bazie tylko SHA-256 tokenu
function link(id) {
  const token = randomBytes(24).toString("base64url");
  db.prepare("UPDATE konta SET link = ? WHERE id = ?").run(createHash("sha256").update(token).digest("hex"), id);
  const adres =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.DOMENA
      ? `https://${process.env.DOMENA}`
      : process.env.NODE_ENV === "production"
        ? "https://szamanie.pl"
        : "http://localhost:3000");
  return `${adres}/panel/wejdz/${token}`;
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
  const konta = db.prepare("SELECT id, email, imie, telefon, rola, ostatnio FROM konta ORDER BY email, imie").all();
  if (!konta.length) console.log("Brak kont.");
  for (const k of konta) {
    const lokale = db
      .prepare("SELECT l.slug FROM lokale_konta lk JOIN lokale l ON l.id = lk.lokal_id WHERE lk.konto_id = ?")
      .all(k.id)
      .map((l) => l.slug);
    const kto = [k.email, k.imie, k.telefon].filter(Boolean).join(", ");
    console.log(`${kto}  ${k.rola}  ${lokale.join(", ") || "—"}  ostatnio: ${k.ostatnio ?? "nigdy"}`);
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
  console.log(`${email}: admin. Wejście do panelu (link zachowaj dla siebie):
${link(id)}`);
} else if (polecenie === "link") {
  const k = db.prepare("SELECT id FROM konta WHERE email = ?").get(email);
  if (!k) {
    console.error(`Nie ma konta ${email}.`);
    process.exit(1);
  }
  console.log(link(k.id));
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
