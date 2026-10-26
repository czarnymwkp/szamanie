import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { ADRES_SERWISU, KONTAKT_EMAIL } from "../konfiguracja";

// Wysyłka maili przez SMTP skrzynki na domenie (zmienne SMTP_* w .env). Bez SMTP_HOST maile lądują w logach
// serwera — wygodne lokalnie, a na serwerze admin może wtedy przeczytać kod z `docker compose logs app`.

let transport: Transporter | null = null;

function poczta() {
  if (!process.env.SMTP_HOST) return null;
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_HASLO },
  });
  return transport;
}

async function wyslij(do_: string, temat: string, tekst: string) {
  const t = poczta();
  if (!t) {
    console.log(`[poczta] do: ${do_}\n[poczta] temat: ${temat}\n${tekst}\n`);
    return;
  }
  await t.sendMail({
    from: process.env.SMTP_OD ?? `szamanie.pl <${process.env.SMTP_USER}>`,
    to: do_,
    subject: temat,
    text: tekst,
  });
}

export function wyslijKodLogowania(email: string, kod: string) {
  return wyslij(
    email,
    `${kod} — kod logowania do szamanie.pl`,
    [
      `Twój kod logowania do panelu szamanie.pl: ${kod}`,
      "",
      "Kod jest ważny 10 minut. Jeśli to nie Ty prosiłeś o kod, zignoruj tę wiadomość.",
      "",
      `${ADRES_SERWISU}/panel`,
    ].join("\n"),
  );
}

/** Powiadomienie dla admina (KONTAKT_EMAIL), np. o nowym zgłoszeniu lokalu. Bez adresu — tylko w logach. */
export function powiadomAdmina(temat: string, tekst: string) {
  if (!KONTAKT_EMAIL) {
    console.log(`[poczta] (admin) ${temat}\n${tekst}\n`);
    return Promise.resolve();
  }
  return wyslij(KONTAKT_EMAIL, temat, tekst);
}

export function wyslijDoWlasciciela(email: string, temat: string, tekst: string) {
  return wyslij(email, temat, tekst);
}
