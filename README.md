# szamanie.pl

Katalog lokali gastronomicznych powiatu kraśnickiego. Zawiera godziny otwarcia, menu, telefon, dojazd i listę dań do zamówienia przez telefon.
Next.js 16 (App Router) + SQLite (`node:sqlite`, Node 24), bez zewnętrznych usług. Plan, decyzje i stan prac są w [`PLAN.md`](PLAN.md).

## Uruchomienie lokalnie

```bash
npm ci
npm run dev        # http://localhost:3000
```

Baza `data/szamanie.db` **nie jest w repozytorium** (`/data` jest w `.gitignore`). Schemat zakłada się sam przy pierwszym
otwarciu. Pustą bazę wypełniają dane z OpenStreetMap i plików menu:

```bash
npm run import:osm                 # lokale z OSM (Overpass API)
npm run dodaj                      # lokale spoza OSM z dane/lokale-spoza-osm.txt
npm run menu -- <slug>             # menu z dane/lokale/<slug>.txt
```

Ręczne poprawki (telefony, adresy, ukryte lokale, cechy) są zapisane tylko w bazie, więc pełną kopię danych trzeba dostać osobno.

## Skrypty danych

| Polecenie | Co robi |
| --- | --- |
| `npm run import:osm` | pobiera lokale z OSM; nie rusza lokali z `reczna_edycja` ani pola `ukryty` |
| `npm run dodaj` | dodaje lub aktualizuje lokale z `dane/lokale-spoza-osm.txt` |
| `npm run menu -- <slug>` | wczytuje menu z `dane/lokale/<slug>.txt` |
| `npm run popraw -- <slug> <pole> <wartość>` | ręczna poprawka lokalu (np. `telefon`, `dostawa`, `zwierzeta`) |
| `npm run pakiet -- <slug> <top\|galeria> <dni>` | ręcznie przyznaje płatny pakiet (`npm run pakiet -- lista` pokazuje aktywne) |
| `npm run konto -- admin <e-mail>` | rola admina w panelu (`lista`, `lokal <e-mail> <slug>`, `odbierz <e-mail> <slug>`) |

## Panel lokalu (`/panel`)

Właściciel loguje się kodem z e-maila albo przez Google, prosi o dostęp do lokalu („To mój lokal”), a admin
potwierdza to telefonicznie w `/panel/admin`. W panelu: dane i godziny, menu z cenami, strefy dostawy, promocje.
Zmiany widać na stronie lokalu od razu. Menu i strefy zmienione w panelu nie są nadpisywane przez `npm run menu`.

Zmienne w `.env.local` (lokalnie) albo `/opt/szamanie/.env` (serwer), wszystkie opcjonalne:

| Zmienna | Do czego |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | logowanie przez Google (Google Cloud → identyfikator klienta OAuth, aplikacja internetowa; adres przekierowania `https://szamanie.pl/panel/logowanie/google/powrot`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_HASLO`, `SMTP_OD` | wysyłka kodów logowania; bez nich kody trafiają do logów serwera |
| `KONTAKT_EMAIL` | tu przychodzą powiadomienia o nowych zgłoszeniach lokali |

## Wdrożenie

Docker + Caddy (HTTPS z Let's Encrypt). Serwer przygotowuje się raz skryptem `deploy/przygotuj-serwer.sh`, a każde wdrożenie to
`deploy/wdroz.sh user@serwer` (z Git Basha). Opis jest w komentarzach na początku obu skryptów.
Ustawienia serwera (`DOMENA`, `KONTAKT_EMAIL`, `ADMINISTRATOR`) są w `/opt/szamanie/.env`, poza repozytorium.
