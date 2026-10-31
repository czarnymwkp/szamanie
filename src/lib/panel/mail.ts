import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { SITE_URL, CONTACT_EMAIL } from "../config";

// Wysyłka maili przez SMTP skrzynki na domenie (zmienne SMTP_* w .env). Bez SMTP_HOST maile lądują w logach
// serwera — wygodne lokalnie, a na serwerze admin może wtedy przeczytać kod z `docker compose logs app`.

let transport: Transporter | null = null;

function mailer() {
  if (!process.env.SMTP_HOST) return null;
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_HASLO },
  });
  return transport;
}

async function send(until_: string, subject: string, text: string) {
  const t = mailer();
  if (!t) {
    console.log(`[poczta] do: ${until_}\n[poczta] temat: ${subject}\n${text}\n`);
    return;
  }
  await t.sendMail({
    from: process.env.SMTP_OD ?? `szamanie.pl <${process.env.SMTP_USER}>`,
    to: until_,
    subject: subject,
    text: text,
  });
}

export function sendLoginCode(email: string, code: string) {
  return send(
    email,
    `${code} — kod logowania do szamanie.pl`,
    [
      `Twój kod logowania do panelu szamanie.pl: ${code}`,
      "",
      "Kod jest ważny 10 minut. Jeśli to nie Ty prosiłeś o kod, zignoruj tę wiadomość.",
      "",
      `${SITE_URL}/panel`,
    ].join("\n"),
  );
}

/** Powiadomienie dla admina (CONTACT_EMAIL), np. o nowym zgłoszeniu lokalu. Bez adresu — tylko w logach. */
export function notifyAdmin(subject: string, text: string) {
  if (!CONTACT_EMAIL) {
    console.log(`[poczta] (admin) ${subject}\n${text}\n`);
    return Promise.resolve();
  }
  return send(CONTACT_EMAIL, subject, text);
}

export function sendToOwner(email: string, subject: string, text: string) {
  return send(email, subject, text);
}
