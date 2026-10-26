#!/usr/bin/env bash
# Wdrożenie na serwer jednym poleceniem (z Git Basha na Windowsie albo z Linuksa):
#   deploy/wdroz.sh root@1.2.3.4            kod + build na serwerze; baza na serwerze zostaje
#   deploy/wdroz.sh root@1.2.3.4 --z-baza   do tego podmienia bazę na serwerze na lokalną (stara idzie do data/kopie)
# Port SSH inny niż 22: SSH_PORT=2222 deploy/wdroz.sh …; klucz: ~/.ssh/szamanie_ed25519 (albo SSH_KLUCZ=…)
# Przy pierwszym wdrożeniu baza jedzie zawsze. Serwer przygotowuje raz deploy/przygotuj-serwer.sh.
set -euo pipefail

CEL=${1:?"Użycie: deploy/wdroz.sh user@serwer [--z-baza]"}
Z_BAZA=${2:-}
PORT=${SSH_PORT:-22}
KLUCZ=${SSH_KLUCZ:-$HOME/.ssh/szamanie_ed25519}
KATALOG=/opt/szamanie
OPCJE=(-o ServerAliveInterval=30)
[ -f "$KLUCZ" ] && OPCJE+=(-i "$KLUCZ")

cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "→ Kopia bazy (spójna, także gdy działa lokalny serwer)…"
node -e "new (require('node:sqlite').DatabaseSync)('data/szamanie.db').exec(\"VACUUM INTO '$TMP/szamanie.db'\")"
# kopia od razu w trybie WAL (zapisany w pliku) — inaczej procesy buildu przełączają ją naraz i blokują się nawzajem
node -e "const d = new (require('node:sqlite').DatabaseSync)('$TMP/szamanie.db'); d.exec('PRAGMA journal_mode = WAL'); d.close()"

echo "→ Pakuję kod…"
tar --exclude=./.git --exclude=./node_modules --exclude=./.next --exclude=./data --exclude='./.env*' \
  --exclude='*.tsbuildinfo' --exclude=./next-env.d.ts -czf "$TMP/app.tgz" .
du -h "$TMP/app.tgz" "$TMP/szamanie.db" | sed 's/^/  /'

echo "→ Wysyłam na $CEL…"
scp -q "${OPCJE[@]}" -P "$PORT" "$TMP/app.tgz" "$CEL:/tmp/szamanie-app.tgz"
scp -q "${OPCJE[@]}" -P "$PORT" "$TMP/szamanie.db" "$CEL:/tmp/szamanie.db"

echo "→ Buduję i uruchamiam na serwerze…"
# skrypt idzie przez stdin, więc bez terminala: użytkownik musi być rootem albo mieć sudo bez hasła
ssh "${OPCJE[@]}" -p "$PORT" "$CEL" "Z_BAZA='$Z_BAZA' K='$KATALOG' bash -s" <<'ZDALNIE'
set -euo pipefail
S=""; [ "$(id -u)" -eq 0 ] || S="sudo"

$S mkdir -p "$K/data/kopie"
$S rm -rf "$K/app.nowa" && $S mkdir -p "$K/app.nowa/data"
$S tar -xzf /tmp/szamanie-app.tgz -C "$K/app.nowa"
$S cp /tmp/szamanie.db "$K/app.nowa/data/szamanie.db"   # tylko do buildu (generowanie stron)
[ -d "$K/app" ] && { $S rm -rf "$K/app.stara"; $S mv "$K/app" "$K/app.stara"; }
$S mv "$K/app.nowa" "$K/app"
# ustawienia czytane przy buildzie (strony statyczne: ADMINISTRATOR, KONTAKT_EMAIL) — Next bierze je z .env.production
[ -f "$K/.env" ] && $S cp "$K/.env" "$K/app/.env.production"

COMPOSE="$S docker compose -f $K/app/deploy/docker-compose.yml"
[ -f "$K/.env" ] && COMPOSE="$COMPOSE --env-file $K/.env"

if [ ! -f "$K/data/szamanie.db" ] || [ "$Z_BAZA" = "--z-baza" ]; then
  echo "  podmieniam bazę na serwerze"
  $COMPOSE stop app 2>/dev/null || true
  [ -f "$K/data/szamanie.db" ] && $S cp "$K/data/szamanie.db" "$K/data/kopie/przed-wdrozeniem-$(date +%F-%H%M).db"
  $S rm -f "$K/data/szamanie.db-wal" "$K/data/szamanie.db-shm"
  $S cp /tmp/szamanie.db "$K/data/szamanie.db"
fi
$S chown -R 1000:1000 "$K/data"   # w kontenerze aplikacja działa jako użytkownik node (1000)
$S rm -f /tmp/szamanie-app.tgz /tmp/szamanie.db

$COMPOSE up -d --build --remove-orphans
$S docker image prune -f >/dev/null

for i in $(seq 1 30); do
  if curl -sf -o /dev/null http://127.0.0.1:3000/; then
    echo "✓ Aplikacja działa"
    # next/image bez sharp oddaje zdjęcia w pełnym rozmiarze — wolniejsza strona i gorsza ocena w Google
    TYP=$(curl -s -o /dev/null -w '%{content_type}' -H 'Accept: image/webp' \
      'http://127.0.0.1:3000/_next/image?url=%2Fzdjecia%2Fkategorie%2Fpizza.jpg&w=640&q=75')
    [ "$TYP" = "image/webp" ] && echo "✓ Zdjęcia skalowane (WebP)" || echo "⚠ Zdjęcia nieskalowane ($TYP) — sprawdź sharp w obrazie"
    exit 0
  fi
  sleep 2
done
echo "✗ Aplikacja nie odpowiada — logi:"; $COMPOSE logs --tail=50 app; exit 1
ZDALNIE
