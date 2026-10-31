import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "../db";

// Konta właścicieli lokali i sesje. Sesja = losowy token w ciasteczku httpOnly; w bazie tylko jego SHA-256.
// Na razie bez logowania: właściciel wchodzi prywatnym linkiem od admina (/panel/wejdz/<token>) — sesję zakłada
// przycisk „Wejdź do panelu” na tej stronie.
// Logowanie kodem z e-maila i przez Google jest gotowe, ale wyłączone — włącza je PANEL_LOGOWANIE=1.
// Każda strona i akcja panelu sprawdza uprawnienia sama (wymagajKonta / wymagajLokalu / wymagajAdmina),
// bo ukrycie przycisku w interfejsie niczego nie chroni.

export type Account = { id: number; email: string | null; imie: string | null; rola: "wlasciciel" | "admin" };
export type PanelVenue = { id: number; slug: string; nazwa: string; adres: string | null; miejscowosc: string | null };

const COOKIE = "szamanie_sesja";
const SESSION_DAYS = 90;

export const digest = (text: string) => createHash("sha256").update(text).digest("hex");

export const loginEnabled = () => process.env.PANEL_LOGOWANIE === "1";

/** Adres IP klienta do limitów (za Caddy — z nagłówka X-Forwarded-For). */
export async function ipAddress() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "lokalnie";
}

/** Adres do przekierowania po logowaniu — tylko wewnątrz panelu (bez „//host”, żeby nie wyprowadzić poza serwis). */
export function safeTarget(next: unknown) {
  return typeof next === "string" && /^\/panel(\/|$|\?)/.test(next) && !next.startsWith("//") ? next : "/panel";
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validEmail(email: string) {
  return email.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Konto o tym adresie albo nowe. Adres musi być już potwierdzony (kodem z e-maila albo przez Google). */
export function accountByEmail(email: string, name?: string | null): number {
  const e = normalizeEmail(email);
  const existing = db.prepare("SELECT id, imie FROM konta WHERE email = ?").get(e) as
    | { id: number; imie: string | null }
    | undefined;
  if (existing) {
    if (!existing.imie && name) db.prepare("UPDATE konta SET imie = ? WHERE id = ?").run(name, existing.id);
    return existing.id;
  }
  return Number(db.prepare("INSERT INTO konta (email, imie) VALUES (?, ?)").run(e, name ?? null).lastInsertRowid);
}

/** Konto przypięte do konta Google (po „sub”); pierwszy raz — po potwierdzonym adresie e-mail. */
export function externalAccount(provider: string, identifier: string, email: string, name: string | null) {
  const pinned = db
    .prepare("SELECT konto_id FROM konta_zewnetrzne WHERE dostawca = ? AND identyfikator = ?")
    .get(provider, identifier) as { konto_id: number } | undefined;
  if (pinned) return pinned.konto_id;
  const id = accountByEmail(email, name);
  db.prepare("INSERT INTO konta_zewnetrzne (dostawca, identyfikator, konto_id) VALUES (?, ?, ?)").run(
    provider,
    identifier,
    id,
  );
  return id;
}

/** Nowy link do panelu dla konta; poprzedni przestaje działać. W bazie zostaje tylko skrót tokenu. */
export function newLink(accountId: number) {
  const token = randomBytes(24).toString("base64url");
  db.prepare("UPDATE konta SET link = ? WHERE id = ?").run(digest(token), accountId);
  return `/panel/wejdz/${token}`;
}

export function accountByLink(token: string) {
  const account = db.prepare("SELECT id FROM konta WHERE link = ?").get(digest(token)) as { id: number } | undefined;
  return account?.id ?? null;
}

const digits = (phone: string) => phone.replace(/\D/g, "").slice(-9);

/**
 * Konto osoby z lokalu, której admin daje dostęp: istniejące po e-mailu albo (konto bez e-maila) po telefonie,
 * inaczej nowe. E-mail jest opcjonalny, bo na razie wchodzi się linkiem.
 */
export function personAccount(name: string, phone: string, email: string | null): number {
  const existing =
    (email
      ? (db.prepare("SELECT id FROM konta WHERE email = ?").get(normalizeEmail(email)) as { id: number } | undefined)
      : undefined) ??
    (db.prepare("SELECT id, telefon FROM konta WHERE email IS NULL AND telefon IS NOT NULL").all() as { id: number; telefon: string }[]).find(
      (k) => digits(k.telefon) === digits(phone),
    );
  if (existing) {
    db.prepare("UPDATE konta SET imie = coalesce(imie, ?), telefon = coalesce(telefon, ?) WHERE id = ?").run(
      name,
      phone,
      existing.id,
    );
    return existing.id;
  }
  return Number(
    db
      .prepare("INSERT INTO konta (email, imie, telefon) VALUES (?, ?, ?)")
      .run(email ? normalizeEmail(email) : null, name, phone).lastInsertRowid,
  );
}

/** Zakłada sesję i ustawia ciasteczko. Tylko w akcji serwera albo route handlerze (ciasteczka ustawia odpowiedź). */
export async function loginAccount(accountId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db.prepare("DELETE FROM sesje WHERE wygasa < ?").run(new Date().toISOString());
  db.prepare("INSERT INTO sesje (id, konto_id, wygasa) VALUES (?, ?, ?)").run(digest(token), accountId, expires.toISOString());
  db.prepare("UPDATE konta SET ostatnio = datetime('now') WHERE id = ?").run(accountId);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expires,
  });
}

export async function logoutAccount() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) db.prepare("DELETE FROM sesje WHERE id = ?").run(digest(token));
  jar.delete(COOKIE);
}

/** Zalogowane konto albo null; raz na żądanie. */
export const getAccount = cache(async (): Promise<Account | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const account = db
    .prepare(
      // „teraz” liczy SQLite: new Date() w komponencie serwera Next uznaje za blokowanie prerenderu
      `SELECT k.id, k.email, k.imie, k.rola FROM sesje s JOIN konta k ON k.id = s.konto_id
       WHERE s.id = ? AND s.wygasa > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    )
    .get(digest(token)) as Account | undefined;
  return account ? { ...account } : null;
});

export async function requireAccount(next = "/panel"): Promise<Account> {
  const account = await getAccount();
  if (!account) {
    redirect(loginEnabled() ? `/panel/logowanie?dalej=${encodeURIComponent(safeTarget(next))}` : "/panel");
  }
  return account;
}

export async function requireAdmin(): Promise<Account> {
  const account = await requireAccount("/panel/admin");
  if (account.rola !== "admin") notFound();
  return account;
}

const venueBySlug = (slug: string) =>
  db.prepare("SELECT id, slug, nazwa, adres, miejscowosc FROM lokale WHERE slug = ?").get(slug) as
    | PanelVenue
    | undefined;

/** Lokal, którym zalogowane konto może zarządzać (admin — każdym). Cudzy lokal = 404, bez zdradzania, że istnieje. */
export async function requireVenue(slug: string): Promise<{ konto: Account; lokal: PanelVenue }> {
  const account = await requireAccount(`/panel/${slug}`);
  const venue = venueBySlug(slug);
  if (!venue) notFound();
  if (account.rola !== "admin" && !db.prepare("SELECT 1 FROM lokale_konta WHERE lokal_id = ? AND konto_id = ?").get(venue.id, account.id)) {
    notFound();
  }
  return { konto: account, lokal: { ...venue } };
}

export function venueToClaim(slug: string) {
  const venue = venueBySlug(slug);
  return venue ? { ...venue } : null;
}

/** Lokale do wyboru przy zgłoszeniu „to mój lokal”. */
export function selectableVenues() {
  return (
    db.prepare("SELECT slug, nazwa, adres, miejscowosc FROM lokale WHERE ukryty = 0 ORDER BY nazwa COLLATE NOCASE").all() as {
      slug: string;
      nazwa: string;
      adres: string | null;
      miejscowosc: string | null;
    }[]
  ).map((l) => ({ ...l }));
}

export function accountVenues(accountId: number): PanelVenue[] {
  return (
    db
      .prepare(
        `SELECT l.id, l.slug, l.nazwa, l.adres, l.miejscowosc FROM lokale_konta lk JOIN lokale l ON l.id = lk.lokal_id
         WHERE lk.konto_id = ? ORDER BY l.nazwa`,
      )
      .all(accountId) as PanelVenue[]
  ).map((l) => ({ ...l }));
}

/** Podpis zmian w tabeli poprawki — wiadomo, kto co zmienił. */
export const changeAuthor = (account: Account) => `konto:${account.id}`;
