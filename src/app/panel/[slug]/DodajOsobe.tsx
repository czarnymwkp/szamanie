"use client";

import { UserPlus } from "lucide-react";
import { useActionState } from "react";
import { etykieta, komunikatBledu, pole, przyciskMaly } from "@/components/panel/style";
import type { StanOsoby } from "../admin/akcje";
import { PokazLink } from "../LinkDoPanelu";

type Akcja = (stan: StanOsoby, dane: FormData) => Promise<StanOsoby>;

/** Admin: dostęp do lokalu dla osoby z lokalu (po rozmowie, bez zgłoszenia) i od razu link do wysłania. */
export default function DodajOsobe({ dodaj, nazwa }: { dodaj: Akcja; nazwa: string }) {
  const [stan, akcja, trwa] = useActionState(dodaj, {} satisfies StanOsoby);

  if (stan.sciezka) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-extrabold">Dostęp gotowy — wyślij link:</p>
        <PokazLink sciezka={stan.sciezka} telefon={stan.telefon ?? null} nazwa={nazwa} />
      </div>
    );
  }
  return (
    <form action={akcja} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="osoba-imie" className={etykieta}>
            Imię
          </label>
          <input id="osoba-imie" name="imie" required maxLength={80} className={pole} />
        </div>
        <div>
          <label htmlFor="osoba-telefon" className={etykieta}>
            Telefon
          </label>
          <input id="osoba-telefon" name="telefon" type="tel" required maxLength={40} className={pole} />
        </div>
        <div>
          <label htmlFor="osoba-email" className={etykieta}>
            E-mail <span className="font-normal text-tekst-2">(opc.)</span>
          </label>
          <input id="osoba-email" name="email" type="email" maxLength={200} className={pole} />
        </div>
      </div>
      {stan.blad && (
        <p role="alert" className={komunikatBledu}>
          {stan.blad}
        </p>
      )}
      <button type="submit" disabled={trwa} className={`${przyciskMaly} bg-tekst text-white`}>
        <UserPlus className="size-4" aria-hidden /> {trwa ? "Dodaję…" : "Daj dostęp i utwórz link"}
      </button>
    </form>
  );
}
