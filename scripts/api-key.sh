#!/usr/bin/env bash
# MSK Paste – API keys. Run with "help" for the commands.
# Runs scripts/api-key.ts with the app's .env, from any working directory.
# Needs read access to /opt/msk-paste/.env (root or the service user).
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

if [ ! -r .env ]; then
  echo "Cannot read $APP_DIR/.env: run as root or as the service user." >&2
  exit 1
fi

exec npx --no-install tsx scripts/api-key.ts "$@"
