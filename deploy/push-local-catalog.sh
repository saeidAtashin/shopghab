#!/bin/bash
# One-time: replace the VPS live design catalog with the local file.
# Prefer https://shopghab.ir admin for day-to-day name/image edits.
# Ensure new public/designed assets are already deployed before running this.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${SHOPGHAB_VPS_HOST:-root@185.204.197.187}"
REMOTE_DIR="${SHOPGHAB_VPS_DIR:-/root/shopghab}"
LOCAL_CATALOG="$ROOT/data/design-catalog.json"

if [ ! -f "$LOCAL_CATALOG" ]; then
  echo "missing $LOCAL_CATALOG" >&2
  exit 1
fi

stamp="$(date +%Y%m%d%H%M%S)"
ssh "$HOST" "cp -a '$REMOTE_DIR/data/design-catalog.json' '$REMOTE_DIR/data/design-catalog.json.bak-$stamp'"
scp "$LOCAL_CATALOG" "$HOST:$REMOTE_DIR/data/design-catalog.json"
ssh "$HOST" "cd '$REMOTE_DIR' && docker compose -f docker-compose.prod.yml up -d --force-recreate"
echo "Replaced live catalog on $HOST and recreated the shopghab container (backup .bak-$stamp)."
