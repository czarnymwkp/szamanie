"use client";

import { UserPlus } from "lucide-react";
import { useActionState } from "react";
import { label, errorMessage, field, smallButton } from "@/components/panel/style";
import type { PersonState } from "../admin/actions";
import { ShowLink } from "../PanelLink";

type Action = (state: PersonState, date: FormData) => Promise<PersonState>;

/** Admin: dostęp do lokalu dla osoby z lokalu (po rozmowie, bez zgłoszenia) i od razu link do wysłania. */
export default function AddPerson({ dodaj, nazwa }: { dodaj: Action; nazwa: string }) {
  const [stan, akcja, trwa] = useActionState(dodaj, {} satisfies PersonState);

  if (stan.sciezka) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-extrabold">Dostęp gotowy — wyślij link:</p>
        <ShowLink sciezka={stan.sciezka} telefon={stan.telefon ?? null} nazwa={nazwa} />
      </div>
    );
  }
  return (
    <form action={akcja} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="osoba-imie" className={label}>
            Imię
          </label>
          <input id="osoba-imie" name="imie" required maxLength={80} className={field} />
        </div>
        <div>
          <label htmlFor="osoba-telefon" className={label}>
            Telefon
          </label>
          <input id="osoba-telefon" name="telefon" type="tel" required maxLength={40} className={field} />
        </div>
        <div>
          <label htmlFor="osoba-email" className={label}>
            E-mail <span className="font-normal text-tekst-2">(opc.)</span>
          </label>
          <input id="osoba-email" name="email" type="email" maxLength={200} className={field} />
        </div>
      </div>
      {stan.blad && (
        <p role="alert" className={errorMessage}>
          {stan.blad}
        </p>
      )}
      <button type="submit" disabled={trwa} className={`${smallButton} bg-tekst text-white`}>
        <UserPlus className="size-4" aria-hidden /> {trwa ? "Dodaję…" : "Daj dostęp i utwórz link"}
      </button>
    </form>
  );
}
