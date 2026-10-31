import { LogOut } from "lucide-react";
import { getAccount } from "@/lib/panel/accounts";
import { logout } from "./actions";

export default async function HeaderAccount() {
  const account = await getAccount();
  if (!account) return null;
  return (
    <form action={logout} className="ml-auto flex min-w-0 items-center gap-2">
      <span className="hidden min-w-0 truncate text-sm text-tekst-2 sm:block">{account.email ?? account.imie}</span>
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
