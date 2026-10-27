import { redirect } from "next/navigation";
import { connection } from "next/server";
import { kontoPoLinku, lokaleKonta, zalogujKonto } from "@/lib/panel/konta";

// Wejście do panelu prywatnym linkiem od nas (SMS, WhatsApp) — na razie zamiast logowania.
// Link działa wielokrotnie (np. na drugim telefonie), dopóki admin nie wygeneruje nowego albo nie odbierze dostępu.
export async function GET(_: Request, { params }: RouteContext<"/panel/wejdz/[token]">) {
  await connection();
  const { token } = await params;
  const konto = kontoPoLinku(token);
  if (!konto) redirect("/panel?link=nieaktywny");
  await zalogujKonto(konto);
  const lokale = lokaleKonta(konto);
  redirect(lokale.length === 1 ? `/panel/${lokale[0].slug}` : "/panel");
}
