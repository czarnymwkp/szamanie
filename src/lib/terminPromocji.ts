// Termin promocji słowami („w piątki i soboty, 12:00–15:00, do 30.11”) — wspólne dla panelu i strony lokalu.

export type TerminPromocji = {
  odDnia: string | null; // RRRR-MM-DD
  doDnia: string | null;
  dni: number[]; // 0 = poniedziałek; pusta lista = codziennie
  odGodz: string | null; // GG:MM
  doGodz: string | null;
};

const DNI_MNOGIE = ["poniedziałki", "wtorki", "środy", "czwartki", "piątki", "soboty", "niedziele"];
const DNI_KROTKIE = ["pn", "wt", "śr", "czw", "pt", "sob", "nd"];

const data = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

export function opisTerminu(t: TerminPromocji) {
  const czesci: string[] = [];
  const dni = [...t.dni].sort();
  if (dni.length && dni.length < 7) {
    const robocze = dni.join() === "0,1,2,3,4";
    const weekend = dni.join() === "5,6";
    czesci.push(
      robocze
        ? "w dni robocze"
        : weekend
          ? "w weekendy"
          : dni.length <= 2
            ? `w ${dni.map((d) => DNI_MNOGIE[d]).join(" i ")}`
            : dni.map((d) => DNI_KROTKIE[d]).join(", "),
    );
  } else {
    czesci.push("codziennie");
  }
  if (t.odGodz || t.doGodz) czesci.push(`${t.odGodz ?? "od otwarcia"}–${t.doGodz ?? "do zamknięcia"}`);
  if (t.odDnia && t.doDnia) czesci.push(`${data(t.odDnia)}–${data(t.doDnia)}`);
  else if (t.doDnia) czesci.push(`do ${data(t.doDnia)}`);
  else if (t.odDnia) czesci.push(`od ${data(t.odDnia)}`);
  return czesci.join(", ");
}

/** Czy promocja obowiązuje w tej chwili (data, dzień tygodnia i godzina). */
export function trwaTeraz(t: TerminPromocji, teraz: Date) {
  const dzis = `${teraz.getFullYear()}-${String(teraz.getMonth() + 1).padStart(2, "0")}-${String(teraz.getDate()).padStart(2, "0")}`;
  if (t.odDnia && dzis < t.odDnia) return false;
  if (t.doDnia && dzis > t.doDnia) return false;
  if (t.dni.length && !t.dni.includes((teraz.getDay() + 6) % 7)) return false;
  const godz = `${String(teraz.getHours()).padStart(2, "0")}:${String(teraz.getMinutes()).padStart(2, "0")}`;
  if (t.odGodz && godz < t.odGodz) return false;
  if (t.doGodz && godz >= t.doGodz) return false;
  return true;
}
