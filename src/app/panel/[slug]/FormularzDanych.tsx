"use client";

import { Check } from "lucide-react";
import { startTransition, useActionState } from "react";
import { etykieta, karta, komunikatBledu, komunikatOk, pole, podpowiedz, przyciskGlowny } from "@/components/panel/style";
import type { DaneLokalu } from "@/lib/panel/lokal";
import type { StanFormularza } from "./akcje";
import EdytorGodzin from "./EdytorGodzin";

type Akcja = (stan: StanFormularza, dane: FormData) => Promise<StanFormularza>;

const KONTAKT = [
  { pole: "telefon", nazwa: "Telefon do zamówień", typ: "tel", podpowiedz: "Klienci dzwonią pod ten numer z listą dań." },
  { pole: "email", nazwa: "E-mail", typ: "email" },
  { pole: "www", nazwa: "Strona www", typ: "url", placeholder: "https://…" },
  { pole: "facebook", nazwa: "Facebook", typ: "text", placeholder: "adres strony na Facebooku" },
  { pole: "instagram", nazwa: "Instagram", typ: "text", placeholder: "@nazwa albo adres profilu" },
] as const;

const USLUGI = [
  { pole: "dostawa", nazwa: "Dowóz" },
  { pole: "na_wynos", nazwa: "Na wynos" },
] as const;

const UDOGODNIENIA = [
  { pole: "zwierzeta", nazwa: "Można przyjść z psem" },
  { pole: "wozek", nazwa: "Dostępny dla wózków" },
  { pole: "wege", nazwa: "Dania wegetariańskie" },
  { pole: "wegan", nazwa: "Dania wegańskie" },
] as const;

function Przelacznik({ pole: nazwaPola, nazwa, wlaczony }: { pole: string; nazwa: string; wlaczony: boolean }) {
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

export default function FormularzDanych({ dane, zapisz }: { dane: DaneLokalu; zapisz: Akcja }) {
  const [stan, akcja, trwa] = useActionState(zapisz, {} satisfies StanFormularza);

  // onSubmit zamiast action={…}: React po akcji czyści formularz, a pola mają zostać z wpisanymi wartościami
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const pola = new FormData(e.currentTarget);
        startTransition(() => akcja(pola));
      }}
      className="space-y-5"
    >
      <section className={`${karta} space-y-4`}>
        <h2 className="text-lg font-black">O lokalu</h2>
        <div>
          <label htmlFor="nazwa" className={etykieta}>
            Nazwa
          </label>
          <input id="nazwa" name="nazwa" required maxLength={80} defaultValue={dane.nazwa ?? ""} className={pole} />
        </div>
        <div>
          <label htmlFor="opis" className={etykieta}>
            Opis
          </label>
          <textarea
            id="opis"
            name="opis"
            rows={4}
            maxLength={600}
            defaultValue={dane.opis ?? ""}
            placeholder="Kilka zdań o lokalu: co serwujecie, czym się wyróżniacie."
            className={pole}
          />
        </div>
      </section>

      <section className={`${karta} space-y-4`}>
        <h2 className="text-lg font-black">Kontakt</h2>
        {KONTAKT.map((k) => (
          <div key={k.pole}>
            <label htmlFor={k.pole} className={etykieta}>
              {k.nazwa}
            </label>
            <input
              id={k.pole}
              name={k.pole}
              type={k.typ}
              maxLength={200}
              defaultValue={dane[k.pole] ?? ""}
              placeholder={"placeholder" in k ? k.placeholder : undefined}
              className={pole}
            />
            {"podpowiedz" in k && <p className={podpowiedz}>{k.podpowiedz}</p>}
          </div>
        ))}
      </section>

      <section className={`${karta} space-y-3`}>
        <h2 className="text-lg font-black">Godziny otwarcia</h2>
        <EdytorGodzin godziny={dane.godziny} />
      </section>

      <section className={karta}>
        <h2 className="mb-1 text-lg font-black">Usługi i udogodnienia</h2>
        <div className="divide-y divide-obrys">
          {[...USLUGI, ...UDOGODNIENIA].map((u) => (
            <Przelacznik key={u.pole} pole={u.pole} nazwa={u.nazwa} wlaczony={dane[u.pole]} />
          ))}
        </div>
        <p className={podpowiedz}>Dokąd dowozicie i za ile — w zakładce „Dostawa”.</p>
      </section>

      {/* pasek zapisu przyklejony do dołu ekranu — na telefonie zawsze pod kciukiem */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-obrys bg-tlo/95 px-4 py-3 backdrop-blur">
        {stan.blad && (
          <p role="alert" className={`mb-3 ${komunikatBledu}`}>
            {stan.blad}
          </p>
        )}
        {stan.ok && !trwa && (
          <p role="status" className={`mb-3 flex items-center gap-2 ${komunikatOk}`}>
            <Check className="size-4" aria-hidden /> {stan.ok}
          </p>
        )}
        <button type="submit" disabled={trwa} className={`${przyciskGlowny} w-full sm:w-auto`}>
          {trwa ? "Zapisuję…" : "Zapisz zmiany"}
        </button>
      </div>
    </form>
  );
}
