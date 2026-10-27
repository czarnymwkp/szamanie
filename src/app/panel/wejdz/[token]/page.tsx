import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogIn, Store } from "lucide-react";
import { karta, przyciskGlowny } from "@/components/panel/style";
import { kontoPoLinku, lokaleKonta, pobierzKonto } from "@/lib/panel/konta";
import { wejdzLinkiem } from "../../akcje";

export const metadata: Metadata = { title: "Wejście do panelu" };

// strona zależy od linku i ciasteczka — czeka na serwer (jak cały panel)
export const instant = false;

// Link z SMS-a otwiera tę stronę, a sesję zakłada dopiero przycisk (POST). Podglądy linków w komunikatorach
// i skanery poczty pobierają stronę, ale nie klikają, więc nie dostają sesji.
export default async function WejscieLinkiem({ params }: PageProps<"/panel/wejdz/[token]">) {
  const { token } = await params;
  const konto = kontoPoLinku(token);
  if (!konto) redirect("/panel?link=nieaktywny");
  const lokale = lokaleKonta(konto);
  if ((await pobierzKonto())?.id === konto) redirect(lokale.length === 1 ? `/panel/${lokale[0].slug}` : "/panel");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight sm:text-4xl">Panel lokalu</h1>
        <p className="mt-2 leading-relaxed text-tekst-2">Zmieniaj menu i ceny, godziny otwarcia i dodawaj promocje.</p>
      </div>
      {lokale.length > 0 && (
        <ul className={`${karta} space-y-2`}>
          {lokale.map((l) => (
            <li key={l.id} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-krem">
                <Store className="size-5 text-akcent-tekst" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-black">{l.nazwa}</span>
                <span className="block truncate text-sm text-tekst-2">
                  {[l.adres, l.miejscowosc].filter(Boolean).join(", ")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form action={wejdzLinkiem.bind(null, token)}>
        <button type="submit" className={`${przyciskGlowny} w-full`}>
          <LogIn className="size-5" aria-hidden /> Wejdź do panelu
        </button>
      </form>
      <p className="text-center text-xs leading-relaxed text-tekst-2">
        Ten link jest tylko dla Ciebie — nie przekazuj go dalej. Zapisz go, żeby wejść też z innego telefonu.
      </p>
    </div>
  );
}
