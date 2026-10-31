"use client";

import { Check } from "lucide-react";
import { startTransition, useActionState } from "react";
import { label, card, errorMessage, okMessage, field, hint, primaryButton } from "@/components/panel/style";
import type { VenueData } from "@/lib/panel/venue";
import type { FormState } from "./actions";
import HoursEditor from "./HoursEditor";

type Action = (state: FormState, date: FormData) => Promise<FormState>;

const CONTACT = [
  { pole: "telefon", nazwa: "Telefon do zamówień", typ: "tel", podpowiedz: "Klienci dzwonią pod ten numer z listą dań." },
  { pole: "email", nazwa: "E-mail", typ: "email" },
  { pole: "www", nazwa: "Strona www", typ: "url", placeholder: "https://…" },
  { pole: "facebook", nazwa: "Facebook", typ: "text", placeholder: "adres strony na Facebooku" },
  { pole: "instagram", nazwa: "Instagram", typ: "text", placeholder: "@nazwa albo adres profilu" },
] as const;

const SERVICES = [
  { pole: "dostawa", nazwa: "Dowóz" },
  { pole: "na_wynos", nazwa: "Na wynos" },
] as const;

const AMENITIES = [
  { pole: "zwierzeta", nazwa: "Można przyjść z psem" },
  { pole: "wozek", nazwa: "Dostępny dla wózków" },
  { pole: "wege", nazwa: "Dania wegetariańskie" },
  { pole: "wegan", nazwa: "Dania wegańskie" },
] as const;

function Switcher({ pole: nazwaPola, nazwa, wlaczony }: { pole: string; nazwa: string; wlaczony: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-1 py-2.5">
      <span className="font-bold">{nazwa}</span>
      <input type="checkbox" name={nazwaPola} value="tak" defaultChecked={wlaczony} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-7 w-12 shrink-0 rounded-full bg-obrys-2 transition peer-checked:bg-otwarte peer-focus-visible:ring-2 peer-focus-visible:ring-akcent after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
      />
    </label>
  );
}

export default function DetailsForm({ dane, zapisz }: { dane: VenueData; zapisz: Action }) {
  const [stan, akcja, trwa] = useActionState(zapisz, {} satisfies FormState);

  // onSubmit instead of action={…}: React clears the form after an action, but the fields must keep the typed values
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fields = new FormData(e.currentTarget);
        startTransition(() => akcja(fields));
      }}
      className="space-y-5"
    >
      <section className={`${card} space-y-4`}>
        <h2 className="text-lg font-black">O lokalu</h2>
        <div>
          <label htmlFor="nazwa" className={label}>
            Nazwa
          </label>
          <input id="nazwa" name="nazwa" required maxLength={80} defaultValue={dane.nazwa ?? ""} className={field} />
        </div>
        <div>
          <label htmlFor="opis" className={label}>
            Opis
          </label>
          <textarea
            id="opis"
            name="opis"
            rows={4}
            maxLength={600}
            defaultValue={dane.opis ?? ""}
            placeholder="Kilka zdań o lokalu: co serwujecie, czym się wyróżniacie."
            className={field}
          />
        </div>
      </section>

      <section className={`${card} space-y-4`}>
        <h2 className="text-lg font-black">Kontakt</h2>
        {CONTACT.map((k) => (
          <div key={k.pole}>
            <label htmlFor={k.pole} className={label}>
              {k.nazwa}
            </label>
            <input
              id={k.pole}
              name={k.pole}
              type={k.typ}
              maxLength={200}
              defaultValue={dane[k.pole] ?? ""}
              placeholder={"placeholder" in k ? k.placeholder : undefined}
              className={field}
            />
            {"podpowiedz" in k && <p className={hint}>{k.podpowiedz}</p>}
          </div>
        ))}
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-black">Godziny otwarcia</h2>
        <HoursEditor godziny={dane.godziny} />
      </section>

      <section className={card}>
        <h2 className="mb-1 text-lg font-black">Usługi i udogodnienia</h2>
        <div className="divide-y divide-obrys">
          {[...SERVICES, ...AMENITIES].map((u) => (
            <Switcher key={u.pole} pole={u.pole} nazwa={u.nazwa} wlaczony={dane[u.pole]} />
          ))}
        </div>
        <p className={hint}>Dokąd dowozicie i za ile — w zakładce „Dostawa”.</p>
      </section>

      {/* save bar stuck to the bottom of the screen — always under the thumb on a phone */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-obrys bg-tlo/95 px-4 py-3 backdrop-blur">
        {stan.blad && (
          <p role="alert" className={`mb-3 ${errorMessage}`}>
            {stan.blad}
          </p>
        )}
        {stan.ok && !trwa && (
          <p role="status" className={`mb-3 flex items-center gap-2 ${okMessage}`}>
            <Check className="size-4" aria-hidden /> {stan.ok}
          </p>
        )}
        <button type="submit" disabled={trwa} className={`${primaryButton} w-full sm:w-auto`}>
          {trwa ? "Zapisuję…" : "Zapisz zmiany"}
        </button>
      </div>
    </form>
  );
}
