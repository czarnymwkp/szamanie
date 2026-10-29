// Site settings. Values come from .env.local (locally) or from environment variables on the server.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://szamanie.pl";

// Data controller shown on /polityka-prywatnosci: full name or company with address (e.g. "Jan Kowalski, ul. …, Kraśnik").
// Read at build time — on the server deploy/wdroz.sh passes /opt/szamanie/.env to the build as .env.production.
export const ADMINISTRATOR = process.env.ADMINISTRATOR ?? "";

// Address venues write to about packages. Empty = no contact button on the "Dla lokali" page.
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "";
