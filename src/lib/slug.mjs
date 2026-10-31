const POLISH_CHARS = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };

/** „Żurek z JAJKIEM” → „zurek z jajkiem” — do wyszukiwania bez polskich znaków. */
export function stripPolish(text) {
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (z) => POLISH_CHARS[z])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** „Pizzeria Roma Kraśnik” → „pizzeria-roma-krasnik” */
export function slugify(text) {
  return stripPolish(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
