"use client";

import { useActionState } from "react";
import { etykieta, karta, komunikatBledu, pole, podpowiedz, przyciskGlowny } from "@/components/panel/style";
import type { StanZgloszenia } from "../../akcje";

type Akcja = (stan: StanZgloszenia, dane: FormData) => Promise<StanZgloszenia>;

export default function FormularzZgloszenia({ zglos, imie, pytajOEmail }: { zglos: Akcja; imie: string; pytajOEmail: boolean }) {
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
        <p className={podpowiedz}>Na ten numer wyślemy SMS-em link do panelu.</p>
      </div>
      {pytajOEmail && (
        <div>
          <label htmlFor="email" className={etykieta}>
            E-mail <span className="font-normal text-tekst-2">(opcjonalnie)</span>
          </label>
          <input id="email" name="email" type="email" maxLength={200} autoComplete="email" className={pole} />
        </div>
      )}
      {/* pułapka na boty: ludzie tego pola nie widzą */}
      <input name="strona" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />
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
