import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "../db";

// Venue owner accounts and sessions. A session = a random token in an httpOnly cookie; the database keeps only its
// SHA-256. No sign-in for now: the owner enters with a private link from the admin (/panel/wejdz/<token>) — the „Wejdź
// do panelu” button on that page starts the session. Sign-in with an e-mailed code and with Google is ready but
// switched off — PANEL_LOGOWANIE=1 turns it on. Every panel page and action checks permissions by itself
// (requireAccount / requireVenue / requireAdmin), because hiding a button in the UI protects nothing.

export type Account = { id: number; email: string | null; imie: string | null; rola: "wlasciciel" | "admin" };
export type PanelVenue = { id: number; slug: string; nazwa: string; adres: string | null; miejscowosc: string | null };

const COOKIE = "szamanie_sesja";
const SESSION_DAYS = 90;

export const digest = (text: string) => createHash("sha256").update(text).digest("hex");

export const loginEnabled = () => process.env.PANEL_LOGOWANIE === "1";

/** Client IP address for rate limits (behind Caddy — from the X-Forwarded-For header). */
export async function ipAddress() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "lokalnie";
}

/** Redirect target after sign-in — only inside the panel (no „//host”, so it cannot lead off the site). */
export function safeTarget(next: unknown) {
  return typeof next === "string" && /^\/panel(\/|$|\?)/.test(next) && !next.startsWith("//") ? next : "/panel";
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validEmail(email: string) {
  return email.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * The account with this address, or a new one. The address must already be verified (with an e-mailed code or by
 * Google).
 */
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

/** Account linked to a Google account (by „sub”); the first time — by the verified e-mail address. */
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

/** A new panel link for the account; the previous one stops working. The database keeps only a hash of the token. */
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
 * Account of a person from the venue the admin grants access to: an existing one by e-mail or (an account without
 * e-mail) by phone, otherwise a new one. E-mail is optional, because for now people enter with a link.
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

/** Starts a session and sets the cookie. Only in a server action or a route handler (the response sets cookies). */
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

/** The signed-in account or null; once per request. */
export const getAccount = cache(async (): Promise<Account | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const account = db
    .prepare(
      // „now” is computed by SQLite: Next treats new Date() in a server component as blocking prerender
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

/**
 * A venue the signed-in account may manage (the admin — any). Someone else's venue = 404, without revealing that it
 * exists.
 */
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

/** Venues to choose from in a „to mój lokal” claim. */
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

/** Author of changes in the poprawki table — so we know who changed what. */
export const changeAuthor = (account: Account) => `konto:${account.id}`;
