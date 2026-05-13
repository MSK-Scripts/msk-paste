#!/usr/bin/env bash
# ============================================================================
# MSK Paste – Backup script
#
# Creates a gzip-compressed dump of the MariaDB database.
# Keeps the latest 14 backups, older ones are deleted automatically.
#
# Usage: sudo bash /opt/msk-paste/deployment/scripts/backup.sh
# Cron:  0 3 * * * /opt/msk-paste/deployment/scripts/backup.sh
# ============================================================================

set -euo pipefail

APP_DIR="/opt/msk-paste"
BACKUP_DIR="/var/backups/msk-paste"
RETENTION_DAYS=14

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_ok()  { echo -e "${GREEN}✓${NC}  $1"; }
log_err() { echo -e "${RED}✗${NC}  $1" >&2; }

# Root check
if [[ $EUID -ne 0 ]]; then
    log_err "Please run with sudo"
    exit 1
fi

# ─── Load .env ───────────────────────────────────────────────────────
if [[ ! -f "$APP_DIR/.env" ]]; then
    log_err ".env not found at $APP_DIR"
    exit 1
fi

# shellcheck disable=SC1091
set -o allexport
source <(grep -E '^(DB_NAME|DB_USER|DB_PASSWORD|DB_HOST|DB_PORT)=' "$APP_DIR/.env")
set +o allexport

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"

# ─── Prepare backup directory ────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# ─── Create dump ─────────────────────────────────────────────────────
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="$BACKUP_DIR/msk-paste-${TIMESTAMP}.sql.gz"

mariadb-dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASSWORD" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    --add-drop-table \
    "$DB_NAME" 2>/dev/null \
    | gzip -9 > "$BACKUP_FILE"

chmod 600 "$BACKUP_FILE"

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log_ok "Backup created: $BACKUP_FILE (${SIZE})"

# ─── Clean up old backups ────────────────────────────────────────────
DELETED=$(find "$BACKUP_DIR" -name "msk-paste-*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [[ $DELETED -gt 0 ]]; then
    log_ok "${DELETED} old backup(s) deleted (older than ${RETENTION_DAYS} days)"
fi

TOTAL=$(find "$BACKUP_DIR" -name "msk-paste-*.sql.gz" | wc -l)
echo "Backups in directory: ${TOTAL}"
