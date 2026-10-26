// Parser formatu opening_hours z OpenStreetMap, np. "Mo-Fr 10:00-22:00; Sa 12:00-20:00; Su off".
// Obsługuje typowe zapisy: zakresy dni, kilka przedziałów w dniu, godziny po północy, 24/7,
// reguły rozdzielone „;” albo „,”. Przy czymś nietypowym zwraca null i aplikacja pokazuje
// wtedy surowy tekst zamiast statusu „otwarte/zamknięte”.

/** 7 dni (Pn..Nd), każdy z listą przedziałów [start, koniec] w minutach od północy. */
export type Tydzien = [number, number][][];

export type Status =
  | { otwarte: true; doMin: number }
  | { otwarte: false; nastepne: { zaDni: number; odMin: number } | null };

const DNI_OSM = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
export const DNI_PL = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const DNI_KIEDY = ["w poniedziałek", "we wtorek", "w środę", "w czwartek", "w piątek", "w sobotę", "w niedzielę"];
const DZIEN_DOBY = 24 * 60;

const DZIEN = "(?:Mo|Tu|We|Th|Fr|Sa|Su)";
const ZAKRES_DNI = `${DZIEN}(?:\\s*-\\s*${DZIEN})?`;
const DNI = `${ZAKRES_DNI}(?:\\s*,\\s*${ZAKRES_DNI})*`;
const PRZEDZIAL = "\\d{1,2}:\\d{2}\\s*-\\s*\\d{1,2}:\\d{2}";
const PRZEDZIALY = `${PRZEDZIAL}(?:\\s*,\\s*${PRZEDZIAL})*`;
const REGULA = new RegExp(`(?:(${DNI}|PH)\\s+)?(${PRZEDZIALY}|off|closed)`, "y");
const SEPARATOR = /\s*[;,]\s*/y;

function parsujDni(tekst: string): number[] | null {
  const dni: number[] = [];
  for (const czesc of tekst.split(",")) {
    const [od, doo = od] = czesc.split("-").map((s) => s.trim());
    const a = DNI_OSM.indexOf(od);
    const b = DNI_OSM.indexOf(doo);
    if (a < 0 || b < 0) return null;
    for (let i = a; ; i = (i + 1) % 7) {
      dni.push(i);
      if (i === b) break;
    }
  }
  return dni;
}

function parsujPrzedzialy(tekst: string): [number, number][] | null {
  if (tekst === "off" || tekst === "closed") return [];
  const wynik: [number, number][] = [];
  for (const czesc of tekst.split(",")) {
    const m = czesc.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const [h1, m1, h2, m2] = m.slice(1).map(Number);
    if (h1 > 24 || h2 > 24 || m1 > 59 || m2 > 59) return null;
    const start = h1 * 60 + m1;
    let koniec = h2 * 60 + m2;
    if (koniec <= start) koniec += DZIEN_DOBY; // np. 18:00-02:00
    wynik.push([start, koniec]);
  }
  return wynik;
}

export function parsujGodziny(tekst: string | null): Tydzien | null {
  if (!tekst) return null;
  const t = tekst.trim();
  if (t === "24/7") return DNI_OSM.map(() => [[0, DZIEN_DOBY]]);

  const tydzien: Tydzien = DNI_OSM.map(() => []);
  let poz = 0;
  while (poz < t.length) {
    REGULA.lastIndex = poz;
    const m = REGULA.exec(t);
    if (!m) return null;
    poz = REGULA.lastIndex;

    if (m[1] !== "PH") {
      // święta (PH) pomijamy; późniejsza reguła nadpisuje dni, które wymienia
      const dni = m[1] ? parsujDni(m[1]) : [0, 1, 2, 3, 4, 5, 6];
      const przedzialy = parsujPrzedzialy(m[2]);
      if (!dni || !przedzialy) return null;
      for (const d of dni) tydzien[d] = przedzialy;
    }

    SEPARATOR.lastIndex = poz;
    if (SEPARATOR.exec(t)) poz = SEPARATOR.lastIndex;
    else if (poz < t.length) return null;
  }
  return tydzien;
}

/** Numer dnia tygodnia, gdzie 0 = poniedziałek. */
export const dzienTygodnia = (data: Date) => (data.getDay() + 6) % 7;

export function statusOtwarcia(tydzien: Tydzien, teraz: Date): Status {
  const dzis = dzienTygodnia(teraz);
  const min = teraz.getHours() * 60 + teraz.getMinutes();

  for (const [s, k] of tydzien[dzis]) if (min >= s && min < k) return { otwarte: true, doMin: k };
  for (const [, k] of tydzien[(dzis + 6) % 7]) {
    if (k > DZIEN_DOBY && min < k - DZIEN_DOBY) return { otwarte: true, doMin: k - DZIEN_DOBY };
  }
  for (let zaDni = 0; zaDni < 7; zaDni++) {
    const przedzial = tydzien[(dzis + zaDni) % 7].find(([s]) => zaDni > 0 || s > min);
    if (przedzial) return { otwarte: false, nastepne: { zaDni, odMin: przedzial[0] } };
  }
  return { otwarte: false, nastepne: null };
}

export function formatGodz(min: number) {
  const m = min > DZIEN_DOBY ? min - DZIEN_DOBY : min;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function opisStatusu(status: Status, teraz: Date) {
  if (status.otwarte) return `Otwarte do ${formatGodz(status.doMin)}`;
  if (!status.nastepne) return "Zamknięte";
  const { zaDni, odMin } = status.nastepne;
  const kiedy =
    zaDni === 0 ? "" : zaDni === 1 ? "jutro " : `${DNI_KIEDY[(dzienTygodnia(teraz) + zaDni) % 7]} `;
  return `Zamknięte · otworzy ${kiedy}o ${formatGodz(odMin)}`;
}

export function opisDnia(przedzialy: [number, number][]) {
  if (!przedzialy.length) return "nieczynne";
  return przedzialy.map(([s, k]) => `${formatGodz(s)}–${formatGodz(k)}`).join(", ");
}

/** Godziny w formacie schema.org dla JSON-LD, np. ["Mo 10:00-22:00", ...]. */
export function godzinySchemaOrg(tydzien: Tydzien) {
  return tydzien.flatMap((przedzialy, d) =>
    przedzialy.map(([s, k]) => `${DNI_OSM[d]} ${formatGodz(s)}-${formatGodz(k)}`),
  );
}
