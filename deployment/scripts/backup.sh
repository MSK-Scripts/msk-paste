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
LOG_FILE="/var/log/msk-paste-backup.log"
RETENTION_DAYS=14

# Colours only on a terminal. In a log file they are noise, and until
# 2026-09-03 the nightly cron mail carried the raw escape sequences.
if [[ -t 1 ]]; then
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    NC='\033[0m'
else
    GREEN=''
    RED=''
    NC=''
fi

log_ok()  { echo -e "${GREEN}✓${NC}  $1"; }
log_err() { echo -e "${RED}✗${NC}  $1" >&2; }

# ─── Cron output: silent on success, loud on failure ─────────────────
#
# Cron's original channels are saved to 3 and 4 BEFORE stdout is bent
# into the log file. Only the failure path writes to channel 3, so a run
# that completes produces no output and therefore no mail.
#
# Why this changed on 2026-09-03: these echo lines used to go straight
# to cron. Since the MAILTO entry of 2026-09-02 that meant a success
# mail every single night, escape sequences included, and a daily report
# nobody reads uncovers a standstill just as poorly as no mail at all.
# Same reasoning as /opt/msk-paste/scripts/msk-cron.sh.
exec 3>&1 4>&2
if [[ -w "$(dirname "$LOG_FILE")" || -w "$LOG_FILE" ]]; then
    exec >> "$LOG_FILE" 2>&1
fi

STARTED="$(date -Is)"
echo "=== $STARTED  start backup (pid $$)"

on_exit() {
    local rc=$?
    # A dump that died mid-flight leaves a .partial behind. Remove it so
    # a truncated file can never be mistaken for a backup.
    if [[ -n "${PARTIAL:-}" && -e "${PARTIAL:-}" ]]; then
        rm -f "$PARTIAL"
        echo "Removed incomplete file: $PARTIAL"
    fi
    if [[ $rc -ne 0 ]]; then
        echo "=== $(date -Is)  END FAILED rc=$rc"
        {
            echo "Backup 'msk-paste' on $(hostname -f) failed."
            echo "Start:     $STARTED"
            echo "End:       $(date -Is)"
            echo "Exit code: $rc"
            echo "Log:       $LOG_FILE"
            echo
            echo "--- last 40 lines ---"
            tail -n 40 "$LOG_FILE" 2>/dev/null
        } >&3
    else
        echo "=== $(date -Is)  end backup rc=0"
    fi
}
trap on_exit EXIT

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
PARTIAL="${BACKUP_FILE}.partial"

# Write to .partial first, rename afterwards. Until 2026-09-03 the dump
# was piped straight into the final name: an abort mid-stream left a
# truncated .sql.gz behind that the retention counts and that looks like
# a valid backup. The EXIT trap clears the .partial away.
#
# stderr deliberately no longer goes to /dev/null. MariaDB 11.8 does not
# print the password warning the redirect was guarding against (measured
# on the server), so all it did was swallow real errors.
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
    "$DB_NAME" \
    | gzip -9 > "$PARTIAL"

mv "$PARTIAL" "$BACKUP_FILE"
unset PARTIAL
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
