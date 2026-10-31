// Promotion schedule in words („w piątki i soboty, 12:00–15:00, do 30.11”) — shared by the panel and the venue page.

export type PromotionSchedule = {
  odDnia: string | null; // RRRR-MM-DD
  doDnia: string | null;
  dni: number[]; // 0 = Monday; empty list = every day
  odGodz: string | null; // GG:MM
  doGodz: string | null;
};

const DAYS_PLURAL = ["poniedziałki", "wtorki", "środy", "czwartki", "piątki", "soboty", "niedziele"];
const DAYS_SHORT = ["pn", "wt", "śr", "czw", "pt", "sob", "nd"];

const date = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

export function scheduleDescription(t: PromotionSchedule) {
  const parts: string[] = [];
  const days = [...t.dni].sort();
  if (days.length && days.length < 7) {
    const draft = days.join() === "0,1,2,3,4";
    const weekend = days.join() === "5,6";
    parts.push(
      draft
        ? "w dni robocze"
        : weekend
          ? "w weekendy"
          : days.length <= 2
            ? `w ${days.map((d) => DAYS_PLURAL[d]).join(" i ")}`
            : days.map((d) => DAYS_SHORT[d]).join(", "),
    );
  } else {
    parts.push("codziennie");
  }
  if (t.odGodz || t.doGodz) parts.push(`${t.odGodz ?? "od otwarcia"}–${t.doGodz ?? "do zamknięcia"}`);
  if (t.odDnia && t.doDnia) parts.push(`${date(t.odDnia)}–${date(t.doDnia)}`);
  else if (t.doDnia) parts.push(`do ${date(t.doDnia)}`);
  else if (t.odDnia) parts.push(`od ${date(t.odDnia)}`);
  return parts.join(", ");
}

/** Whether the promotion applies right now (date, weekday and hour). */
export function isRunningNow(t: PromotionSchedule, now: Date) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (t.odDnia && today < t.odDnia) return false;
  if (t.doDnia && today > t.doDnia) return false;
  if (t.dni.length && !t.dni.includes((now.getDay() + 6) % 7)) return false;
  const hour = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  if (t.odGodz && hour < t.odGodz) return false;
  if (t.doGodz && hour >= t.doGodz) return false;
  return true;
}
