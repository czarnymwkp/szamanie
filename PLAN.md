# szamanie.pl — plan i uwagi

Katalog lokali gastronomicznych w Kraśniku i okolicy. Na tym pliku zapisujemy wszystkie ustalenia,
uwagi i plany. Nowe uwagi dopisujemy na dole, w dzienniku.

## Zasady (ustalone)

- **Wygląd aplikacji/strony jest bardzo ważny — ma przyciągać ludzi.** Zdjęcia jedzenia, animacje,
  dopracowane pierwsze wrażenie na telefonie. Po każdej większej funkcji osobna runda dopracowania wyglądu.

- **Technologia:** Next.js 16 (React) + SQLite (wbudowany `node:sqlite`), plik bazy w `data/`.
  Bez Firebase i usług zewnętrznych.
- **Najpierw lokalnie** (podgląd na komputerze i telefonie), potem **na serwer jednym poleceniem** (Docker).
- **Domena:** szamanie.pl (stara wersja na Firebase zostaje zastąpiona; budujemy od zera, bez starego kodu).
- **Wygląd:** propozycja nr 1 „Pomarańczowy klasyk” (w stylu pyszne.pl) z animacjami, wersja na komputer i telefon.
  Kolory z logo: pomarańcz `#ff6400`, krem `#f5ebe1`, czarny.
- **Zdjęcia:** dopóki lokal nie wgra własnych — zdjęcia poglądowe jedzenia wg kategorii, oznaczone jako poglądowe.
  Później można je wygenerować w Magnific (user ogarnie konto).
- **Dane o lokalach:** pobieramy jak najwięcej, ale zgodnie z prawem:
  fakty (telefon, godziny, www, e-mail, social media) — tak; logo i zdjęcia z cudzych stron — tylko jako
  „czekające na zgodę”, publikacja po akceptacji właściciela; Google Maps i Facebooka nie scrapujemy.
- **Obszar: priorytet = powiat kraśnicki** (tu najdokładniejsze dane: menu, dostawy, zdjęcia).
  Później większy: sąsiednie powiaty (janowski, opolski, lubelski, stalowowolski), potem ew. całe Lubelskie.
  Import obsługuje listę powiatów (`POWIATY` w `scripts/import-osm.mjs`).
- **Lokalizacja zamiast gmin:** przycisk „Blisko mnie” + promień (np. 2 km, więcej/mniej), zapasowo wybór miejscowości.
- **Tryb klienta:** czy chce zjeść na miejscu, czy zamówić (dostawa / na wynos).

## Najważniejsze dla klienta (problem, którego nikt nie rozwiązał)

User: *„zawsze mam kłopot, jaki lokal dowozi do mnie i za ile — nigdzie tego nie mogę znaleźć; tak samo
z menu, nie wszystkie mają podane aktualne”*.

- **Strefy dostawy lokalu:** lista miejscowości z ceną (np. Kraśnik 0 zł, Stróża 6 zł), minimalne zamówienie,
  orientacyjny czas; opcjonalnie strefa w km.
- **Tryb „Zamówię” + lokalizacja klienta:** pokazujemy tylko lokale, które dowożą do niego, z ceną dostawy.
- **Aktualne menu z cenami** + data aktualności („ceny sprawdzone 3 dni temu”).
- **„Zgłoś nieaktualne”** — klienci zgłaszają zmiany.
- Dane na start zbieramy ręcznie (telefon, ulotki, profile lokali), potem uzupełniają lokale w panelu.
- **Otwarta decyzja:** strefy dostawy uzupełniane przez lokal za darmo (podstawa katalogu) czy w abonamencie?

## Jak zarabiamy

1. **Wyróżnienie TOP** — lokal wyżej na liście, z etykietą „Promowane” (oznaczenie wymagane prawem).
2. **Abonament → panel restauratora:**
   - menu z cenami (dodawanie dań, zmiana cen, danie dnia),
   - zdjęcia i galeria,
   - dane lokalu (godziny, telefon, opis),
   - **własna podstrona lokalu z ~10 wyglądami do wyboru** (wizytówka),
   - **zamówienia do hurtowni** (na start mailem/PDF, później API tam, gdzie hurtownia udostępnia),
   - statystyki (wyświetlenia, kliknięcia w telefon i nawigację).
3. Potencjalnie: hurtownie płacące za dostęp do restauracji z okolicy.

## Etapy

- [ ] **1. Katalog** — strona główna, strony lokali, komputer + telefon *(w trakcie)*
  - [x] baza SQLite + import z OpenStreetMap (powiat kraśnicki)
  - [x] strona główna (propozycja 1) z animacjami, strona lokalu, „Dla lokali”, mapa strony dla Google
  - [x] zdjęcia poglądowe jedzenia zamiast ikon (13 kategorii, CC0 + 1× CC BY-SA, strona /autorzy-zdjec)
  - [x] więcej danych: e-mail, Instagram, menu, udogodnienia (OSM) + dane ze stron lokali (`npm run dane:strony`);
        7 logo i 4 zdjęcia ze stron czekają na zgodę właścicieli (`data/kandydaci/`, niepublikowane)
  - [x] „Blisko mnie” + promień (1/2/5/10 km) + wybór miejscowości zamiast gmin; tryb „na miejscu / zamówię”
  - [x] przycisk „Prowadź” na karcie i stronie lokalu (Android → wybór aplikacji nawigacyjnej)
  - [ ] lokalny HTTPS, żeby „Blisko mnie” działało przy testach na telefonie
  - [x] **10 propozycji wyglądu** (strona główna + strona lokalu) pod `/propozycje` — **wybrane 2026-10-25:
        główna = połączenie 1 z 3, lokal = 1** (pozostałe strony lokali = przyszłe szablony w abonamencie)
  - [ ] ręczne poprawki danych: `npm run popraw` (Parkowa: pizza + burgery); kategorie też z nazwy lokalu
  - [x] menu w bazie (tabele `menu`, `menu_sekcje`): pliki `dane/lokale/<slug>.txt` → `npm run menu`
        (format opisany w `scripts/menu.mjs`); na start Si! (124 poz.), U Górala (109), Brunoo (37)
  - [x] **menu na stronie lokalu + lista do zamówienia** (`src/components/menu/`): zakładki sekcji, szukaj w menu,
        „+” / warianty (32 cm / 45 cm), pasek „Twoja lista”, uwagi, dostawa z ceną i minimum, suma,
        „Zadzwoń i zamów” → ściągawka dużymi literami (ekran nie gaśnie), „Wyślij” (udostępnij listę)
  - [ ] zdjęcia dań (teraz tylko okładki sekcji ze zdjęć kategorii) — CC0 albo Magnific, potem własne lokali
  - [ ] wyszukiwanie dań na stronie głównej („burger → gdzie i jakie, z ceną”) — funkcja `szukajDan()` gotowa
  - [x] strefy dostawy w bazie (`strefy_dostawy`; na start Si! — 26 stref) + karta „Dostawa” na stronie lokalu
  - [ ] „dowozi do Ciebie za X zł” na liście lokali; podział Kraśnika na części (Fabryczny / Stary)
  - [ ] ręczne zbieranie stref dostawy i menu dla pozostałych lokali z Kraśnika (zdjęcia kart → dane/lokale/)
- [ ] **2. Konta i panel restauratora** — logowanie, weryfikacja właściciela (na start ręcznie przez admina),
      menu z cenami, zdjęcia (zatwierdzanie pobranych), dane lokalu; panel admina
- [ ] **3. Abonament i płatności** — karta, BLIK
- [ ] **4. Zamówienia do hurtowni** — *na spokojnie*; czekamy na info, z jakich hurtowni korzysta Kwadrat
- [ ] **5. Statystyki, wdrożenie na serwer (Docker, HTTPS), Google Play**

## Kontakty i lokale testowe

- **Kwadrat - Miejsce Spotkań**, Dworska 6, Stróża-Kolonia — restauracja kolegi; pierwszy lokal testowy panelu.
  Kolega ma podać, z jakich hurtowni korzysta (sprawdzimy, czy mają API / cenniki B2B).

## Dziennik uwag

**2026-10-24**
- Start projektu od zera; stara wersja szamanie.pl była na Firebase (marka LocalGastro).
- Wybrany wygląd nr 1 + animacje; widok komputer i telefon.
- Zarabianie: lokal płaci za wyżej na liście i dodatki (galeria itd.) — „taki był pierwotny zamysł”.
- Panel restauratora po wykupieniu abonamentu: ceny, menu, zdjęcia, zamówienia do hurtowni.
- Abonament w przyszłości: ~10 layoutów podstrony lokalu do wyboru.
- Hurtownie — na spokojnie (kolega z Kwadratu napisze, jakie hurtownie).
- Ikony na kartach nie przekonują → zdjęcia jedzenia (poglądowe). Magnific — kiedyś.
- Pobrać z lokali jak najwięcej danych: zdjęcia, logo, telefony itp. (o ile udostępniają).
- Podział na gminy bez sensu → lokalizacja „blisko mnie” w promieniu ~2 km (więcej/mniej).
- Rozróżnić: klient chce zjeść na miejscu czy zamówić.
- Zapisywać wszystkie uwagi i plany (ten plik).
- Główny problem klienta: nie wiadomo, kto dowozi pod mój adres i za ile, a menu bywa nieaktualne
  → strefy dostawy z cenami + aktualne menu z datą to rdzeń serwisu (sekcja „Najważniejsze dla klienta”).
- Aplikacja na Androida: jedziesz autem, klikasz lokal → ikonka „Prowadź” → od razu przełącza do aplikacji
  z GPS. Rozwiązanie: na Androidzie link `geo:` (wybór Google Maps / Waze / Yanosik), gdzie indziej Mapy Google;
  przycisk „Prowadź” także na karcie na liście.
- „Bardzo ważny będzie wygląd layoutu aplikacji/strony — ma przyciągać ludzi.”
- Obszar: „powiat Kraśnik to priorytet” — na razie tylko on; większy obszar później.
- Pizzeria Parkowa ma też burgery (poprawione ręcznie: `npm run popraw`); kategorie odgadujemy też z nazwy.
- Menu z Facebooka — automatem NIE (regulamin Meta, ryzyko blokady konta usera). Zamiast tego: menu ze stron
  lokali + folder ze zrzutami/zdjęciami menu, które wprowadzam do bazy; później lokale same w panelu.
- **Wyszukiwanie dań:** „wpisuję burger — chcę widzieć, gdzie je oferują i jakie” → wyniki pokazują konkretne
  pozycje z menu z cenami i lokalem.
- **„Najważniejsze: zaproponuj 10 wyglądów strony głównej i strony restauracji!”** → /propozycje/1…10;
  10 wyglądów strony restauracji = zarazem 10 szablonów do wyboru w abonamencie.
- Później: strona danej restauracji (tam, gdzie będzie menu) dopasowana do jej kolorów itd.
  → kolor marki lokalu (np. z jego logo) jako akcent szablonu.
- Na karcie: mniejsza ikonka nawigacji, obok telefon — szybko zadzwonić i zamówić albo podjechać
  (komponent `SzybkieAkcje`; bez numeru telefon wyszarzony).

**2026-10-25**
- **Cel SEO:** „bardzo wysokie wyświetlenia w regionie na frazy burger, pizza itd.” — szamanie.pl ma wychodzić
  w Google na „pizza Kraśnik”, „burger Kraśnik”, „kebab Kraśnik”, „gdzie zjeść Kraśnik”, „[nazwa lokalu] menu” itp.
  Plan: osobne strony fraz (kategoria × miejscowość), treść (menu z cenami, opisy), dane strukturalne,
  Search Console, linki od lokali i lokalnych portali. Blokada: na szamanie.pl wciąż stoi stara wersja (Firebase).
- **Prawo — czy pytać lokale o zgodę?** Nie trzeba (katalog firm = prawnie uzasadniony interes, art. 6 ust. 1 lit. f RODO),
  ale: polityka prywatności z informacją skąd dane i jak je usunąć; szybkie poprawki/usunięcie na prośbę lokalu;
  logo/zdjęcia tylko za zgodą (już tak robimy); nie kopiować menu z pyszne.pl/Glovo (prawo do bazy danych).
  **Sprzedaż pakietów: osobiście albo gdy lokal sam się zgłosi** — maile i telefony z ofertą bez wcześniejszej zgody
  są zakazane także wobec firm (art. 398 Prawa komunikacji elektronicznej). Przed płatnymi pakietami: regulamin (P2B).
- **Wybór wyglądu: strona główna = „połączenie 1 z 3”, strona lokalu = 1.** Zrobione jako: ciemna góra strony
  z propozycji 3 („Co dziś szamiesz?”, pomarańczowa poświata, krój Space Grotesk w nagłówkach) + ciemny pas
  „Otwarte do późna”; reszta (okrągłe kategorie, karty, filtry, jasne tło) z propozycji 1. „Wiadomo, będziemy
  wszystko i tak modyfikować” — to punkt wyjścia.
- **„Docelowo 90% ludzi będzie korzystać z wersji mobile”** → projektujemy najpierw pod telefon, komputer drugi.
- **Menu na stronie lokalu + lista do zamówienia („koszyk”) — rdzeń dla klienta.** User: *„wchodzimy w kartę lokalu
  i widzimy od razu menu z ładnymi zdjęciami, nowoczesne; dodajemy dania jakby do koszyka, a przy składaniu
  zamówienia patrzymy na telefon i widzimy, co chcemy zamówić — tego mi zawsze brakuje, spisuję na kartce,
  potem dzwonię i zamawiam z kartki”*. Czyli: menu od razu na górze strony lokalu, zdjęcia dań (poglądowe,
  oznaczone, dopóki lokal nie wgra swoich), przycisk „+” przy daniu, lista z ilościami i sumą (+ dostawa
  do mojej miejscowości), duży widok „ściągawki” do czytania przy dzwonieniu + przycisk „Zadzwoń”.
  Bez zamówień online i prowizji — lista zostaje w telefonie (localStorage), działa bez konta.
- Źródła menu z cenami znalezione na stronach lokali: Si! (PDF, ~120 pozycji), U Górala (~130), Brunoo (45);
  MusiCaffe — menu bez cen. **Si! publikuje strefy dostawy z cenami** (np. Kraśnik Fabryczny 3 zł bez minimum,
  Stróża 15 zł od 100 zł) — wzór danych dla „kto dowozi do mnie i za ile”. Kraśnik trzeba podzielić na części
  (Kraśnik Fabryczny / Stary Kraśnik), bo ceny dostawy się różnią.
- **SEO krok 1 zrobiony (lokalnie):** strony fraz `/krasnik` („Gdzie zjeść w Kraśniku?”) i `/krasnik/pizza`, `/burgery`,
  `/kebab`, `/restauracje`, `/fast-food`, `/kawiarnie`, `/lody`, `/puby-i-bary` + `/annopol`, `/goscieradow` (14 stron).
  Strona powstaje sama, gdy obszar ma ≥3 lokale, a kategoria ≥2 (`src/lib/seo.ts`). Każda: tytuł pod frazę,
  lista lokali, pytania i odpowiedzi (kto dowozi, co otwarte w niedzielę), dane dla Google, mapa strony, linki w stopce.
  `next build` przechodzi.
- SEO dalej: Search Console po wdrożeniu; strona „Jedzenie z dowozem w Kraśniku”, gdy będą strefy dostawy;
  dania z menu z cenami na stronach kategorii (gdy gotowe `lib/menu.ts`); **Urzędów (miasto!) ma 0 lokali w danych** —
  luka w OpenStreetMap, trzeba dopisać ręcznie. Pomysł na abonament: podstrona lokalu jako „strona www”
  w jego wizytówce Google → ruch z mapki trafia do szamanie.pl.
- **SEO krok 2 — menu na stronach fraz (lokalnie):** `/krasnik/pizza` i `/krasnik/burgery` mają sekcję
  „Ile kosztuje pizza/burger w Kraśniku?” (ceny z menu, od–do, najtańsze danie, po 6 dań na lokal + link do menu).
  Lokale z pizzą/burgerami w menu wchodzą do kategorii, nawet gdy OSM o tym nie wie (U Górala, Si! → pizza: 8 lokali).
  Strona lokalu: tytuł „<lokal> Kraśnik — menu i ceny”, menu w danych dla Google (Menu/MenuItem z cenami w PLN),
  okruszki, sekcja „Zobacz też” z linkami do stron fraz. `next build` przechodzi.
- **„Ładnie zrobić kartę lokalu z menu — to jest bardzo istotne. Później każda karta lokalu będzie miała swój styl
  dopasowany do karty lokalu.”** → strona lokalu z menu dostaje osobną rundę dopracowania wyglądu (najpierw telefon);
  kolory i kroje strony lokalu idą przez zmienne CSS (motyw lokalu), żeby później każdy lokal mógł mieć wygląd
  dopasowany do swojej karty menu / marki bez przepisywania komponentów.
- Zdjęcia dań: **„na razie darmowe”** (CC0 / domena publiczna z Openverse, oznaczone jako poglądowe); Magnific później.
- **SEO krok 3 — strona „Jedzenie z dowozem w Kraśniku” (`/krasnik/dowoz`, lokalnie):** kto dowozi (karty lokali),
  „Ile kosztuje dowóz w Kraśniku?” — cennik stref każdego lokalu (Si!: 26 stref od 3 do 15 zł z minimum, U Górala:
  „zapytaj”), pytania: kto dowozi, ile kosztuje dowóz w mieście, pizza/burgery/restauracje z dowozem, na wynos,
  jak zamówić przez listę. Strona powstaje sama, gdy obszar ma ≥2 lokale z dowozem. Linki: stopka, mapa strony,
  pytania o dowóz na `/krasnik` i stronach kategorii. `next build` przechodzi, sprawdzone na telefonie.
- **Lokale spoza OpenStreetMap:** `dane/lokale-spoza-osm.txt` → `npm run dodaj` (osm_id = NULL, import z OSM ich nie rusza).
  Dane tylko ze stron lokali, nie z Google Maps. Pierwszy: **Mały Bar PIZZA, Urzędów, Rynek 9** (pizza, kebab, burgery,
  dowóz) — w OSM jest tam punkt bez nazwy, dlatego import go pominął. Strona `/urzedow` pojawi się przy 3 lokalach.
  Menu Małego Baru (PDF ze strony lokalu) **wstrzymane** — ceny wyglądają na stare (Margherita 15 zł); do decyzji.
  Pytanie do usera: jakie lokale w Urzędowie zna (w sieci znalazł się tylko Mały Bar).
- Podgląd strony (25.10): „oo, ładnie wygląda :)”.
- **Animacja: szaman jedzący burgera, zapraszający do wyszukiwania** („jakąś animację? może szamana jedzącego
  burgera?”) → maskotka przy wyszukiwarce na stronie głównej (SVG + CSS, bez zewnętrznych usług).
- **Wdrożenie (25.10):** „czekam na dane serwera i dam ci je, a ty przeniesiesz aplikację, bazę danych i co tam
  jeszcze będzie trzeba, żeby to latało”. Gotowe: `Dockerfile` (Next standalone + skrypty danych), `deploy/`
  (`docker-compose.yml` z Caddy = HTTPS z automatu, www → bez www; `wdroz.sh user@serwer [--z-baza]`;
  `przygotuj-serwer.sh` = Docker + codzienna kopia bazy 3:30, 14 dni). Na serwerze: `/opt/szamanie/app` (kod),
  `/opt/szamanie/data` (baza, zostaje między wdrożeniami), `/opt/szamanie/.env`. Klucz SSH do serwera:
  `~/.ssh/szamanie_ed25519` (publiczny trzeba dodać na serwerze). Działanie serwera Next w układzie kontenera
  sprawdzone lokalnie; samego obrazu Dockera nie dało się zbudować na tym komputerze (wyłączona wirtualizacja w Windows) —
  pierwszy build obrazu na serwerze. Po starcie: przepięcie DNS szamanie.pl (bez ruszania rekordów poczty MX),
  Google Search Console (weryfikacja przez rekord DNS TXT), zgłoszenie sitemap.xml.
  Zrobione: `src/components/Szaman.tsx` + `Szaman.css` — szaman w kapturze z piórkiem, laska = widelec z logo;
  pętla 10 s: 3 gryzy burgera z żuciem → czary widelcem (iskry, burger wraca) → zaproszenie. Na komputerze
  dymek „A Ty co szamiesz? ← wpisz w wyszukiwarkę”, na telefonie szaman w rogu obok „Co dziś”, a w polu
  szukania „pisane” podpowiedzi („Może burger?”, „Może pizza?”…). Bez ruchu przy „ogranicz animacje”.
- Podgląd: komputer http://localhost:3000, telefon w tym samym Wi-Fi http://192.168.0.122:3000
  (`allowedDevOrigins` w next.config.ts).
- **SEO — audyt przed wdrożeniem (25.10, po restarcie komputera; kod jeszcze bez zmian):** do poprawy:
  brak adresu kanonicznego na stronie głównej; brak obrazka do udostępnień (og:image) — ważne przy linkach
  w lokalnych grupach na Facebooku; nieistniejące `/krasnik/cos` i `/lokal/cos` zwracają kod 200 z noindex
  zamiast 404; 33 z 58 lokali nie ma w bazie kuchni (np. Fantazja, Primavera, Tam Tam, Stary Młyn, Mar-Mat,
  Bus Bar, Rancho), więc nie trafiają na strony „pizza / kebab / burgery”. Pytanie do usera: co serwują te lokale
  i jakie lokale zna w Urzędowie.
- **Zdjęcia dań wgrane (25.10, po restarcie PC):** 76 zdjęć poglądowych w `public/zdjecia/dania/` (600×600, 3,7 MB),
  wpisy w `src/lib/zdjeciaDan.ts` (`ZDJECIA_DAN`), kredyty na `/autorzy-zdjec` (25 na CC BY/BY-SA z podpisem, reszta CC0).
  **Rosół bez zdjęcia** — w wolnych zasobach tylko azjatyckie zupy; lepiej brak niż nie to danie. Na podmianę później:
  zdjęcia własne lokali (panel) albo Magnific.
- **SEO — poprawki z audytu zrobione (25.10):** prawdziwe 404 dla nieistniejących `/krasnik/…`, `/lokal/…`, `/…/dowoz`
  (`ensureStatic = "navigation"` w 4 stronach — strona w całości statyczna, nieznany adres czeka na wynik zamiast
  szkieletu z kodem 200; lokal dodany do bazy po buildzie pojawia się sam po ok. minucie). Strona główna: adres
  kanoniczny + dane dla Google o witrynie (nazwa „szamanie.pl”, logo). **Obrazki do udostępnień** (Facebook, Messenger,
  WhatsApp): zdjęcie, logo, tytuł strony, np. „Pizza w Kraśniku · 8 lokali · Ceny od 20 zł”; osobne dla strony głównej,
  miejscowości, kategorii, dowozu i każdego lokalu (`src/lib/obrazekUdostepnien.tsx`, fonty OFL w `public/fonty/`,
  obrazek w cache 1 h). Błąd „Na szamanie.pl jest 4 lokale” → „są 4 lokale”.
- **Kuchnie i dane 15 lokali uzupełnione (25.10)** — źródła: własne strony lokali (Nadwiślanka, Gospoda Okruszek,
  Fantazja, Rubio, Zielony Dworek) i opisy z wyników wyszukiwania (Bus Bar, Folwark Smaków, Mar-Mat, Para Coffee,
  Ludmiła, Smakuś, Zapiekanki, Rynkowa Annopol, Dom-bar Smacznie zdrowo). Wpisane przez `npm run popraw` (tabela poprawki).
  Do sprawdzenia przez usera: **Fantazja** — w OSM „Aleja Niepodległości 7”, a jej strona podaje „ul. Popiełuszki 1”
  (przeprowadzka?); **Rubio** ma na stronie dwie różne wersje godzin — godzin nie wpisałem.
  Bez danych: Karczma Myśliwska, Stary Młyn, Tam Tam, Kwadrat, Primavera (zajazd, Oboźna 34), Bajka, Zagajnik.
- **Nowe strony fraz (25.10):** `/krasnik/obiady` („Obiady Kraśnik” — 10 lokali z kuchnią polską/pierogami),
  `/krasnik/pierogi` (4, z cenami z menu), `/krasnik/zapiekanki` (3), `/annopol/pizza`, `/annopol/obiady`,
  `/annopol/dowoz`, `/goscieradow/pizza`, `/goscieradow/kebab` — razem 22 strony fraz. Kategorie „obiady”, „pierogi”,
  „zapiekanki” są tylko na stronach fraz (własne `pasuje` w `seo.ts`), filtry na stronie głównej bez zmian.
  `next build` przechodzi (107 stron).
- Konkurencja w Google na „restauracje Kraśnik”: restaurantguru.com, infokrasnik.pl (lokalny portal — też kandydat
  na link do szamanie.pl).
- U Górala: kuchnie „polska, regionalna” na początku listy (poprawka). Baner lokalu bierze teraz pierwszą rozpoznaną
  kuchnię, a nie pizzę z menu (zmiana w `motyw.ts` z drugiej sesji).
- **Strona lokalu — poprawki (25.10):** baner lokalu wybiera pierwszą rozpoznaną kuchnię (`motyw.ts`: najpierw dane lokalu,
  potem kuchnie z nazwy/menu) — wcześniej każdy lokal z pizzą w karcie miał zdjęcie pizzerii (Si! → włoska, U Górala,
  Nadwiślanka, Okruszek → polska, Rubio → restauracja). W menu dania pod rząd z tym samym zdjęciem poglądowym
  pokazują je tylko raz (`bezPowtorzen` w MenuLokalu).
- **SEO — audyt przed wdrożeniem, runda 2 (25.10 wieczorem; user: „dawaj dalej z seo, ogarnij, bo jutro na produkcję”).**
  Skrypt audytu (wszystkie adresy z sitemap: status, title, description, canonical, h1, og:image, JSON-LD, linki)
  + Lighthouse w trybie telefonu. Zrobione:
  - **Strony lokali bez telefonu, godzin, www, Facebooka i menu → `noindex, follow` i poza sitemap**
    (`doIndeksu()` w `seo.ts`; było 26 z 58). Odblokowują się same, gdy dane dojdą (`npm run popraw`, menu).
  - Tytuły i opisy lokali: nazwa w opisie (5 kebabów miało identyczny opis), bez podwójnego „Kraśnik”,
    przy tej samej nazwie w tej samej miejscowości dochodzi ulica (3× Sandomierska Manufaktura Lodów), krótsze końcówki
    („— godziny i telefon” / „— menu i ceny”); strony fraz: „Pizza Kraśnik — 8 lokali, ceny, godziny”.
  - Canonical na `/dla-lokali` i `/autorzy-zdjec`; robots.txt: `Disallow: /propozycje`; bez nagłówka X-Powered-By.
  - **Przekierowania 308 ze starej wersji szamanie.pl:** /discover, /about/* → /, /about/howitworks, /lawinfo/contact,
    /login → /dla-lokali, /lawinfo/privacypolicy|rodo|cookiepolicy → /polityka-prywatnosci.
  - **Nowa strona `/polityka-prywatnosci`** (link w stopce): bez kont, ciasteczek i analityki; ulubione i lista zamówienia
    tylko w przeglądarce; lokalizacja liczona na urządzeniu; dane lokali z OSM/stron lokali (art. 6 ust. 1 lit. f RODO),
    poprawianie/usuwanie wpisu na prośbę; prawa + UODO. **Potrzebne od usera przed wdrożeniem: `ADMINISTRATOR`
    (imię i nazwisko albo firma z adresem) i `KONTAKT_EMAIL`** — wpisać w `/opt/szamanie/.env`; `wdroz.sh` podaje
    ten plik do buildu jako `.env.production` (strony są statyczne, ustawienia czytane przy buildzie).
  - JSON-LD menu: pozycje bez ceny bez `offers` (druga sesja dodaje menu bez cen), `sameAs` tylko gdy jest link.
  - Nazwa z OSM „dom weselny "u Bacy"” → „Dom weselny „U Bacy”” (`npm run popraw`).
  - **Strona lokalu na telefonie: Lighthouse wydajność 55 → 84, CLS 0,47 → 0** — baner (LCP) z `preload` zamiast
    leniwego ładowania (`Baner.tsx`), szkielet strony lokalu na cały ekran (stopka nie skacze przy wczytaniu).
    Strony fraz ~92, główna ~88; SEO 100, dostępność 96–100, dobre praktyki 100.
  - **Błędy wdrożenia złapane na próbnym buildzie:** (1) „database is locked” przy buildzie ze świeżej kopii bazy —
    `otworz.mjs` ustawia `busy_timeout` przed przełączeniem na WAL, `wdroz.sh` wysyła kopię już w trybie WAL;
    (2) **sharp bez bibliotek libvips w obrazie** (śledzenie plików ich nie kopiuje) → zdjęcia szłyby w pełnym rozmiarze
    jako JPEG; `Dockerfile` kopiuje całe `node_modules/@img`, a `wdroz.sh` po starcie sprawdza, czy zdjęcia wychodzą
    jako WebP; (3) strona „kebab w Kraśniku” wywracała build po dodaniu menu Nadwiślanki (Annopol) — `CenyDan` bierze
    tylko dania lokali z danej strony.
- **Wdrożenie — co jest potrzebne od usera (26.10):** dostęp do serwera (IP, użytkownik root albo z sudo, port SSH;
  klucz publiczny `~/.ssh/szamanie_ed25519.pub` do dopisania w `~/.ssh/authorized_keys` albo hasło na pierwsze
  logowanie), dostęp do DNS domeny szamanie.pl (rekord A na IP serwera, MX bez zmian), `ADMINISTRATOR` i `KONTAKT_EMAIL`.
  Kolejność: `przygotuj-serwer.sh` → `.env` → `wdroz.sh` → DNS → sprawdzenie (HTTPS, www → bez www, 404, WebP,
  przekierowania) → Google Search Console (rekord TXT) → zgłoszenie sitemap.xml → prośba o indeksację /krasnik,
  /krasnik/pizza, /krasnik/kebab, /krasnik/burgery, /krasnik/dowoz.
- **Menu i telefony we wszystkich kartach lokali (25.10, wieczór).** User: *„a co z menu? chcę, żeby były w karcie
  restauracji”* oraz *„dlaczego nie ma we wszystkich numerów telefonu? na bank mają, sprawdź FB i internet”*.
  **Menu: z 3 do 12 lokali** (`dane/lokale/*.txt` → `npm run menu`): Rubio (strona Hotelu Kraft), Nadwiślanka (jej system
  zamówień), Zielony Dworek (strona, **bez cen**), Gospoda Okruszek (zdjęcie tablicy z 15.02.2023 → ceny oznaczone jako
  stare), BD Star Kebab (bdstar.pl), Pizzeria Parkowa (pizzeriaparkowa.pl), Pizzeria Golińska (pizzeria-golinska.pl),
  MusiCaffe (pizza z cenami, reszta bez), Tam Tam (zdjęcie karty z posta lokalu na FB, 21.06.2026).
  Strona lokalu: menu bez cen → „Menu sprawdzone … · lokal nie podaje cen”; ceny starsze niż rok → „Ceny z … — mogą być
  nieaktualne” (`Menu.bezCen`, `Menu.stareCeny` w `lib/menu.ts`).
  **Telefony: z 15 do 45 lokali** (`npm run popraw`, przy okazji adresy, linki FB/www, kuchnie Primavera = włoska,
  Tam Tam = azjatycka, Kwadrat = dowóz, nazwa „Pizzeria Golińska”). Źródła: zakładka „Informacje” na stronach lokali
  na FB (czytane ręcznie w przeglądarce, bez skryptów), strony lokali; z katalogów firm (pkt.pl, panoramafirm, targeo,
  polomap) tylko: Rynkowa Annopol, Kingdom Kebab, Gajewska, Bajka, Zagajnik, Zapiekanki — do potwierdzenia przy okazji.
  Bez telefonu zostały: Smacznie zdrowo bo domowo, S&M, Sorento, Stary Młyn, Lech Łukasik, Karczma Myśliwska (FB „Karczma
  Myśliwska” to Szumirad w Opolskiem, nie Kraśnik), Smakuś (FB bez numeru), Bosko, Bus Bar, McDonald's, 3× Sandomierska
  Manufaktura Lodów. **Do decyzji usera:** Mały Bar PIZZA (PDF z 21.07.2020 — wstawić z ostrzeżeniem o starych cenach?),
  Fantazja (menu tygodniowe tylko na FB), Pyszny Kebab (menu w aplikacji GloriaFood — da się przepisać przez przeglądarkę).
  Tam Tam: w OSM punkt jest ok. 800 m od adresu z FB (Urzędowska 4) — adresu nie zmieniałem, do sprawdzenia.
- **Menu: bez zdjęć dań, działy jako kafelki (25.10).** User: *„w menu bez sensu, żeby były zdjęcia”*, *„ale kategorie
  fajnie graficznie wyglądają”*, *„pizza — wchodzisz i jest rozwijana, na mobile słabo scrollować aż tyle”*, potem:
  *„na mobilce spoko — tylko na desktopie od razu rozwinięte”*. Zrobione: dział = kafelek ze zdjęciem kategorii
  (nazwa, liczba pozycji, „od X zł”, „N na liście”), dotknięcie rozwija/zwija; **telefon: na start zwinięte,
  komputer (lg): rozwinięte** — domyślny stan w CSS, bez mrugania; otwarty dział ma przyklejony kafelek u góry;
  szukanie rozwija trafienia. Zdjęcia przy daniach usunięte (zostają jako okładki działów, z dopiskiem „poglądowe”).
- **Własny styl strony lokalu — pierwszy: Pizzeria Parkowa (25.10).** User: *„Parkowa fajną stronę zrobiła, w tym
  stylu chcemy ich kartę — wchodząc w ich kartę mamy styl ich strony”*. `src/lib/motywyStron.ts` (rejestr motywów:
  kolory tokenów, kroje, baner, menu numerowane) + `components/szablony/kroje.ts` (Playfair Display, Karla, bez
  preload) + `BanerSwietliki.tsx` (noc w parku: świetliki, białe drzewo). Komponenty strony lokalu przepięte na tokeny
  (`text-na-akcencie`, `bg-karta`, `text-tlo` zamiast białego/czarnego), więc kolejne lokale = sam wpis w rejestrze.
  Logo i zdjęć z pizzeriaparkowa.pl NIE kopiuję (zgoda właściciela) — drzewo to ikona lucide, styl/kolory/kroje.
  Później: motyw w panelu lokalu (abonament), więcej rodzajów banerów.
- **Próbny build po zmianach drugiej sesji (25.10 późno: nowe menu 12 lokali, telefony 45/58, menu-kafelki, motyw
  Pizzerii Parkowej z Playfair/Karla):** build przechodzi, audyt 74 adresów bez błędów (tylko za długie tytuły, kosmetyka),
  JSON-LD menu bez cen OK. Lighthouse na telefonie: Si! wydajność 86, Parkowa 77 (LCP = obrazek pierwszego kafelka
  menu, 8 plików fontów naraz) — podpowiedź przekazana drugiej sesji, nie blokuje wdrożenia.
- **Menu na całą szerokość (25.10).** User: *„dlaczego menu nie jest na całą szerokość, tylko dzieli z kolumną godzin
  i »To Twój lokal«? bez sensu”*. Strona lokalu na komputerze: nagłówek | godziny, pod spodem menu na całą szerokość
  (dania w dwóch kolumnach), na dole adres z mapą | dostawa, usługi, „To Twój lokal?”. Telefon bez zmian (menu zaraz
  pod przyciskami). Wydajność: pierwszy kafelek działu ładowany od razu (preload), pozostałe leniwie (LCP Parkowej).
- **Strona z menu w Parkowej — user: „zajebiście zrobiłeś”, „weź to zapisz gdzieś” (25.10).** Kopia tej wersji
  (kod, dane menu, baza, zrzuty) w `D:\APLIKACJE\inne\szamanie-kopie\2026-10-25_menu-parkowa\` (opis w CO-TO-JEST.txt).
  Ten kierunek — styl strony lokalu wzięty z jego własnej strony www — jest trafiony; kolejne lokale robić tak samo.
- **Próbny build po nowym układzie strony lokalu na komputerze (25.10 noc):** build OK, audyt 74 adresów bez błędów.
  Lighthouse na komputerze: Parkowa 99, Si! 98, główna 100, CLS ~0. Telefon: Parkowa 78 (symulacja wolnego 4G:
  12 fontów + kafelki menu w pierwszym ekranie; bez dławienia zdjęcie gotowe po 0,4 s). Do poprawy u drugiej sesji:
  kontrast pigułek cech dań (`text-[11px]`, dostępność Si! 96).
- **Baner Parkowej z ich drzewem (25.10).** User: *„tylko tę grafikę zmień i daj pod spodem Pizzeria Parkowa,
  Kraśnik · ul. Parkowa 1 · Piec Moretti · Pizza 32 cm”* (wkleił ich drzewo). Drzewo z pizzeriaparkowa.pl →
  `public/motywy/parkowa/drzewo.png`; w banerze: drzewo, linia, nazwa (h1) i adres. **Przed wdrożeniem potwierdzić
  zgodę Parkowej na logo** (nasza zasada: logo/zdjęcia lokali za zgodą).
- **Plakietki „przyjazny dla…” (25.10).** User: *„info, że restauracja sprzyja osobom ze zwierzętami, że można wejść,
  ułatwienia dla niepełnosprawnych, kuchnia vege i wegańska — vegan friendly, veggie friendly”*. Pod nazwą lokalu:
  „Zwierzęta mile widziane”, „Dostępny dla niepełnosprawnych”, „Opcje wegetariańskie”, „Opcje wegańskie”
  (`plakietkiLokalu` w `szablony/wspolne.ts`). Źródła: OSM (wheelchair, dog, diet:*), menu (≥3 dania wege →
  wegetariańskie; dziś 12 lokali), ręcznie: `npm run popraw -- <slug> zwierzeta|wozek|wege|wegan tak|nie`.
  Do zebrania od usera/lokali: kto wpuszcza z psem, kto ma podjazd, kto ma dania wegańskie. Później: filtry na głównej.
- **Asian Panda (Kraśnik, Lubelska 94) już nie istnieje** — user, 25.10. Ukryta (`lokale.ukryty = 1`; import z OSM tego
  pola nie zmienia). Strona /lokal/asian-panda-krasnik daje teraz 404; w Kraśniku z kuchni azjatyckiej został Tam Tam.
- **Próbny build po cechach lokali / plakietkach / banerze Parkowej (25.10 noc):** build OK, audyt 74 adresów bez błędów,
  dostępność i SEO Si! i Parkowej 100. **Do decyzji usera przed wdrożeniem: drzewo z pizzeriaparkowa.pl na banerze Parkowej**
  — bez zgody lokalu podmienić `znak` w `src/lib/motywyStron.ts` na własną grafikę.
- **pizzeriaparkowa.pl — jak powstała (sprawdzone 25.10 na prośbę usera):** Next.js 16.2.9 (App Router, Turbopack),
  React 19.3, Tailwind CSS 4 (+ tw-animate-css), ikony lucide, kroje Playfair Display + Karla + Italianno (next/font),
  hosting **Vercel** (A 216.198.79.1, statyczna strona, og:image z next/og, JSON-LD Restaurant, Search Console podpięte).
  Domena zarejestrowana **14.06.2026** w nazwa.pl (tam DNS i poczta), strona wdrożona **18.06.2026** (lastmod w sitemap) —
  całość w ok. 4 dni, jedna podstrona, zamawianie przez pyszne.pl i Glovo. Brak podpisu autora. Stos typowy dla stron
  robionych z pomocą AI (v0 / Claude / Cursor). `tree.png` / `logo-drzewo.jpg` to ich logo — stąd zgoda na drzewo w banerze.
  Wniosek biznesowy: tak wygląda konkurencja dla „własnej strony lokalu” w abonamencie szamanie.pl.
- **Przegląd: co działa, czego nie ma (25.10).** User: *„Myśliwskiej też już nie ma, sprawdź dobrze jeszcze raz — co
  jest, a czego nie ma”*. Ukryte: Asian Panda, Karczma Myśliwska. Sprawdzone: ostatni post na FB lokalu (czytane
  w przeglądarce), aktualne dane OSM (Overpass: data edycji, check_date), strony lokali. OSM NIE oznacza zamknięć
  (Panda i Myśliwska dalej tam są) — nie ufać mu w tej sprawie.
  **Niepewne (do potwierdzenia przez usera):** Bus Bar (OSM 2015, brak śladów w sieci), Pizzeria Sorento (OSM 2016,
  tylko nieoficjalny FB), Primavera (FB ost. post 10.2022, domena wygasła; Booking ma ofertę noclegów), Gospoda
  Okruszek (FB 03.2025), Zajazd Zagajnik, Restauracja Bajka, Mały Bar PIZZA Urzędów, BD Spicy Kebab (FB bez postów),
  Zapiekanki (OSM 08.2024). Reszta ma ślady z 2026. Przy okazji: import OSM czyta też tag `mobile` (Smakuś miał
  numer tylko tam).
- **Wszystkie 9 niepewnych już nie istnieje — user, 25.10.** Ukryte (`ukryty = 1`): Bus Bar, Pizzeria Sorento,
  Primavera, Gospoda Okruszek, Zajazd Zagajnik, Restauracja Bajka, Mały Bar PIZZA (Urzędów; notka w
  dane/lokale-spoza-osm.txt), BD Spicy Kebab, Zapiekanki – bar przekąskowy. Razem ukrytych 11 (z Pandą i Myśliwską),
  widocznych 47 (Kraśnik 39). Menu ma teraz 11 widocznych lokali (Okruszek ukryty, plik menu zostaje).
  Skutki dla SEO (strony fraz powstają same od progów): Gościeradów i Urzędów bez stron, mogą zniknąć /annopol/*
  i /krasnik/zapiekanki — sprawdza druga sesja w audycie przed wdrożeniem.
- **Po ukryciu 11 nieistniejących lokali (25.10 noc; 47 widocznych):** build OK, audyt 59 adresów bez błędów (41 lokali
  w sitemap). Same zniknęły (404, bez linków): /goscieradow/* (został 1 lokal), /krasnik/zapiekanki, strony ukrytych lokali.
  Nowa reguła w `kategorieZeStrona` (seo.ts): **bez strony kategorii, która ma wszystkie lokale obszaru** — /annopol/restauracje
  miała te same 3 lokale co /annopol (podwójna treść). Zostaje 16 stron fraz: Kraśnik 11 + dowóz, Annopol 3 + dowóz.
- **Ikonka „Dowóz” od razu na stronie głównej (25.10).** User: *„ważne — od razu trzeba dawać ikonkę, że mają dowóz,
  już na stronie głównej; tego mi wszędzie zawsze brakowało”*. Karta lokalu na liście ma plakietkę „Dowóz”
  — ostatecznie (user: „tam, gdzie ikona nawigacji i telefonu”) jako ikona w kółku przed nawigacją i telefonem
  (`SzybkieAkcje.tsx`). Na stronie lokalu: pomarańczowa pigułka „Dowóz” / „Dostawa od X zł” na samej górze.
  Ostatecznie (user: „rozciągnij i animuj; blok dowóz–nawigacja–telefon na samym dole w jednej linii”): dolny pasek
  karty = rozciągnięta pomarańczowa „Dowóz” z jadącym autkiem (`.dowoz-auto` w globals.css) + nawigacja + telefon. Dowóz ma 10 lokali: Si!, U Górala, MusiCaffe, Fantazja, Ludmiła, Kwadrat,
  Nadwiślanka, Rynkowa + BD Star i Golińska (z ich stron). Pizzeria Parkowa dowozi tylko przez Pyszne.pl/Glovo —
  nieoznaczona (do decyzji: osobna plakietka „dowóz przez aplikacje”?). Pozostałe: zbierać (FB „Usługi”, telefon).
- **Menu Kwadratu z FB (25.10)** — user: *„menu Kwadratu masz na FB”*. 3 strony karty ze zdjęć (18.09.2026) →
  `dane/lokale/kwadrat-miejsce-spotkan-stroza-kolonia.txt` (57 pozycji); kuchnie: włoska, burgery, azjatycka.
  Bez lunchu — wg usera Kwadrat nie serwuje już lunchy. Menu ma teraz 12 widocznych lokali.
- **Oceny i opinie z Google — wybrane: Places API (25.10, wieczór).** User: *„zaciągnąć ocenę z Google? i ostatnie
  wpisy — na stronie głównej w karcie, na dole sekcji”* → *„places api”*. Scrapowania Google NIE robimy (regulamin).
  Na dziś: przycisk „Opinie w Google” na stronie lokalu (link do Map Google, bez klucza).
  **Jutro, gdy user da klucz:** Google Cloud → projekt → włączyć „Places API (New)” → billing (karta; przy ~50 lokalach
  powinno się zmieścić w darmowym limicie — sprawdzić aktualne stawki przed uruchomieniem) → klucz API ograniczony do
  Places API (i IP serwera) → `.env`: GOOGLE_PLACES_KEY. Wtedy: dopasować place_id do lokali (place_id wolno trzymać
  na stałe), ocena + liczba opinii + ostatnie opinie (max 5, z autorem i podpisem „Google”) na karcie na głównej i na
  stronie lokalu; dane z Google pobierane na bieżąco z krótkim cache (regulamin nie pozwala ich trzymać u nas na stałe).
  Przy okazji to samo API daje: businessStatus (zamknięte na stałe), delivery, allowsDogs, servesVegetarianFood,
  dostępność dla wózków — do pokazania z podpisem Google, nie do przepisywania do naszej bazy.
  Warunki do Places API (od drugiej sesji, 25.10): (1) ocen/opinii z Google NIE wstawiać do JSON-LD
  (aggregateRating/review) — tylko widoczne na stronie z podpisem Google; (2) opinie mają imiona autorów → po wdrożeniu
  dać znać drugiej sesji, dopisze akapit w /polityka-prywatnosci; wywołania tylko z serwera (nie z przeglądarki);
  (3) strony lokali są statyczne (`ensureStatic`) → ocena przez `"use cache"` z krótkim `cacheLife`, bez
  connection()/cookies (inaczej build pada).
- **Places API — uwagi SEO/prawne (czarn-46, 25.10 noc):** ocen i opinii z Google NIE oznaczać w JSON-LD
  (`aggregateRating`/`review` — wytyczne Google: tylko opinie zebrane przez własną stronę, inaczej ryzyko ręcznej kary);
  wywołania tylko z serwera; po wdrożeniu dopisać do `/polityka-prywatnosci` akapit o opiniach z Google (imiona autorów
  = dane osobowe, pobierane na bieżąco, nie przechowywane); strony lokali są statyczne (`ensureStatic`) → dane z Google
  przez `"use cache"` z krótkim `cacheLife`, nie przez `connection()`.
- **Repozytorium git (26.10):** user zakłada repo na GitHubie (polecił mu to Kamil). Lokalnie `git init -b main`,
  pierwszy commit dcfc1c7 (232 pliki). Poza repo: `data/` (baza), `.env*`, `node_modules`, `.next`. `.gitattributes`
  wymusza LF (`core.autocrlf=true` w Gicie na Windowsie psułby `deploy/*.sh` na serwerze). README po polsku.
  Repo **prywatne** (PLAN.md z notatkami biznesowymi, drzewo Parkowej bez potwierdzonej zgody). Od teraz zamiast
  kopii folderów w `szamanie-kopie` wystarczy commit przed dużą zmianą. `gh` nie jest zainstalowany; push przez
  Git Credential Manager (przy pierwszym logowaniu otwiera się przeglądarka).

### 26.10 — repo git (czarn-46)
- Repozytorium git założyła czarn-57: dcfc1c7, `.gitattributes` eol=lf, README. Moje wczorajsze zmiany SEO i wdrożenia weszły w pierwszy commit.
- b5950c2: `deploy/wdroz.sh` pakuje kod bez `.git`. W `deploy/*.sh` i Dockerfile nie ma znaków CR, więc pliki na serwer jadą z LF.
- Od teraz każda zmiana idzie jako commit (`git add -A && git commit`). Push robi czarn-57, kiedy będzie adres repo na GitHubie.
- **Panel właściciela (user, 26.10):** „będziemy musieli zrobić logowanie dla właścicieli restauracji — będą mieli
  własny dashboard”. To etap 2. Propozycja: konta e-mail + hasło (scrypt z node:crypto, sesje w SQLite, ciasteczko
  httpOnly), przejęcie lokalu przez „To Twój lokal?” z ręczną weryfikacją przez admina (telefon na numer lokalu),
  zmiany właściciela zapisywane do `poprawki`/`menu` z autorem, po zapisie odświeżenie strony lokalu (cacheTag).
  Do decyzji usera: sposób logowania, skrzynka do wysyłki maili (reset hasła), co jest za darmo, a co w abonamencie.
  User dopisał: właściciele „będą mogli edytować menu, dodawać promocje itd.”. Promocje to nowa tabela (od–do, dni
  tygodnia, godziny, np. „Wtorek: druga pizza -50%”). Przy obniżce ceny trzeba pokazać najniższą cenę z 30 dni
  (dyrektywa Omnibus), więc razem z edycją menu zapisujemy historię cen.
  **Logowanie (user, 26.10): Google, Apple albo e-mail.** Plan: własne sesje w SQLite + biblioteka `arctic`
  (OAuth Google/Apple), konta łączone po adresie e-mail. E-mail = 6-cyfrowy kod (na telefonie lepszy niż link,
  bo link otwiera się w przeglądarce aplikacji pocztowej). Google: darmowy klient OAuth w tym samym projekcie
  Google Cloud co Places API. Apple: wymaga Apple Developer Program (99 USD/rok), więc dopiero po Google i e-mailu.
  Do wysyłki kodów potrzebna skrzynka na domenie (SMTP); rekordów MX nie ruszamy.
  Czeka na usera: gdzie jest poczta szamanie.pl (hosting, „podam później”) i zgoda na start panelu. Potem start
  na gałęzi `feat/panel` (osobny worktree, Pull Request do `main`), pierwszy lokal testowy: Kwadrat.

### 26.10 — panel właściciela, ustalenia z czarn-57 (czarn-46)
- Panel powstaje na gałęzi `feat/panel` w worktree `D:\APLIKACJE\inne\szamanie-panel` (podgląd :3001). Na main wejdzie po review w PR, nie w dzisiejszym wdrożeniu.
- **Migracja 6 w `schemat.mjs` należy do panelu.** Nowe migracje na main tylko po uzgodnieniu numeru.
- `robots.ts`: `Disallow: /panel` (już na main).
- Po scaleniu do `/opt/szamanie/.env` dochodzą: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_HASLO, SMTP_OD. Trzeba je też dopisać do szablonu w `przygotuj-serwer.sh`.
- Po scaleniu w polityce prywatności dopisać akapit o panelu: e-mail, imię i telefon właściciela przy przejęciu lokalu oraz ciasteczko sesji. Oznacza to też zmianę zdania „bez ciasteczek”.
- 26.10, próbny build main (2d20110): przeszedł. Audyt: 59 adresów bez błędów, zostały 3 za długie tytuły. Na produkcji /favicon.ico, /wp-login.php i /.env dają czyste 404 bez błędów. InvariantError „did not produce a static shell” jest tylko w dev.
- d3c5910: dodany `src/app/favicon.ico` (16/32/48 px z icon.png, 7 KB), więc /favicon.ico zwraca 200 zamiast 26 KB strony 404. Tytuł lokalu o tej samej nazwie w tej samej miejscowości ma krótką ulicę („Sikorskiego 7a”).
- PR #1 (panel, https://github.com/czarnymwkp/szamanie/pull/1): mój plik StronaFrazy dostał jedną linię (link do cennika dostawy tylko dla http), sprawdzone, OK. Commity 2d20110 i d3c5910 czekają lokalnie na push (u czarn-46 push zablokowany).

### 27.10 — Burger&Pizza w stylu ich karty, bez inicjałów, nowe prośby usera (czarn-57)
- e293ddd (na feat/panel: 9069117): usunięte kafelki z inicjałami lokalu (np. „MM” dla Mar-Mat) z kart, strony lokalu i propozycji 6 — userowi się nie podobały.
- **Burger&Pizza** (`dane/lokale/burger-pizza-krasnik.txt`): menu przepisane ze zdjęć karty z ich Facebooka (2 strony z 20.01.2026, user ściągnął je do Pobranych): 64 pozycje w 6 działach. Adres „Lubelska 117” z karty, wpisany przez `npm run popraw` (jest tylko w bazie). Godzin brak (FB wymaga logowania).
- Motyw w stylu ich karty (`motywyStron.ts`): białe tło, działy na czarnych belkach (`menuBelki`), numerowane dania wersalikami, ceny na pomarańczowych etykietach z ciemnym tekstem (biały na #eb8523 ma 2,8:1), kroje Rokkitt + Roboto Condensed, baner `belka` (`BanerBelka.tsx`: nazwa na belce wjeżdżającej od lewej, kreska, „Handmade”). User: „idealnie ci wyszło”. Logo (byk) i szkice z ich karty tylko za zgodą lokalu — na razie ikony.
- **User (27.10): na stronie głównej pod wyszukiwarką, nad „Na co masz ochotę?” ma być miejsce na banery reklamowe.**
- **User (27.10): 10 propozycji całego wyglądu na telefonie** — „na mobilce jest lipa”, kremowe tło „bardzo pusto wygląda”; w tle coś z prześwitem, nowoczesne animacje, „aplikacja mobile ma robić wow”. W toku.
- Ekran nie gaśnie (Wake Lock) tylko w ściągawce listy („Zadzwoń i zamów” / „Duże litery”) i tylko po HTTPS — na podglądzie po http z telefonu nie zadziała.
- **User (27.10): przycisk „Wege” (listek) przy wyszukiwaniu** — „feature dla nich”: pokazuje tylko lokale, gdzie zjedzą wegetarianie i weganie. Najpierw w 10 propozycjach, potem na stronie. Dane: `cechy.wege` z OSM, poprawek i menu (dania wege; dziś ok. 14 lokali), `cechy.wegan` — na razie brak; weganie potrzebują osobnego znacznika (dania wegańskie w menu / w panelu lokalu).
- **Pomysł usera (27.10): premium dla lokalu — automatyczne prowadzenie Facebooka.** Codzienne posty (np. danie dnia, promocja, godziny w święta) generowane z menu i promocji z panelu, a nawet prowadzenie reklam (ads). Technicznie: Meta Graph API — publikacja na stronie lokalu wymaga połączenia konta FB właściciela (OAuth, uprawnienie `pages_manage_posts`) i przeglądu aplikacji przez Meta; reklamy to Marketing API (`ads_management`, weryfikacja firmy, budżet i płatność po stronie lokalu). Do decyzji: treść postów pisze AI z akceptacją właściciela czy w pełni automatycznie; zakres premium i cena.
- **Pomysł usera na przyszłość (27.10): status zamówienia dla klienta.** Klient zamawia (SMS albo Facebook), dostaje średni czas oczekiwania na odbiór, a gdy jedzenie jest gotowe — powiadomienie w aplikacji. Potrzebna strona właściciela („damy radę”). Szkic: lista do zamówienia zapisuje zamówienie u nas z krótkim kodem (np. #A12), kod idzie w treści SMS-a / wiadomości; lokal w panelu widzi tablicę zamówień (przyjęte → w przygotowaniu → gotowe) i jednym dotknięciem oznacza „gotowe”; czas oczekiwania = ustawiony przez lokal albo średnia z ostatnich zamówień o tej porze. Powiadomienia: Web Push z PWA (Android bez problemu; iPhone od iOS 16.4 tylko po dodaniu strony do ekranu głównego), w aplikacji z Google Play — push przez FCM; zapasowo SMS (płatna bramka). Dane osobowe klienta (telefon) — dopisać do polityki prywatności.
