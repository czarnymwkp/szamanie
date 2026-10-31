// Owner panel accounts. No login for now: the panel is entered with a private link /panel/wejdz/<token>.
// Usage:
//   npm run account -- lista                         accounts, roles and venues
//   npm run account -- admin jan@example.com         grants the admin role (creates the account if missing) and prints a link
//   npm run account -- link jan@example.com          new panel link (the previous one stops working)
//   npm run account -- lokal jan@example.com <slug>  gives access to a venue without a claim (e.g. after talking in person)
//   npm run konto -- odbierz jan@example.com <slug>
// Link with the domain from DOMENA (on the server, from /opt/szamanie/.env), locally http://localhost:3000.
import { createHash, randomBytes } from "node:crypto";
import { openDatabase } from "../src/lib/db/open.mjs";

const [polecenie, emailSurowy, slug] = process.argv.slice(2);
const db = openDatabase();
const email = emailSurowy?.trim().toLowerCase();

function account() {
  db.prepare("INSERT OR IGNORE INTO konta (email) VALUES (?)").run(email);
  return db.prepare("SELECT id FROM konta WHERE email = ?").get(email).id;
}

// like newPanelLink() in src/lib/panel/accounts.ts: the database keeps only the SHA-256 of the token
function link(id) {
  const token = randomBytes(24).toString("base64url");
  db.prepare("UPDATE konta SET link = ? WHERE id = ?").run(createHash("sha256").update(token).digest("hex"), id);
  const address =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.DOMENA
      ? `https://${process.env.DOMENA}`
      : process.env.NODE_ENV === "production"
        ? "https://szamanie.pl"
        : "http://localhost:3000");
  return `${address}/panel/wejdz/${token}`;
}

function venue() {
  const l = db.prepare("SELECT id, nazwa FROM lokale WHERE slug = ?").get(slug);
  if (!l) {
    console.error(`Nie ma lokalu o slugu „${slug}”.`);
    process.exit(1);
  }
  return l;
}

if (!polecenie || polecenie === "lista") {
  const accounts = db.prepare("SELECT id, email, imie, telefon, rola, ostatnio FROM konta ORDER BY email, imie").all();
  if (!accounts.length) console.log("Brak kont.");
  for (const k of accounts) {
    const venues = db
      .prepare("SELECT l.slug FROM lokale_konta lk JOIN lokale l ON l.id = lk.lokal_id WHERE lk.konto_id = ?")
      .all(k.id)
      .map((l) => l.slug);
    const who = [k.email, k.imie, k.telefon].filter(Boolean).join(", ");
    console.log(`${who}  ${k.rola}  ${venues.join(", ") || "—"}  ostatnio: ${k.ostatnio ?? "nigdy"}`);
  }
  process.exit(0);
}

if (!email || !email.includes("@")) {
  console.error("Podaj adres e-mail konta.");
  process.exit(1);
}

if (polecenie === "admin") {
  const id = account();
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
  const l = venue();
  db.prepare("INSERT OR IGNORE INTO lokale_konta (lokal_id, konto_id) VALUES (?, ?)").run(l.id, account());
  console.log(`${email}: dostęp do „${l.nazwa}”.`);
} else if (polecenie === "odbierz") {
  const l = venue();
  db.prepare("DELETE FROM lokale_konta WHERE lokal_id = ? AND konto_id = (SELECT id FROM konta WHERE email = ?)").run(
    l.id,
    email,
  );
  console.log(`${email}: bez dostępu do „${l.nazwa}”.`);
} else {
  console.error(`Nieznane polecenie „${polecenie}”. Zobacz opis na początku scripts/konto.mjs.`);
  process.exit(1);
}
