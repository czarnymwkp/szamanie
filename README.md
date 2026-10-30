# szamanie.pl

Directory of restaurants and food places in Kraśnik county (powiat kraśnicki): opening hours, menus, phone numbers,
directions and a list of dishes to order by phone.
Next.js 16 (App Router) + SQLite (`node:sqlite`, Node 24), no external services. Plans, decisions and work status are in
[`PLAN.md`](PLAN.md) (in Polish).

## Running locally

```bash
npm ci
npm run dev        # http://localhost:3000
```

The database `data/szamanie.db` is not in the repository (`/data` is in `.gitignore`), but its catalog is:
`dane/baza-startowa.json` holds venues, menus, delivery zones, towns and manual corrections. When the database has no
venues (fresh clone, CI, a new server volume), the app creates the schema and loads that file on first open — no setup
needed. Accounts, sessions, owner requests, promotions and paid packages are never exported (the repository is public).

After changing data locally, refresh the file and commit it:

```bash
npm run baza:eksport               # data/szamanie.db → dane/baza-startowa.json
```

The file only fills an empty database: a server that already has venues keeps its own data (edits from the owner panel).
To rebuild the catalog from scratch instead:

```bash
npm run import:osm                 # venues from OSM (Overpass API)
npm run dodaj                      # venues missing from OSM, from dane/lokale-spoza-osm.txt
npm run menu -- <slug>             # menu from dane/lokale/<slug>.txt
```

`npm run build` runs `scripts/init-db.mjs` first (npm `prebuild`), so the build also works on a fresh database.

## Data scripts

| Command | What it does |
| --- | --- |
| `npm run import:osm` | fetches venues from OSM; leaves venues with `reczna_edycja` and the `ukryty` field untouched |
| `npm run dodaj` | adds or updates venues from `dane/lokale-spoza-osm.txt` |
| `npm run menu -- <slug>` | loads the menu from `dane/lokale/<slug>.txt` |
| `npm run popraw -- <slug> <field> <value>` | manual correction of a venue (e.g. `telefon`, `dostawa`, `zwierzeta`) |
| `npm run pakiet -- <slug> <top\|galeria> <days>` | manually grants a paid package (`npm run pakiet -- lista` shows active ones) |
| `npm run konto -- admin <e-mail>` | admin role in the panel and an entry link (`lista`, `link <e-mail>`, `lokal <e-mail> <slug>`, `odbierz <e-mail> <slug>`) |
| `npm run baza:eksport` | writes the catalog from the local database to `dane/baza-startowa.json` (commit it afterwards) |

## Venue panel (`/panel`)

No login for now. An owner asks for access to a venue ("To Twój lokal?" on the venue page), the admin confirms it by
phone on the venue's number in `/panel/admin` and texts them a private link `/panel/wejdz/<token>` that opens the panel
(90-day session; the same link works on more devices until the admin creates a new one or revokes access). The admin can
also grant access without a request: venue panel → Dane tab → "Dostęp do panelu".
The admin gets their own link from `npm run konto -- admin <e-mail>` (Coolify → Terminal:
`node scripts/konto.mjs admin <e-mail>`; own server: `docker compose exec app node scripts/konto.mjs admin <e-mail>`).
In the panel: details and opening hours, menu with prices, delivery zones, promotions.
Changes show on the venue page right away. Menus and zones edited in the panel are not overwritten by `npm run menu`.

Variables in `.env.local` (locally) or in the server environment, all optional:

| Variable | Purpose |
| --- | --- |
| `PANEL_LOGOWANIE=1` | enables login with an e-mailed code and with Google (ready, disabled for now) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google login (Google Cloud → OAuth client ID, web application; redirect URI `https://szamanie.pl/panel/logowanie/google/powrot`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_HASLO`, `SMTP_OD` | sending login codes; without them codes go to the server logs |
| `CONTACT_EMAIL` | receives notifications about new venue requests |

## Deployment

**Docker image (CI):** every push to `main` builds the image and pushes it to
`registry.tools.bngdev.com/registry/szamanie` (`:latest` and `:<sha>`), see `.github/workflows/deploy.yml`.
Pull requests only build the image (no VPN, no push); manual runs from a branch push just `:<sha>`.
The registry is reachable only from the home network and the VPN, so the job first joins the WireGuard VPN as its
own peer, then resolves `*.tools.bngdev.com` through the router's DNS (`10.0.0.1`).
Required in GitHub → Settings → Secrets and variables → Actions:

- secrets: `DOCKER_REGISTRY_USERNAME`, `DOCKER_REGISTRY_PASSWORD`, `WIREGUARD_CONFIG` (a full `wg0.conf` of the CI
  peer, without a `DNS =` line; `AllowedIPs = 192.168.88.205/32, 10.0.0.1/32`, plus the prod server's public IP
  for the Coolify webhook), optionally `COOLIFY_WEBHOOK` + `COOLIFY_TOKEN` (after a build of `main` the job
  redeploys the Coolify resource; skipped while unset)
- variables: `ADMINISTRATOR`, `CONTACT_EMAIL`, optionally `NEXT_PUBLIC_SITE_URL` (baked into static pages at build time)

**Coolify:** `deploy/docker-compose.coolify.yml` runs the registry image behind Coolify's proxy. Setup, copying the
database and backups are described at the top of the file.

**Own server (Docker + Caddy, HTTPS from Let's Encrypt):** prepare the server once with `deploy/przygotuj-serwer.sh`;
each deployment is `deploy/wdroz.sh user@server` (from Git Bash). Both scripts describe themselves in their header
comments. Server settings (`DOMENA`, `CONTACT_EMAIL`, `ADMINISTRATOR`) live in `/opt/szamanie/.env`, outside the repository.
