#!/usr/bin/env bash
# Backs up the register.var.camp server: the attendee database, the
# production env file, the Nginx site config and the PM2 process list.
#
# Run on the server as the user that runs PM2 (usually ubuntu):
#
#   bash scripts/backup-register.sh            # full backup (for migration)
#   bash scripts/backup-register.sh --db-only  # database only (for cron)
#
# Settings (environment variables):
#   APP_DIR     Repository root. Default: /var/www/register.var.camp/htdocs
#   BACKUP_DIR  Output folder.   Default: $HOME/register-backups
#   KEEP_DAYS   Delete backups older than this many days. Default: 14
#
# The archive holds attendee personal data and production secrets. Keep it
# private: never commit it, and copy it only to machines you control.

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/register.var.camp/htdocs}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/register-backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
DB_ONLY=false

if [[ "${1:-}" == "--db-only" ]]; then
  DB_ONLY=true
fi

REGISTER_DIR="$APP_DIR/apps/register"
ENV_FILE="$REGISTER_DIR/.env.production.local"
STAMP="$(date +%F-%H%M%S)"
WORK_DIR="$(mktemp -d)"
NAME="register-backup-$STAMP"
OUT="$WORK_DIR/$NAME"

trap 'rm -rf "$WORK_DIR"' EXIT
umask 077
mkdir -p "$OUT" "$BACKUP_DIR"

log() { printf '%s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is not installed. Run: sudo apt-get install -y sqlite3" >&2
  exit 1
fi

# Same lookup as the app: ATTENDEE_DATABASE_PATH from the env file, relative
# to apps/register, or the default path.
DB_PATH="data/attendees.sqlite"
if [[ -f "$ENV_FILE" ]]; then
  CONFIGURED="$(grep -E '^ATTENDEE_DATABASE_PATH=' "$ENV_FILE" | tail -n 1 |
    cut -d= -f2- | tr -d '"'"'" | xargs || true)"
  if [[ -n "$CONFIGURED" ]]; then
    DB_PATH="$CONFIGURED"
  fi
fi
if [[ "$DB_PATH" != /* ]]; then
  DB_PATH="$REGISTER_DIR/$DB_PATH"
fi

# 1. Attendee database. ".backup" is safe while the app is writing (WAL mode);
# copying the file directly can miss recent registrations.
if [[ -f "$DB_PATH" ]]; then
  sqlite3 "$DB_PATH" ".backup '$OUT/attendees.sqlite'"
  CHECK="$(sqlite3 "$OUT/attendees.sqlite" 'PRAGMA integrity_check;')"
  if [[ "$CHECK" != "ok" ]]; then
    echo "Database integrity check failed: $CHECK" >&2
    exit 1
  fi
  ROWS="$(sqlite3 "$OUT/attendees.sqlite" 'SELECT COUNT(*) FROM attendees;')"
  CHECKED_IN="$(sqlite3 "$OUT/attendees.sqlite" \
    'SELECT COUNT(*) FROM attendees WHERE checked_in_at IS NOT NULL;')"
  LAST_TICKET="$(sqlite3 "$OUT/attendees.sqlite" \
    'SELECT COALESCE(MAX(ticket_number), 0) FROM attendees;')"
  log "Database: $ROWS attendees, $CHECKED_IN checked in, last ticket $LAST_TICKET"
else
  warn "No attendee database at $DB_PATH"
  ROWS="none"
  CHECKED_IN="none"
  LAST_TICKET="none"
fi

if [[ "$DB_ONLY" == false ]]; then
  # 2. Production secrets.
  for file in "$ENV_FILE" "$REGISTER_DIR/.env.local" "$REGISTER_DIR/.env"; do
    if [[ -f "$file" ]]; then
      cp "$file" "$OUT/"
      log "Env file: $(basename "$file")"
    fi
  done
  if [[ ! -f "$ENV_FILE" ]]; then
    warn "No env file at $ENV_FILE"
  fi

  # 3. Nginx site config (WordOps or plain Nginx). Needs sudo to read.
  mkdir -p "$OUT/nginx"
  for file in \
    /etc/nginx/sites-available/register.var.camp \
    /etc/nginx/sites-available/register.var.camp.conf \
    /etc/nginx/conf.d/register.var.camp.conf; do
    if sudo -n test -f "$file" 2>/dev/null; then
      sudo -n cat "$file" >"$OUT/nginx/$(basename "$file")"
      log "Nginx: $file"
    fi
  done
  if sudo -n test -d /var/www/register.var.camp/conf/nginx 2>/dev/null; then
    sudo -n cp -r /var/www/register.var.camp/conf/nginx "$OUT/nginx/wordops-conf"
    sudo -n chown -R "$(id -un)" "$OUT/nginx/wordops-conf"
    log "Nginx: WordOps site includes"
  fi
  if [[ -z "$(ls -A "$OUT/nginx")" ]]; then
    warn "Nginx config not copied (needs passwordless sudo, or copy it by hand)"
  fi

  # 4. PM2 process list.
  if command -v pm2 >/dev/null 2>&1; then
    pm2 jlist >"$OUT/pm2-processes.json" 2>/dev/null || true
    if [[ -f "$HOME/.pm2/dump.pm2" ]]; then
      cp "$HOME/.pm2/dump.pm2" "$OUT/"
    fi
  fi

  # 5. Versions, to rebuild the same setup on the new server.
  {
    echo "created_at=$(date -Is)"
    echo "hostname=$(hostname)"
    echo "git_commit=$(git -C "$APP_DIR" rev-parse HEAD 2>/dev/null || echo unknown)"
    echo "git_branch=$(git -C "$APP_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
    echo "node=$(node -v 2>/dev/null || echo unknown)"
    echo "npm=$(npm -v 2>/dev/null || echo unknown)"
    echo "pm2=$(pm2 -v 2>/dev/null || echo unknown)"
    echo "os=$(. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME" || uname -sr)"
    echo "database_path=$DB_PATH"
  } >"$OUT/versions.txt"
fi

{
  echo "attendees=$ROWS"
  echo "checked_in=$CHECKED_IN"
  echo "last_ticket_number=$LAST_TICKET"
} >"$OUT/summary.txt"

ARCHIVE="$BACKUP_DIR/$NAME.tar.gz"
tar -czf "$ARCHIVE" -C "$WORK_DIR" "$NAME"
(cd "$BACKUP_DIR" && sha256sum "$NAME.tar.gz" >"$NAME.tar.gz.sha256")
chmod 600 "$ARCHIVE" "$ARCHIVE.sha256"

# Remove old backups.
find "$BACKUP_DIR" -maxdepth 1 -name 'register-backup-*.tar.gz*' \
  -mtime +"$KEEP_DAYS" -delete

log "Backup saved: $ARCHIVE"
