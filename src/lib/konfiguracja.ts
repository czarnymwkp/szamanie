// Site settings. Values come from .env.local (locally) or from environment variables on the server.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://szamanie.pl";

// Data controller shown on /polityka-prywatnosci: full name or company with address (e.g. "Jan Kowalski, ul. …, Kraśnik").
// Read at build time — on the server deploy/wdroz.sh passes /opt/szamanie/.env to the build as .env.production.
export const ADMIN_EMAIL = process.env.ADMINISTRATOR ?? "";

// Address venues write to about packages. Empty = no contact button on the "Dla lokali" page.
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "";

// Visit statistics: Umami in Coolify (no cookies), e.g. https://statystyki.szamanie.pl/script.js and the website id
// from Umami's settings. Both are public (they end up in the page). Empty = no statistics script.
export const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC ?? "";
export const UMAMI_ID = process.env.NEXT_PUBLIC_UMAMI_ID ?? "";

// Site verification codes (content of the <meta> tag) from Google Search Console ("HTML tag" method) and Bing
// Webmaster Tools. Public by design — they end up in the page. Empty = no tag (DNS verification works without it).
export const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_WERYFIKACJA ?? "";
export const BING_VERIFICATION = process.env.NEXT_PUBLIC_BING_WERYFIKACJA ?? "";
