"use server";

import { updateTag } from "next/cache";
import { parsujGodziny } from "@/lib/godziny";
import { autorZmian, poprawnyEmail, wymagajLokalu } from "@/lib/panel/konta";
import {
  cenyDan,
  DLUGOSCI,
  grosze,
  menuDoEdycji,
  POLA_TAK_NIE,
  POLA_TEKSTOWE,
  sprawdzMenu,
  usunPromocje as usunZBazy,
  zapiszDaneLokalu,
  zapiszMenuLokalu,
  zapiszPromocje as zapiszWBazie,
  type DaneLokalu,
  type SekcjaEdycja,
} from "@/lib/panel/lokal";

// Każda akcja sama sprawdza, czy zalogowane konto zarządza lokalem — dane z przeglądarki nie są zaufane.

export type StanFormularza = { blad?: string; ok?: string };

const NAZWY_POL: Record<string, string> = {
  nazwa: "Nazwa",
  telefon: "Telefon",
  email: "E-mail",
  www: "Strona www",
  facebook: "Facebook",
  instagram: "Instagram",
  opis: "Opis",
  godziny: "Godziny",
};

export async function zapiszDane(slug: string, _: StanFormularza, formData: FormData): Promise<StanFormularza> {
  const { konto, lokal } = await wymagajLokalu(slug);
  const dane = {} as DaneLokalu;
  for (const pole of POLA_TEKSTOWE) {
    const wartosc = String(formData.get(pole) ?? "").trim();
    if (wartosc.length > DLUGOSCI[pole]) return { blad: `${NAZWY_POL[pole]}: za długi tekst (najwyżej ${DLUGOSCI[pole]} znaków).` };
    dane[pole] = wartosc || null;
  }
  for (const pole of POLA_TAK_NIE) dane[pole] = formData.get(pole) === "tak";

  if (!dane.nazwa) return { blad: "Lokal musi mieć nazwę." };
  if (dane.telefon && !/^[\d\s+()/-]{9,}$/.test(dane.telefon)) return { blad: "Telefon: wpisz sam numer, np. 81 825 00 00." };
  if (dane.email && !poprawnyEmail(dane.email.toLowerCase())) return { blad: "E-mail: to nie wygląda na adres e-mail." };
  if (dane.godziny && !parsujGodziny(dane.godziny)) return { blad: "Godziny: nie udało się ich odczytać. Ustaw je od nowa." };

  const zmian = zapiszDaneLokalu(lokal.id, dane, autorZmian(konto));
  if (zmian) updateTag("lokale");
  return { ok: zmian ? "Zapisano. Strona lokalu już pokazuje zmiany." : "Nic się nie zmieniło." };
}

export type StanMenu = { blad?: string; ok?: string; menu?: SekcjaEdycja[] };

export async function zapiszMenu(slug: string, menu: unknown): Promise<StanMenu> {
  const { lokal } = await wymagajLokalu(slug);
  const sprawdzone = sprawdzMenu(menu);
  if ("blad" in sprawdzone) return { blad: sprawdzone.blad };
  zapiszMenuLokalu(lokal.id, sprawdzone.menu);
  // kuchnie i „opcje wegetariańskie” lokalu liczą się z menu, więc odświeżamy też listę lokali
  updateTag("menu");
  updateTag("lokale");
  updateTag("promocje");
  return { ok: "Zapisano. Strona lokalu już pokazuje nowe menu.", menu: menuDoEdycji(lokal.id) };
}

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const GODZINA = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function zapiszPromocje(slug: string, _: StanFormularza, formData: FormData): Promise<StanFormularza> {
  const { lokal } = await wymagajLokalu(slug);
  const tekst = (n: string, max: number) => String(formData.get(n) ?? "").trim().slice(0, max);
  const id = Number(formData.get("id")) || null;
  const tytul = tekst("tytul", 80);
  const opis = tekst("opis", 300) || null;
  const odDnia = tekst("odDnia", 10) || null;
  const doDnia = tekst("doDnia", 10) || null;
  const odGodz = tekst("odGodz", 5) || null;
  const doGodz = tekst("doGodz", 5) || null;
  const dni = [...new Set(formData.getAll("dni").map(Number))].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6).sort();
  const danie = tekst("danie", 120) || null;
  const wariant = tekst("wariant", 40) || null;
  const cena = tekst("cena", 20);

  if (!tytul) return { blad: "Podaj tytuł promocji, np. „Druga pizza za pół ceny”." };
  if ((odDnia && !DATA.test(odDnia)) || (doDnia && !DATA.test(doDnia))) return { blad: "Nieprawidłowa data." };
  if (odDnia && doDnia && odDnia > doDnia) return { blad: "Promocja kończy się przed początkiem — popraw daty." };
  if ((odGodz && !GODZINA.test(odGodz)) || (doGodz && !GODZINA.test(doGodz))) return { blad: "Nieprawidłowa godzina." };
  if (odGodz && doGodz && odGodz >= doGodz) return { blad: "Godzina końca musi być po godzinie początku." };

  let cenaGr: number | null = null;
  if (danie) {
    const d = cenyDan(lokal.id).find((x) => x.nazwa === danie);
    if (!d) return { blad: "Nie ma takiego dania w menu." };
    const regularna = d.ceny.length === 1 && !wariant ? d.ceny[0] : d.ceny.find((c) => c.wariant === wariant);
    if (!regularna) return { blad: "Wybierz wariant dania (np. rozmiar pizzy)." };
    cenaGr = grosze(cena);
    if (cenaGr === null || cenaGr <= 0) return { blad: "Podaj cenę promocyjną, np. 19,90." };
    if (cenaGr >= regularna.gr) return { blad: "Cena promocyjna musi być niższa od ceny z menu." };
  }

  zapiszWBazie(lokal.id, {
    id,
    tytul,
    opis,
    danie,
    wariant: danie ? wariant : null,
    cenaGr,
    odDnia,
    doDnia,
    dni: dni.length === 7 ? [] : dni,
    odGodz,
    doGodz,
    aktywna: formData.get("aktywna") === "tak",
  });
  updateTag("promocje");
  updateTag("lokale");
  return { ok: id ? "Zapisano zmiany promocji." : "Dodano promocję. Już widać ją na stronie lokalu." };
}

export async function usunPromocje(slug: string, id: number) {
  const { lokal } = await wymagajLokalu(slug);
  usunZBazy(lokal.id, id);
  updateTag("promocje");
  updateTag("lokale");
}
