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

export type Konto = { id: number; email: string | null; imie: string | null; rola: "wlasciciel" | "admin" };
export type LokalPanelu = { id: number; slug: string; nazwa: string; adres: string | null; miejscowosc: string | null };

const CIASTECZKO = "szamanie_sesja";
const DNI_SESJI = 90;

export const skrot = (tekst: string) => createHash("sha256").update(tekst).digest("hex");

export const logowanieWlaczone = () => process.env.PANEL_LOGOWANIE === "1";

/** Adres IP klienta do limitów (za Caddy — z nagłówka X-Forwarded-For). */
export async function adresIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "lokalnie";
}

/** Adres do przekierowania po logowaniu — tylko wewnątrz panelu (bez „//host”, żeby nie wyprowadzić poza serwis). */
export function bezpiecznyCel(dalej: unknown) {
  return typeof dalej === "string" && /^\/panel(\/|$|\?)/.test(dalej) && !dalej.startsWith("//") ? dalej : "/panel";
}

export function normalizujEmail(email: string) {
  return email.trim().toLowerCase();
}

export function poprawnyEmail(email: string) {
  return email.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Konto o tym adresie albo nowe. Adres musi być już potwierdzony (kodem z e-maila albo przez Google). */
export function kontoPoEmailu(email: string, imie?: string | null): number {
  const e = normalizujEmail(email);
  const istniejace = db.prepare("SELECT id, imie FROM konta WHERE email = ?").get(e) as
    | { id: number; imie: string | null }
    | undefined;
  if (istniejace) {
    if (!istniejace.imie && imie) db.prepare("UPDATE konta SET imie = ? WHERE id = ?").run(imie, istniejace.id);
    return istniejace.id;
  }
  return Number(db.prepare("INSERT INTO konta (email, imie) VALUES (?, ?)").run(e, imie ?? null).lastInsertRowid);
}

/** Konto przypięte do konta Google (po „sub”); pierwszy raz — po potwierdzonym adresie e-mail. */
export function kontoZewnetrzne(dostawca: string, identyfikator: string, email: string, imie: string | null) {
  const przypiete = db
    .prepare("SELECT konto_id FROM konta_zewnetrzne WHERE dostawca = ? AND identyfikator = ?")
    .get(dostawca, identyfikator) as { konto_id: number } | undefined;
  if (przypiete) return przypiete.konto_id;
  const id = kontoPoEmailu(email, imie);
  db.prepare("INSERT INTO konta_zewnetrzne (dostawca, identyfikator, konto_id) VALUES (?, ?, ?)").run(
    dostawca,
    identyfikator,
    id,
  );
  return id;
}

/** Nowy link do panelu dla konta; poprzedni przestaje działać. W bazie zostaje tylko skrót tokenu. */
export function nowyLink(kontoId: number) {
  const token = randomBytes(24).toString("base64url");
  db.prepare("UPDATE konta SET link = ? WHERE id = ?").run(skrot(token), kontoId);
  return `/panel/wejdz/${token}`;
}

export function kontoPoLinku(token: string) {
  const konto = db.prepare("SELECT id FROM konta WHERE link = ?").get(skrot(token)) as { id: number } | undefined;
  return konto?.id ?? null;
}

const cyfry = (telefon: string) => telefon.replace(/\D/g, "").slice(-9);

/**
 * Konto osoby z lokalu, której admin daje dostęp: istniejące po e-mailu albo (konto bez e-maila) po telefonie,
 * inaczej nowe. E-mail jest opcjonalny, bo na razie wchodzi się linkiem.
 */
export function kontoOsoby(imie: string, telefon: string, email: string | null): number {
  const istniejace =
    (email
      ? (db.prepare("SELECT id FROM konta WHERE email = ?").get(normalizujEmail(email)) as { id: number } | undefined)
      : undefined) ??
    (db.prepare("SELECT id, telefon FROM konta WHERE email IS NULL AND telefon IS NOT NULL").all() as { id: number; telefon: string }[]).find(
      (k) => cyfry(k.telefon) === cyfry(telefon),
    );
  if (istniejace) {
    db.prepare("UPDATE konta SET imie = coalesce(imie, ?), telefon = coalesce(telefon, ?) WHERE id = ?").run(
      imie,
      telefon,
      istniejace.id,
    );
    return istniejace.id;
  }
  return Number(
    db
      .prepare("INSERT INTO konta (email, imie, telefon) VALUES (?, ?, ?)")
      .run(email ? normalizujEmail(email) : null, imie, telefon).lastInsertRowid,
  );
}

/** Zakłada sesję i ustawia ciasteczko. Tylko w akcji serwera albo route handlerze (ciasteczka ustawia odpowiedź). */
export async function zalogujKonto(kontoId: number) {
  const token = randomBytes(32).toString("base64url");
  const wygasa = new Date(Date.now() + DNI_SESJI * 24 * 60 * 60 * 1000);
  db.prepare("DELETE FROM sesje WHERE wygasa < ?").run(new Date().toISOString());
  db.prepare("INSERT INTO sesje (id, konto_id, wygasa) VALUES (?, ?, ?)").run(skrot(token), kontoId, wygasa.toISOString());
  db.prepare("UPDATE konta SET ostatnio = datetime('now') WHERE id = ?").run(kontoId);
  (await cookies()).set(CIASTECZKO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: wygasa,
  });
}

export async function wylogujKonto() {
  const sloik = await cookies();
  const token = sloik.get(CIASTECZKO)?.value;
  if (token) db.prepare("DELETE FROM sesje WHERE id = ?").run(skrot(token));
  sloik.delete(CIASTECZKO);
}

/** Zalogowane konto albo null; raz na żądanie. */
export const pobierzKonto = cache(async (): Promise<Konto | null> => {
  const token = (await cookies()).get(CIASTECZKO)?.value;
  if (!token) return null;
  const konto = db
    .prepare(
      // „teraz” liczy SQLite: new Date() w komponencie serwera Next uznaje za blokowanie prerenderu
      `SELECT k.id, k.email, k.imie, k.rola FROM sesje s JOIN konta k ON k.id = s.konto_id
       WHERE s.id = ? AND s.wygasa > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    )
    .get(skrot(token)) as Konto | undefined;
  return konto ? { ...konto } : null;
});

export async function wymagajKonta(dalej = "/panel"): Promise<Konto> {
  const konto = await pobierzKonto();
  if (!konto) {
    redirect(logowanieWlaczone() ? `/panel/logowanie?dalej=${encodeURIComponent(bezpiecznyCel(dalej))}` : "/panel");
  }
  return konto;
}

export async function wymagajAdmina(): Promise<Konto> {
  const konto = await wymagajKonta("/panel/admin");
  if (konto.rola !== "admin") notFound();
  return konto;
}

const lokalPoSlugu = (slug: string) =>
  db.prepare("SELECT id, slug, nazwa, adres, miejscowosc FROM lokale WHERE slug = ?").get(slug) as
    | LokalPanelu
    | undefined;

/** Lokal, którym zalogowane konto może zarządzać (admin — każdym). Cudzy lokal = 404, bez zdradzania, że istnieje. */
export async function wymagajLokalu(slug: string): Promise<{ konto: Konto; lokal: LokalPanelu }> {
  const konto = await wymagajKonta(`/panel/${slug}`);
  const lokal = lokalPoSlugu(slug);
  if (!lokal) notFound();
  if (konto.rola !== "admin" && !db.prepare("SELECT 1 FROM lokale_konta WHERE lokal_id = ? AND konto_id = ?").get(lokal.id, konto.id)) {
    notFound();
  }
  return { konto, lokal: { ...lokal } };
}

export function lokalDoPrzejecia(slug: string) {
  const lokal = lokalPoSlugu(slug);
  return lokal ? { ...lokal } : null;
}

/** Lokale do wyboru przy zgłoszeniu „to mój lokal”. */
export function lokaleDoWyboru() {
  return (
    db.prepare("SELECT slug, nazwa, adres, miejscowosc FROM lokale WHERE ukryty = 0 ORDER BY nazwa COLLATE NOCASE").all() as {
      slug: string;
      nazwa: string;
      adres: string | null;
      miejscowosc: string | null;
    }[]
  ).map((l) => ({ ...l }));
}

export function lokaleKonta(kontoId: number): LokalPanelu[] {
  return (
    db
      .prepare(
        `SELECT l.id, l.slug, l.nazwa, l.adres, l.miejscowosc FROM lokale_konta lk JOIN lokale l ON l.id = lk.lokal_id
         WHERE lk.konto_id = ? ORDER BY l.nazwa`,
      )
      .all(kontoId) as LokalPanelu[]
  ).map((l) => ({ ...l }));
}

/** Podpis zmian w tabeli poprawki — wiadomo, kto co zmienił. */
export const autorZmian = (konto: Konto) => `konto:${konto.id}`;
