#!/usr/bin/env bash
# One-time preparation of a fresh server (Ubuntu / Debian): Docker, directories, a daily database backup.
# Run from your computer: ssh root@server 'bash -s' < deploy/prepare-server.sh
# The firewall (ufw) is not enabled automatically — it is easy to lock yourself out of SSH; ports 80 and 443 must be open.
set -euo pipefail
SUDO=""; [ "$(id -u)" -eq 0 ] || SUDO="sudo"
DIR=/opt/szamanie

if ! command -v docker >/dev/null; then
  echo "→ Instaluję Dockera…"
  curl -fsSL https://get.docker.com | $SUDO sh
fi
$SUDO docker compose version

$SUDO mkdir -p "$DIR/data/backups"
[ -f "$DIR/.env" ] || printf 'DOMENA=szamanie.pl\n# CONTACT_EMAIL=\n# ADMINISTRATOR=\n' | $SUDO tee "$DIR/.env" >/dev/null

# Daily database backup at 3:30, kept for 14 days. VACUUM INTO gives a consistent copy while the app is running.
$SUDO tee /etc/cron.d/szamanie-backup >/dev/null <<'CRON'
30 3 * * * root docker exec szamanie-app-1 node -e "new (require('node:sqlite').DatabaseSync)('/app/data/szamanie.db').exec(\"VACUUM INTO '/app/data/backups/szamanie-\"+new Date().toISOString().slice(0,10)+\".db'\")" && find /opt/szamanie/data/backups -name 'szamanie-*.db' -mtime +14 -delete
CRON

echo "✓ Serwer gotowy. Teraz z komputera: deploy/deploy.sh $(whoami)@$(hostname -I | awk '{print $1}')"
