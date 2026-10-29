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

The database `data/szamanie.db` **is not in the repository** (`/data` is in `.gitignore`). The schema is created on first
open. An empty database is filled from OpenStreetMap and menu files:

```bash
npm run import:osm                 # venues from OSM (Overpass API)
npm run dodaj                      # venues missing from OSM, from dane/lokale-spoza-osm.txt
npm run menu -- <slug>             # menu from dane/lokale/<slug>.txt
```

Manual corrections (phone numbers, addresses, hidden venues, amenities) are stored only in the database, so a full copy
of the data has to be obtained separately.

`npm run build` runs `scripts/init-db.mjs` first (npm `prebuild`), so the build also works on a fresh, empty database.

## Data scripts

| Command | What it does |
| --- | --- |
| `npm run import:osm` | fetches venues from OSM; leaves venues with `reczna_edycja` and the `ukryty` field untouched |
| `npm run dodaj` | adds or updates venues from `dane/lokale-spoza-osm.txt` |
| `npm run menu -- <slug>` | loads the menu from `dane/lokale/<slug>.txt` |
| `npm run popraw -- <slug> <field> <value>` | manual correction of a venue (e.g. `telefon`, `dostawa`, `zwierzeta`) |
| `npm run pakiet -- <slug> <top\|galeria> <days>` | manually grants a paid package (`npm run pakiet -- lista` shows active ones) |

## Deployment

**Docker image (CI):** every push to `main` builds the image and pushes it to
`registry.tools.bngdev.com/registry/szamanie` (`:latest` and `:<sha>`), see `.github/workflows/deploy.yml`.
Pull requests only build the image (no VPN, no push); manual runs from a branch push just `:<sha>`.
The registry is reachable only from the home network and the VPN, so the job first joins the WireGuard VPN as its
own peer, then resolves `*.tools.bngdev.com` through the router's DNS (`10.0.0.1`).
Required in GitHub → Settings → Secrets and variables → Actions:

- secrets: `DOCKER_REGISTRY_USERNAME`, `DOCKER_REGISTRY_PASSWORD`, `WIREGUARD_CONFIG` (a full `wg0.conf` of the CI
  peer, without a `DNS =` line; `AllowedIPs = 192.168.88.205/32, 10.0.0.1/32`)
- variables: `ADMINISTRATOR`, `CONTACT_EMAIL`, optionally `NEXT_PUBLIC_SITE_URL` (baked into static pages at build time)

**Coolify:** `deploy/docker-compose.coolify.yml` runs the registry image behind Coolify's proxy. Setup, copying the
database and backups are described at the top of the file.

**Own server (Docker + Caddy, HTTPS from Let's Encrypt):** prepare the server once with `deploy/przygotuj-serwer.sh`;
each deployment is `deploy/wdroz.sh user@server` (from Git Bash). Both scripts describe themselves in their header
comments. Server settings (`DOMENA`, `CONTACT_EMAIL`, `ADMINISTRATOR`) live in `/opt/szamanie/.env`, outside the repository.
