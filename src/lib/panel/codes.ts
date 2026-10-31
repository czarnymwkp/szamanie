import "server-only";
import { randomInt, timingSafeEqual } from "node:crypto";
import { db } from "../db";
import { normalizeEmail, digest } from "./accounts";

// E-mail sign-in: a 6-digit code valid for 10 minutes, 5 attempts per code, a new code at most once a minute. Plus a
// limit of sends per IP address — so nobody floods someone else's mailbox or our mail.

const VALIDITY_MIN = 10;
const ATTEMPTS = 5;
const PAUSE_S = 60;
const CODES_PER_HOUR_PER_IP = 10;
// 6 digits and 5 attempts per code: the per-address code limit caps guessing at ~30 attempts per hour
const CODES_PER_HOUR_PER_ADDRESS = 6;
const HOUR_MS = 60 * 60 * 1000;

const sendsFromIp = new Map<string, number[]>();
const sendsToAddress = new Map<string, number[]>();

const hashCode = (email: string, code: string) => digest(`${email}:${code}`);

// alreadySent: a code from the last minute is still valid — it just needs to be typed in
export type SendResult = { kod: string } | { blad: string; juzWyslany?: boolean };

export function newCode(rawEmail: string, ip: string): SendResult {
  const email = normalizeEmail(rawEmail);
  const now = Date.now();
  const latest = (sendsFromIp.get(ip) ?? []).filter((t) => now - t < HOUR_MS);
  const toAddress = (sendsToAddress.get(email) ?? []).filter((t) => now - t < HOUR_MS);
  if (latest.length >= CODES_PER_HOUR_PER_IP || toAddress.length >= CODES_PER_HOUR_PER_ADDRESS) {
    return { blad: "Za dużo prób. Spróbuj ponownie za godzinę." };
  }

  const previous = db.prepare("SELECT wyslano FROM kody_logowania WHERE email = ?").get(email) as
    | { wyslano: string }
    | undefined;
  if (previous && now - Date.parse(`${previous.wyslano}Z`) < PAUSE_S * 1000) {
    return { blad: "Kod wysłaliśmy przed chwilą — wpisz go poniżej. Nowy możesz zamówić za minutę.", juzWyslany: true };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  db.prepare(
    `INSERT INTO kody_logowania (email, kod_hash, wygasa, proby, wyslano) VALUES (?, ?, ?, 0, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET kod_hash = excluded.kod_hash, wygasa = excluded.wygasa, proby = 0,
       wyslano = excluded.wyslano`,
  ).run(email, hashCode(email, code), new Date(now + VALIDITY_MIN * 60 * 1000).toISOString());
  sendsFromIp.set(ip, [...latest, now]);
  sendsToAddress.set(email, [...toAddress, now]);
  return { kod: code };
}

export type CheckResult = "ok" | "zly" | "wygasl" | "za-duzo";

export function checkCode(rawEmail: string, rawCode: string): CheckResult {
  const email = normalizeEmail(rawEmail);
  const code = rawCode.replace(/\D/g, "");
  const row = db.prepare("SELECT kod_hash, wygasa, proby FROM kody_logowania WHERE email = ?").get(email) as
    | { kod_hash: string; wygasa: string; proby: number }
    | undefined;
  if (!row || Date.parse(row.wygasa) < Date.now()) return "wygasl";
  if (row.proby >= ATTEMPTS) return "za-duzo";

  const compatible =
    code.length === 6 && timingSafeEqual(Buffer.from(hashCode(email, code)), Buffer.from(row.kod_hash));
  if (!compatible) {
    db.prepare("UPDATE kody_logowania SET proby = proby + 1 WHERE email = ?").run(email);
    return row.proby + 1 >= ATTEMPTS ? "za-duzo" : "zly";
  }
  db.prepare("DELETE FROM kody_logowania WHERE email = ?").run(email);
  return "ok";
}
