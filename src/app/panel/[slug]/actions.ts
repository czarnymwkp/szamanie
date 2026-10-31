"use server";

import { updateTag } from "next/cache";
import { parseHours } from "@/lib/hours";
import { changeAuthor, validEmail, requireVenue } from "@/lib/panel/accounts";
import {
  dishPrices,
  LENGTHS,
  toGrosze,
  menuDraft,
  YES_NO_FIELDS,
  TEXT_FIELDS,
  validateMenu,
  validateZones,
  deletePromotion as usunZBazy,
  saveDelivery as zapiszStrefy,
  saveVenueDetails,
  saveVenueMenu,
  savePromotion as zapiszWBazie,
  type VenueData,
  type SectionDraft,
} from "@/lib/panel/venue";

// Każda akcja sama sprawdza, czy zalogowane konto zarządza lokalem — dane z przeglądarki nie są zaufane.

export type FormState = { blad?: string; ok?: string };

const FIELD_NAMES: Record<string, string> = {
  nazwa: "Nazwa",
  telefon: "Telefon",
  email: "E-mail",
  www: "Strona www",
  facebook: "Facebook",
  instagram: "Instagram",
  opis: "Opis",
  godziny: "Godziny",
};

export async function saveDetails(slug: string, _: FormState, formData: FormData): Promise<FormState> {
  const { konto, lokal } = await requireVenue(slug);
  const date = {} as VenueData;
  for (const field of TEXT_FIELDS) {
    const value = String(formData.get(field) ?? "").trim();
    if (value.length > LENGTHS[field]) return { blad: `${FIELD_NAMES[field]}: za długi tekst (najwyżej ${LENGTHS[field]} znaków).` };
    date[field] = value || null;
  }
  for (const field of YES_NO_FIELDS) date[field] = formData.get(field) === "tak";

  if (!date.nazwa) return { blad: "Lokal musi mieć nazwę." };
  if (date.telefon && !/^[\d\s+()/-]{9,}$/.test(date.telefon)) return { blad: "Telefon: wpisz sam numer, np. 81 825 00 00." };
  if (date.email && !validEmail(date.email.toLowerCase())) return { blad: "E-mail: to nie wygląda na adres e-mail." };
  if (date.godziny && !parseHours(date.godziny)) return { blad: "Godziny: nie udało się ich odczytać. Ustaw je od nowa." };

  const changes = saveVenueDetails(lokal.id, date, changeAuthor(konto));
  if (changes) updateTag("lokale");
  return { ok: changes ? "Zapisano. Strona lokalu już pokazuje zmiany." : "Nic się nie zmieniło." };
}

export type MenuState = { blad?: string; ok?: string; menu?: SectionDraft[] };

export async function saveMenu(slug: string, menu: unknown): Promise<MenuState> {
  const { lokal } = await requireVenue(slug);
  const checked = validateMenu(menu);
  if ("blad" in checked) return { blad: checked.blad };
  saveVenueMenu(lokal.id, checked.menu);
  // kuchnie i „opcje wegetariańskie” lokalu liczą się z menu, więc odświeżamy też listę lokali
  updateTag("menu");
  updateTag("lokale");
  updateTag("promocje");
  return { ok: "Zapisano. Strona lokalu już pokazuje nowe menu.", menu: menuDraft(lokal.id) };
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HOUR = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function savePromotionAction(slug: string, _: FormState, formData: FormData): Promise<FormState> {
  const { lokal } = await requireVenue(slug);
  const text = (n: string, max: number) => String(formData.get(n) ?? "").trim().slice(0, max);
  const id = Number(formData.get("id")) || null;
  const title = text("tytul", 80);
  const description = text("opis", 300) || null;
  const fromDay = text("odDnia", 10) || null;
  const untilDay = text("doDnia", 10) || null;
  const fromHour = text("odGodz", 5) || null;
  const untilHour = text("doGodz", 5) || null;
  const days = [...new Set(formData.getAll("dni").map(Number))].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6).sort();
  const dish = text("danie", 120) || null;
  const variant = text("wariant", 40) || null;
  const price = text("cena", 20);

  if (!title) return { blad: "Podaj tytuł promocji, np. „Druga pizza za pół ceny”." };
  if ((fromDay && !DATE.test(fromDay)) || (untilDay && !DATE.test(untilDay))) return { blad: "Nieprawidłowa data." };
  if (fromDay && untilDay && fromDay > untilDay) return { blad: "Promocja kończy się przed początkiem — popraw daty." };
  if ((fromHour && !HOUR.test(fromHour)) || (untilHour && !HOUR.test(untilHour))) return { blad: "Nieprawidłowa godzina." };
  if (fromHour && untilHour && fromHour >= untilHour) return { blad: "Godzina końca musi być po godzinie początku." };

  let priceGr: number | null = null;
  if (dish) {
    const d = dishPrices(lokal.id).find((x) => x.nazwa === dish);
    if (!d) return { blad: "Nie ma takiego dania w menu." };
    const regular = d.ceny.length === 1 && !variant ? d.ceny[0] : d.ceny.find((c) => c.wariant === variant);
    if (!regular) return { blad: "Wybierz wariant dania (np. rozmiar pizzy)." };
    priceGr = toGrosze(price);
    if (priceGr === null || priceGr <= 0) return { blad: "Podaj cenę promocyjną, np. 19,90." };
    if (priceGr >= regular.gr) return { blad: "Cena promocyjna musi być niższa od ceny z menu." };
  }

  zapiszWBazie(lokal.id, {
    id,
    tytul: title,
    opis: description,
    danie: dish,
    wariant: dish ? variant : null,
    cenaGr: priceGr,
    odDnia: fromDay,
    doDnia: untilDay,
    dni: days.length === 7 ? [] : days,
    odGodz: fromHour,
    doGodz: untilHour,
    aktywna: formData.get("aktywna") === "tak",
  });
  updateTag("promocje");
  updateTag("lokale");
  return { ok: id ? "Zapisano zmiany promocji." : "Dodano promocję. Już widać ją na stronie lokalu." };
}

export async function deletePromotionAction(slug: string, id: number) {
  const { lokal } = await requireVenue(slug);
  usunZBazy(lokal.id, id);
  updateTag("promocje");
  updateTag("lokale");
}

export async function saveDeliveryAction(slug: string, zones: unknown, notes: string): Promise<FormState> {
  const { lokal } = await requireVenue(slug);
  const checked = validateZones(zones);
  if ("blad" in checked) return { blad: checked.blad };
  zapiszStrefy(lokal.id, checked.strefy, String(notes ?? "").trim().slice(0, 300) || null);
  // strefy pokazuje strona lokalu (tag „menu”), a lokal ze strefami dowozi (lista lokali)
  updateTag("menu");
  updateTag("lokale");
  return { ok: "Zapisano strefy dostawy." };
}
