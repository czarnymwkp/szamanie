import "server-only";
import { randomInt, timingSafeEqual } from "node:crypto";
import { db } from "../db";
import { normalizujEmail, skrot } from "./konta";

// Logowanie e-mailem: 6-cyfrowy kod ważny 10 minut, 5 prób na kod, nowy kod najwcześniej po minucie.
// Do tego limit wysyłek na adres IP — żeby nikt nie zasypał cudzej skrzynki ani naszej poczty.

const WAZNOSC_MIN = 10;
const PROB = 5;
const PRZERWA_S = 60;
const KODOW_NA_GODZINE_Z_IP = 10;
// 6 cyfr i 5 prób na kod: limit kodów na adres ogranicza zgadywanie do ~30 prób na godzinę
const KODOW_NA_GODZINE_NA_ADRES = 6;
const GODZINA_MS = 60 * 60 * 1000;

const wysylkiZIp = new Map<string, number[]>();
const wysylkiNaAdres = new Map<string, number[]>();

const hashKodu = (email: string, kod: string) => skrot(`${email}:${kod}`);

// juzWyslany: kod z ostatniej minuty jest nadal ważny — wystarczy go wpisać
export type WynikWysylki = { kod: string } | { blad: string; juzWyslany?: boolean };

export function nowyKod(emailSurowy: string, ip: string): WynikWysylki {
  const email = normalizujEmail(emailSurowy);
  const teraz = Date.now();
  const ostatnie = (wysylkiZIp.get(ip) ?? []).filter((t) => teraz - t < GODZINA_MS);
  const naAdres = (wysylkiNaAdres.get(email) ?? []).filter((t) => teraz - t < GODZINA_MS);
  if (ostatnie.length >= KODOW_NA_GODZINE_Z_IP || naAdres.length >= KODOW_NA_GODZINE_NA_ADRES) {
    return { blad: "Za dużo prób. Spróbuj ponownie za godzinę." };
  }

  const poprzedni = db.prepare("SELECT wyslano FROM kody_logowania WHERE email = ?").get(email) as
    | { wyslano: string }
    | undefined;
  if (poprzedni && teraz - Date.parse(`${poprzedni.wyslano}Z`) < PRZERWA_S * 1000) {
    return { blad: "Kod wysłaliśmy przed chwilą — wpisz go poniżej. Nowy możesz zamówić za minutę.", juzWyslany: true };
  }

  const kod = String(randomInt(0, 1_000_000)).padStart(6, "0");
  db.prepare(
    `INSERT INTO kody_logowania (email, kod_hash, wygasa, proby, wyslano) VALUES (?, ?, ?, 0, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET kod_hash = excluded.kod_hash, wygasa = excluded.wygasa, proby = 0,
       wyslano = excluded.wyslano`,
  ).run(email, hashKodu(email, kod), new Date(teraz + WAZNOSC_MIN * 60 * 1000).toISOString());
  wysylkiZIp.set(ip, [...ostatnie, teraz]);
  wysylkiNaAdres.set(email, [...naAdres, teraz]);
  return { kod };
}

export type WynikSprawdzenia = "ok" | "zly" | "wygasl" | "za-duzo";

export function sprawdzKod(emailSurowy: string, kodSurowy: string): WynikSprawdzenia {
  const email = normalizujEmail(emailSurowy);
  const kod = kodSurowy.replace(/\D/g, "");
  const wiersz = db.prepare("SELECT kod_hash, wygasa, proby FROM kody_logowania WHERE email = ?").get(email) as
    | { kod_hash: string; wygasa: string; proby: number }
    | undefined;
  if (!wiersz || Date.parse(wiersz.wygasa) < Date.now()) return "wygasl";
  if (wiersz.proby >= PROB) return "za-duzo";

  const zgodny =
    kod.length === 6 && timingSafeEqual(Buffer.from(hashKodu(email, kod)), Buffer.from(wiersz.kod_hash));
  if (!zgodny) {
    db.prepare("UPDATE kody_logowania SET proby = proby + 1 WHERE email = ?").run(email);
    return wiersz.proby + 1 >= PROB ? "za-duzo" : "zly";
  }
  db.prepare("DELETE FROM kody_logowania WHERE email = ?").run(email);
  return "ok";
}
