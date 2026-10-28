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

## Wdrożenie

Docker + Caddy (HTTPS z Let's Encrypt). Serwer przygotowuje się raz skryptem `deploy/przygotuj-serwer.sh`, a każde wdrożenie to
`deploy/wdroz.sh user@serwer` (z Git Basha). Opis jest w komentarzach na początku obu skryptów.
Server settings (`DOMENA`, `CONTACT_EMAIL`, `ADMINISTRATOR`) live in `/opt/szamanie/.env`, outside the repository.
