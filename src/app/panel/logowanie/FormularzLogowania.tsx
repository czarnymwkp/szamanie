"use client";

import { ArrowRight, Mail } from "lucide-react";
import { useActionState, useState } from "react";
import { label, errorMessage, okMessage, field, primaryButton } from "@/components/panel/style";
import { login, type LoginState } from "./akcje";

export default function LoginForm({ dalej }: { dalej: string }) {
  const [stan, akcja, trwa] = useActionState(login, { krok: "email", email: "" } satisfies LoginState);
  // „Inny adres” wraca do pierwszego kroku, dopóki serwer nie odpowie na nowo
  const [wroc, setWroc] = useState<LoginState | null>(null);

  if (stan.krok === "kod" && wroc !== stan) {
    return (
      <form action={akcja} className="space-y-4">
        <input type="hidden" name="email" value={stan.email} />
        <input type="hidden" name="dalej" value={dalej} />
        <p className="flex items-start gap-2.5 text-sm leading-relaxed">
          <Mail className="mt-0.5 size-4 shrink-0 text-akcent-tekst" aria-hidden />
          <span>
            Wysłaliśmy 6-cyfrowy kod na <b className="break-all">{stan.email}</b>. Sprawdź też folder spam.
          </span>
        </p>
        <div>
          <label htmlFor="kod" className={label}>
            Kod z e-maila
          </label>
          <input
            id="kod"
            name="kod"
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            placeholder="000000"
            className={`${field} text-center font-grotesk text-2xl tracking-[0.4em]`}
          />
        </div>
        {stan.blad && (
          <p role="alert" className={errorMessage}>
            {stan.blad}
          </p>
        )}
        {stan.info && !stan.blad && <p className={okMessage}>{stan.info}</p>}
        <button type="submit" name="akcja" value="zaloguj" disabled={trwa} className={`${primaryButton} w-full`}>
          Zaloguj <ArrowRight className="size-4" aria-hidden />
        </button>
        <div className="flex justify-between gap-3 text-sm font-bold">
          {/* formNoValidate: wysłanie ponownie nie wymaga wpisanego kodu */}
          <button type="submit" name="akcja" value="ponownie" formNoValidate disabled={trwa} className="underline underline-offset-2">
            Wyślij kod ponownie
          </button>
          <button type="button" onClick={() => setWroc(stan)} className="text-tekst-2 underline underline-offset-2">
            Inny adres
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={akcja} className="space-y-4">
      <div>
        <label htmlFor="email" className={label}>
          Adres e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={stan.email}
          placeholder="np. kontakt@twojlokal.pl"
          className={field}
        />
      </div>
      {stan.blad && (
        <p role="alert" className={errorMessage}>
          {stan.blad}
        </p>
      )}
      <button type="submit" name="akcja" value="wyslij" disabled={trwa} className={`${primaryButton} w-full`}>
        {trwa ? "Wysyłam…" : "Wyślij kod na e-mail"}
      </button>
    </form>
  );
}
