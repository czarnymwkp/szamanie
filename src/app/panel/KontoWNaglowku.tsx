import { LogOut } from "lucide-react";
import { pobierzKonto } from "@/lib/panel/konta";
import { wyloguj } from "./akcje";

export default async function KontoWNaglowku() {
  const konto = await pobierzKonto();
  if (!konto) return null;
  return (
    <form action={wyloguj} className="ml-auto flex min-w-0 items-center gap-2">
      <span className="hidden min-w-0 truncate text-sm text-tekst-2 sm:block">{konto.email}</span>
      <button
        type="submit"
        aria-label="Wyloguj"
        title="Wyloguj"
        className="flex size-10 shrink-0 items-center justify-center rounded-full transition hover:bg-krem"
      >
        <LogOut className="size-[18px]" aria-hidden />
      </button>
    </form>
  );
}
