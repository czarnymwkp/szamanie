// Zgłasza wszystkie adresy z mapy strony przez IndexNow (Bing, Yandex, Seznam, Naver — z indeksu Binga korzystają
// też DuckDuckGo, Ecosia i wyszukiwanie w ChatGPT). Google IndexNow nie czyta — tam mapa strony w Search Console.
// Klucz leży w public/<klucz>.txt, więc wyszukiwarka sprawdza, że zgłasza właściciel domeny.
// Użycie (po wdrożeniu, gdy plik klucza jest już na serwerze): npm run indexnow [-- https://szamanie.pl]
const KLUCZ = "db0634ca7fa898d6bf141ae9ab0f1b83";
const strona = (process.argv[2] ?? "https://szamanie.pl").replace(/\/$/, "");
const host = new URL(strona).host;

const klucz = await fetch(`${strona}/${KLUCZ}.txt`);
if (!klucz.ok || (await klucz.text()).trim() !== KLUCZ) {
  console.error(`Brak pliku klucza na ${strona}/${KLUCZ}.txt — najpierw wdrożenie.`);
  process.exit(1);
}

const mapa = await (await fetch(`${strona}/sitemap.xml`)).text();
const adresy = [...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const odp = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: KLUCZ, keyLocation: `${strona}/${KLUCZ}.txt`, urlList: adresy }),
});
// 200 — przyjęte, 202 — przyjęte, klucz jeszcze w sprawdzaniu; 403/422 — zły klucz albo adresy spoza hosta
console.log(`IndexNow: ${adresy.length} adresów → ${odp.status} ${odp.statusText}`);
if (odp.status >= 300) process.exit(1);
