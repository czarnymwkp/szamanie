const POLSKIE = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };

/** „Żurek z JAJKIEM” → „zurek z jajkiem” — do wyszukiwania bez polskich znaków. */
export function bezPolskich(tekst) {
  return tekst
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (z) => POLSKIE[z])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** „Pizzeria Roma Kraśnik” → „pizzeria-roma-krasnik” */
export function slugify(tekst) {
  return bezPolskich(tekst)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
