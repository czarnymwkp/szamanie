#!/usr/bin/env bash
# Jednorazowe przygotowanie świeżego serwera (Ubuntu / Debian): Docker, katalogi, codzienna kopia bazy.
# Uruchomienie z komputera: ssh root@serwer 'bash -s' < deploy/przygotuj-serwer.sh
# Zapory (ufw) nie włączamy automatycznie — łatwo odciąć sobie SSH; porty 80 i 443 muszą być otwarte.
set -euo pipefail
S=""; [ "$(id -u)" -eq 0 ] || S="sudo"
K=/opt/szamanie

if ! command -v docker >/dev/null; then
  echo "→ Instaluję Dockera…"
  curl -fsSL https://get.docker.com | $S sh
fi
$S docker compose version

$S mkdir -p "$K/data/kopie"
[ -f "$K/.env" ] || printf 'DOMENA=szamanie.pl\n# CONTACT_EMAIL=\n# ADMINISTRATOR=\n' | $S tee "$K/.env" >/dev/null

# Codzienna kopia bazy o 3:30, trzymamy 14 dni. VACUUM INTO daje spójną kopię przy działającej aplikacji.
$S tee /etc/cron.d/szamanie-kopia >/dev/null <<'CRON'
30 3 * * * root docker exec szamanie-app-1 node -e "new (require('node:sqlite').DatabaseSync)('/app/data/szamanie.db').exec(\"VACUUM INTO '/app/data/kopie/szamanie-\"+new Date().toISOString().slice(0,10)+\".db'\")" && find /opt/szamanie/data/kopie -name 'szamanie-*.db' -mtime +14 -delete
CRON

echo "✓ Serwer gotowy. Teraz z komputera: deploy/wdroz.sh $(whoami)@$(hostname -I | awk '{print $1}')"
