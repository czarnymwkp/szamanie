// Submits every sitemap URL through IndexNow (Bing, Yandex, Seznam, Naver — DuckDuckGo, Ecosia and ChatGPT search use Bing's index too). Google does not read IndexNow — for Google the sitemap is in Search Console. The key lives in public/<key>.txt, so the search engine can verify the request comes from the domain owner.
// Usage (after deployment, once the key file is on the server): npm run indexnow [-- https://szamanie.pl]
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
// 200 — accepted, 202 — accepted, key still being verified; 403/422 — wrong key or URLs from another host
console.log(`IndexNow: ${addresses.length} adresów → ${res.status} ${res.statusText}`);
if (res.status >= 300) process.exit(1);
