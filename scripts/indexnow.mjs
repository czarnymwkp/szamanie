// Zgłasza wszystkie adresy z mapy strony przez IndexNow (Bing, Yandex, Seznam, Naver — z indeksu Binga korzystają
// też DuckDuckGo, Ecosia i wyszukiwanie w ChatGPT). Google IndexNow nie czyta — tam mapa strony w Search Console.
// Klucz leży w public/<klucz>.txt, więc wyszukiwarka sprawdza, że zgłasza właściciel domeny.
// Użycie (po wdrożeniu, gdy plik klucza jest już na serwerze): npm run indexnow [-- https://szamanie.pl]
const KEY = "db0634ca7fa898d6bf141ae9ab0f1b83";
const page = (process.argv[2] ?? "https://szamanie.pl").replace(/\/$/, "");
const host = new URL(page).host;

const key = await fetch(`${page}/${KEY}.txt`);
if (!key.ok || (await key.text()).trim() !== KEY) {
  console.error(`Brak pliku klucza na ${page}/${KEY}.txt — najpierw wdrożenie.`);
  process.exit(1);
}

const map = await (await fetch(`${page}/sitemap.xml`)).text();
const addresses = [...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${page}/${KEY}.txt`, urlList: addresses }),
});
// 200 — przyjęte, 202 — przyjęte, klucz jeszcze w sprawdzaniu; 403/422 — zły klucz albo adresy spoza hosta
console.log(`IndexNow: ${addresses.length} adresów → ${res.status} ${res.statusText}`);
if (res.status >= 300) process.exit(1);
