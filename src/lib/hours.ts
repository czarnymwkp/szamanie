// Parser of the OpenStreetMap opening_hours format, e.g. "Mo-Fr 10:00-22:00; Sa 12:00-20:00; Su off". Handles the usual
// forms: day ranges, several ranges per day, hours past midnight, 24/7, rules separated by „;” or „,”. For anything
// unusual it returns null and the app then shows the raw text instead of an „open/closed” status.

/** 7 days (Mon..Sun), each with a list of ranges [start, end] in minutes from midnight. */
export type Week = [number, number][][];

export type Status =
  | { otwarte: true; doMin: number }
  | { otwarte: false; nastepne: { zaDni: number; odMin: number } | null };

const OSM_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
export const POLISH_DAYS = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const DAYS_WHEN = ["w poniedziałek", "we wtorek", "w środę", "w czwartek", "w piątek", "w sobotę", "w niedzielę"];
const TIME_OF_DAY = 24 * 60;

const DAY = "(?:Mo|Tu|We|Th|Fr|Sa|Su)";
const DAY_RANGE = `${DAY}(?:\\s*-\\s*${DAY})?`;
const DAYS = `${DAY_RANGE}(?:\\s*,\\s*${DAY_RANGE})*`;
const RANGE = "\\d{1,2}:\\d{2}\\s*-\\s*\\d{1,2}:\\d{2}";
const RANGES = `${RANGE}(?:\\s*,\\s*${RANGE})*`;
const RULE = new RegExp(`(?:(${DAYS}|PH)\\s+)?(${RANGES}|off|closed)`, "y");
const SEPARATOR = /\s*[;,]\s*/y;

function parseDays(text: string): number[] | null {
  const days: number[] = [];
  for (const part of text.split(",")) {
    const [od, doo = od] = part.split("-").map((s) => s.trim());
    const a = OSM_DAYS.indexOf(od);
    const b = OSM_DAYS.indexOf(doo);
    if (a < 0 || b < 0) return null;
    for (let i = a; ; i = (i + 1) % 7) {
      days.push(i);
      if (i === b) break;
    }
  }
  return days;
}

function parseRanges(text: string): [number, number][] | null {
  if (text === "off" || text === "closed") return [];
  const result: [number, number][] = [];
  for (const part of text.split(",")) {
    const m = part.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const [h1, m1, h2, m2] = m.slice(1).map(Number);
    if (h1 > 24 || h2 > 24 || m1 > 59 || m2 > 59) return null;
    const start = h1 * 60 + m1;
    let end = h2 * 60 + m2;
    if (end <= start) end += TIME_OF_DAY; // np. 18:00-02:00
    result.push([start, end]);
  }
  return result;
}

export function parseHours(text: string | null): Week | null {
  if (!text) return null;
  const t = text.trim();
  if (t === "24/7") return OSM_DAYS.map(() => [[0, TIME_OF_DAY]]);

  const week: Week = OSM_DAYS.map(() => []);
  let pos = 0;
  while (pos < t.length) {
    RULE.lastIndex = pos;
    const m = RULE.exec(t);
    if (!m) return null;
    pos = RULE.lastIndex;

    if (m[1] !== "PH") {
      // public holidays (PH) are skipped; a later rule overrides the days it lists
      const days = m[1] ? parseDays(m[1]) : [0, 1, 2, 3, 4, 5, 6];
      const ranges = parseRanges(m[2]);
      if (!days || !ranges) return null;
      for (const d of days) week[d] = ranges;
    }

    SEPARATOR.lastIndex = pos;
    if (SEPARATOR.exec(t)) pos = SEPARATOR.lastIndex;
    else if (pos < t.length) return null;
  }
  return week;
}

/** The inverse of parseHours: week → „Mo-Fr 11:00-22:00; Sa 12:00-23:00; Su off” (adjacent identical days merged). */
export function saveHours(week: Week): string {
  const description = (ranges: [number, number][]) =>
    ranges.length ? ranges.map(([s, k]) => `${formatHour(s)}-${formatHour(k)}`).join(",") : "off";
  const rules: string[] = [];
  for (let d = 0; d < 7; ) {
    let end = d;
    while (end + 1 < 7 && description(week[end + 1]) === description(week[d])) end++;
    rules.push(`${OSM_DAYS[d]}${end > d ? `-${OSM_DAYS[end]}` : ""} ${description(week[d])}`);
    d = end + 1;
  }
  return rules.length === 1 && rules[0].startsWith("Mo-Su ") ? rules[0].slice(6) : rules.join("; ");
}

/** Weekday number, where 0 = Monday. */
export const weekday = (date: Date) => (date.getDay() + 6) % 7;

export function openingStatus(week: Week, now: Date): Status {
  const today = weekday(now);
  const min = now.getHours() * 60 + now.getMinutes();

  for (const [s, k] of week[today]) if (min >= s && min < k) return { otwarte: true, doMin: k };
  for (const [, k] of week[(today + 6) % 7]) {
    if (k > TIME_OF_DAY && min < k - TIME_OF_DAY) return { otwarte: true, doMin: k - TIME_OF_DAY };
  }
  for (let inDays = 0; inDays < 7; inDays++) {
    const range = week[(today + inDays) % 7].find(([s]) => inDays > 0 || s > min);
    if (range) return { otwarte: false, nastepne: { zaDni: inDays, odMin: range[0] } };
  }
  return { otwarte: false, nastepne: null };
}

export function formatHour(min: number) {
  const m = min > TIME_OF_DAY ? min - TIME_OF_DAY : min;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function statusDescription(status: Status, now: Date) {
  if (status.otwarte) return `Otwarte do ${formatHour(status.doMin)}`;
  if (!status.nastepne) return "Zamknięte";
  const { zaDni, odMin } = status.nastepne;
  const when =
    zaDni === 0 ? "" : zaDni === 1 ? "jutro " : `${DAYS_WHEN[(weekday(now) + zaDni) % 7]} `;
  return `Zamknięte · otworzy ${when}o ${formatHour(odMin)}`;
}

export function dayDescription(ranges: [number, number][]) {
  if (!ranges.length) return "nieczynne";
  return ranges.map(([s, k]) => `${formatHour(s)}–${formatHour(k)}`).join(", ");
}

/** Hours in schema.org format for JSON-LD, e.g. ["Mo 10:00-22:00", ...]. */
export function schemaOrgHours(week: Week) {
  return week.flatMap((ranges, d) =>
    ranges.map(([s, k]) => `${OSM_DAYS[d]} ${formatHour(s)}-${formatHour(k)}`),
  );
}
