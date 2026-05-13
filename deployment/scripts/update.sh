#!/usr/bin/env bash
# ============================================================================
# MSK Paste – Update via GitHub Actions
#
# Updates happen automatically on push to `main` via GitHub Actions
# (see .github/workflows/deploy.yml).
#
# This script only exists as a manual fallback for emergencies.
# ============================================================================

set -euo pipefail

cat << "EOF"

  Updates are deployed automatically via GitHub Actions.

  → commit your changes
  → git push origin main
  → GitHub Actions builds & deploys

  Latest deploys:
  https://github.com/MSK-Scripts/msk-paste/actions

  Manual fallback (on the server):

    cd /opt/msk-paste
    systemctl stop msk-paste
    # ... (manually transfer the build artefacts via SCP) ...
    npm ci --omit=dev
    npm run migrate
    systemctl restart msk-paste

EOF
