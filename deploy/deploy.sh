#!/usr/bin/env bash
# Deploys to the server with one command (from Git Bash on Windows or from Linux):
#   deploy/deploy.sh root@1.2.3.4             code + build on the server; the server database stays
#   deploy/deploy.sh root@1.2.3.4 --with-db   also replaces the server database with the local one (the old one goes to data/backups)
# SSH port other than 22: SSH_PORT=2222 deploy/deploy.sh …; key: ~/.ssh/szamanie_ed25519 (or SSH_KEY=…)
# The first deployment always ships the database. The server is prepared once with deploy/prepare-server.sh.
set -euo pipefail

TARGET=${1:?"Użycie: deploy/deploy.sh user@serwer [--with-db]"}
WITH_DB=${2:-}
PORT=${SSH_PORT:-22}
KEY=${SSH_KEY:-$HOME/.ssh/szamanie_ed25519}
DIR=/opt/szamanie
OPTS=(-o ServerAliveInterval=30)
[ -f "$KEY" ] && OPTS+=(-i "$KEY")

cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "→ Kopia bazy (spójna, także gdy działa lokalny serwer)…"
node -e "new (require('node:sqlite').DatabaseSync)('data/szamanie.db').exec(\"VACUUM INTO '$TMP/szamanie.db'\")"
# the copy goes straight to WAL mode (stored in the file) — otherwise the build processes switch it at once and lock each other out
node -e "const d = new (require('node:sqlite').DatabaseSync)('$TMP/szamanie.db'); d.exec('PRAGMA journal_mode = WAL'); d.close()"

echo "→ Pakuję kod…"
tar --exclude=./.git --exclude=./node_modules --exclude=./.next --exclude=./data --exclude='./.env*' \
  --exclude='*.tsbuildinfo' --exclude=./next-env.d.ts -czf "$TMP/app.tgz" .
du -h "$TMP/app.tgz" "$TMP/szamanie.db" | sed 's/^/  /'

echo "→ Wysyłam na $TARGET…"
scp -q "${OPTS[@]}" -P "$PORT" "$TMP/app.tgz" "$TARGET:/tmp/szamanie-app.tgz"
scp -q "${OPTS[@]}" -P "$PORT" "$TMP/szamanie.db" "$TARGET:/tmp/szamanie.db"

echo "→ Buduję i uruchamiam na serwerze…"
# the script goes through stdin, so there is no terminal: the user must be root or have passwordless sudo
ssh "${OPTS[@]}" -p "$PORT" "$TARGET" "WITH_DB='$WITH_DB' DIR='$DIR' bash -s" <<'REMOTE'
set -euo pipefail
SUDO=""; [ "$(id -u)" -eq 0 ] || SUDO="sudo"

$SUDO mkdir -p "$DIR/data/backups"
$SUDO rm -rf "$DIR/app.new" && $SUDO mkdir -p "$DIR/app.new/data"
$SUDO tar -xzf /tmp/szamanie-app.tgz -C "$DIR/app.new"
$SUDO cp /tmp/szamanie.db "$DIR/app.new/data/szamanie.db"   # only for the build (page generation)
[ -d "$DIR/app" ] && { $SUDO rm -rf "$DIR/app.old"; $SUDO mv "$DIR/app" "$DIR/app.old"; }
$SUDO mv "$DIR/app.new" "$DIR/app"
# settings read at build time (static pages: ADMINISTRATOR, CONTACT_EMAIL) — Next reads them from .env.production
[ -f "$DIR/.env" ] && $SUDO cp "$DIR/.env" "$DIR/app/.env.production"

COMPOSE="$SUDO docker compose -f $DIR/app/deploy/docker-compose.yml"
[ -f "$DIR/.env" ] && COMPOSE="$COMPOSE --env-file $DIR/.env"

if [ ! -f "$DIR/data/szamanie.db" ] || [ "$WITH_DB" = "--with-db" ]; then
  echo "  podmieniam bazę na serwerze"
  $COMPOSE stop app 2>/dev/null || true
  [ -f "$DIR/data/szamanie.db" ] && $SUDO cp "$DIR/data/szamanie.db" "$DIR/data/backups/before-deploy-$(date +%F-%H%M).db"
  $SUDO rm -f "$DIR/data/szamanie.db-wal" "$DIR/data/szamanie.db-shm"
  $SUDO cp /tmp/szamanie.db "$DIR/data/szamanie.db"
fi
$SUDO chown -R 1000:1000 "$DIR/data"   # inside the container the app runs as the node user (1000)
$SUDO rm -f /tmp/szamanie-app.tgz /tmp/szamanie.db

$COMPOSE up -d --build --remove-orphans
$SUDO docker image prune -f >/dev/null

for i in $(seq 1 30); do
  if curl -sf -o /dev/null http://127.0.0.1:3000/; then
    echo "✓ Aplikacja działa"
    # next/image without sharp serves photos full-size — a slower page and a worse score in Google
    TYPE=$(curl -s -o /dev/null -w '%{content_type}' -H 'Accept: image/webp' \
      'http://127.0.0.1:3000/_next/image?url=%2Fzdjecia%2Fkategorie%2Fpizza.jpg&w=640&q=75')
    [ "$TYPE" = "image/webp" ] && echo "✓ Zdjęcia skalowane (WebP)" || echo "⚠ Zdjęcia nieskalowane ($TYPE) — sprawdź sharp w obrazie"
    exit 0
  fi
  sleep 2
done
echo "✗ Aplikacja nie odpowiada — logi:"; $COMPOSE logs --tail=50 app; exit 1
REMOTE
