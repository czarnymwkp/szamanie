"use client";

import { useActionState } from "react";
import { etykieta, karta, komunikatBledu, pole, przyciskGlowny } from "@/components/panel/style";
import type { StanZgloszenia } from "../../akcje";

type Akcja = (stan: StanZgloszenia, dane: FormData) => Promise<StanZgloszenia>;

export default function FormularzZgloszenia({ zglos, imie }: { zglos: Akcja; imie: string }) {
  const [stan, akcja, trwa] = useActionState(zglos, {} satisfies StanZgloszenia);

  return (
    <form action={akcja} className={`${karta} space-y-4`}>
      <div>
        <label htmlFor="imie" className={etykieta}>
          Imię i nazwisko
        </label>
        <input id="imie" name="imie" required maxLength={80} autoComplete="name" defaultValue={imie} className={pole} />
      </div>
      <div>
        <label htmlFor="telefon" className={etykieta}>
          Twój telefon
        </label>
        <input id="telefon" name="telefon" type="tel" required maxLength={40} autoComplete="tel" className={pole} />
      </div>
      <fieldset>
        <legend className={etykieta}>Kim jesteś w lokalu?</legend>
        <div className="flex flex-wrap gap-2">
          {["właściciel", "menedżer", "pracownik"].map((r, i) => (
            <label
              key={r}
              className="cursor-pointer rounded-full border-2 border-obrys-2 px-4 py-2 text-sm font-extrabold transition has-checked:border-akcent has-checked:bg-akcent has-checked:text-na-akcencie"
            >
              <input type="radio" name="rola" value={r} defaultChecked={i === 0} className="sr-only" />
              {r[0].toUpperCase() + r.slice(1)}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="wiadomosc" className={etykieta}>
          Wiadomość <span className="font-normal text-tekst-2">(opcjonalnie)</span>
        </label>
        <textarea id="wiadomosc" name="wiadomosc" rows={3} maxLength={600} className={pole} />
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" name="oswiadczenie" value="tak" required className="mt-1 size-5 accent-akcent" />
        Jestem właścicielem tego lokalu albo mam jego zgodę na zarządzanie stroną lokalu na szamanie.pl.
      </label>
      {stan.blad && (
        <p role="alert" className={komunikatBledu}>
          {stan.blad}
        </p>
      )}
      <button type="submit" disabled={trwa} className={`${przyciskGlowny} w-full`}>
        {trwa ? "Wysyłam…" : "Poproś o dostęp"}
      </button>
    </form>
  );
}
