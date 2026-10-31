#!/bin/bash
# Pull the published Next.js build onto the VPS. GitHub Actions never connects inbound.
set -euo pipefail

APP_DIR="/root/shopghab"
REPO_URL="https://github.com/saeidAtashin/shopghab.git"
RELEASE_BASE="https://github.com/saeidAtashin/shopghab/releases/download/deploy-latest"
LOCK_FILE="/var/lock/shopghab-update.lock"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  exit 0
fi

# Enabled templates in mockup-templates/templates.config.ts. Each one needs prepared/<id>/base.png.
PREPARED_BASES=(
  iphone-17-pro-cover
  iphone-17-pro-case
  iphone-pro-case
  mockup-1
  mockup-1-1
  mockup-2
  mockup-2-1
  mockup-3
  iphone-14-pro-matt
  iphone-pro-in-hand
  iphone-case-on-path
  iphone-free-case
)

prepared_bases_ready() {
  local id
  for id in "${PREPARED_BASES[@]}"; do
    if [ ! -f "$APP_DIR/mockup-templates/prepared/$id/base.png" ]; then
      return 1
    fi
  done
}

ensure_prepared_templates() {
  if prepared_bases_ready; then
    return 0
  fi
  mkdir -p "$APP_DIR/mockup-templates/prepared"
  local archive
  archive="$(mktemp)"
  if ! curl -fL "$RELEASE_BASE/mockup-prepared.tgz" -o "$archive"; then
    rm -f "$archive"
    echo "prepared template archive is not on the release" >&2
    return 1
  fi
  tar -xzf "$archive" -C "$APP_DIR/mockup-templates/prepared"
  rm -f "$archive"
  if ! prepared_bases_ready; then
    echo "prepared template archive is missing a template base" >&2
    return 1
  fi
}

remote_sha="$(curl -fsSL "$RELEASE_BASE/deploy-sha.txt" | tr -d '[:space:]')"
if [ -z "$remote_sha" ]; then
  echo "deploy-latest release has an empty sha" >&2
  exit 1
fi

local_sha=""
if [ -f "$APP_DIR/DEPLOY_SHA" ]; then
  local_sha="$(tr -d '[:space:]' < "$APP_DIR/DEPLOY_SHA")"
fi
if [ "$remote_sha" = "$local_sha" ]; then
  ensure_prepared_templates
  exit 0
fi

RUNTIME="$(mktemp -d)"
cleanup() {
  local status=$?
  if [ "$status" -ne 0 ]; then
    restore_cached_runtime "$APP_DIR" || true
  fi
  rm -rf "$RUNTIME"
  exit "$status"
}
trap cleanup EXIT

snapshot_runtime_data() {
  local source_dir="$1"
  if [ -f "$source_dir/data/design-catalog.json" ]; then
    cp "$source_dir/data/design-catalog.json" "$RUNTIME/design-catalog.json"
  fi
  if [ -f "$source_dir/data/landing-sections.json" ]; then
    cp "$source_dir/data/landing-sections.json" "$RUNTIME/landing-sections.json"
  fi
  if [ -f "$source_dir/data/shop-activity.json" ]; then
    cp "$source_dir/data/shop-activity.json" "$RUNTIME/shop-activity.json"
  fi
  if [ -d "$source_dir/data/receipts" ]; then
    mkdir -p "$RUNTIME/receipts"
    cp -a "$source_dir/data/receipts/." "$RUNTIME/receipts/"
  fi
  if [ -d "$source_dir/public/designed/mockups" ]; then
    mkdir -p "$RUNTIME/mockups"
    cp -a "$source_dir/public/designed/mockups/." "$RUNTIME/mockups/"
  fi
  if [ -d "$source_dir/public/designed/edits" ]; then
    mkdir -p "$RUNTIME/edits"
    cp -a "$source_dir/public/designed/edits/." "$RUNTIME/edits/"
  fi
}

preserve_local_files() {
  local source_dir="$1"
  local dest_dir="$2"
  if [ -f "$source_dir/.env" ]; then
    cp "$source_dir/.env" "$dest_dir/.env"
  fi
  if [ -d "$source_dir/deploy/ssl" ]; then
    mkdir -p "$dest_dir/deploy/ssl"
    cp -a "$source_dir/deploy/ssl/." "$dest_dir/deploy/ssl/"
  fi
}

restore_cached_runtime() {
  local dest_dir="$1"
  if [ -z "${RUNTIME:-}" ] || [ ! -d "$RUNTIME" ] || [ ! -d "$dest_dir" ]; then
    return 0
  fi
  mkdir -p "$dest_dir/data"
  if [ -f "$RUNTIME/design-catalog.json" ]; then
    cp "$RUNTIME/design-catalog.json" "$dest_dir/data/design-catalog.json"
  fi
  if [ -f "$RUNTIME/landing-sections.json" ]; then
    cp "$RUNTIME/landing-sections.json" "$dest_dir/data/landing-sections.json"
  fi
  if [ -f "$RUNTIME/shop-activity.json" ]; then
    cp "$RUNTIME/shop-activity.json" "$dest_dir/data/shop-activity.json"
  fi
  if [ -d "$RUNTIME/receipts" ]; then
    mkdir -p "$dest_dir/data/receipts"
    cp -a "$RUNTIME/receipts/." "$dest_dir/data/receipts/"
  fi
  restore_server_mockups "$dest_dir"
  restore_server_edits "$dest_dir"
  echo "update failed; restored cached runtime data" >&2
}

restore_server_mockups() {
  local dest_dir="$1"
  if [ ! -d "$RUNTIME/mockups" ]; then
    return 0
  fi
  # Copy the live photos back over the git copies. Files that exist only in
  # the new release stay, because this does not delete the destination.
  mkdir -p "$dest_dir/public/designed/mockups"
  cp -a "$RUNTIME/mockups/." "$dest_dir/public/designed/mockups/"
}

restore_server_edits() {
  local dest_dir="$1"
  if [ ! -d "$RUNTIME/edits" ]; then
    return 0
  fi
  # Edited artworks are not in git. A fresh clone would drop them.
  mkdir -p "$dest_dir/public/designed/edits"
  cp -a "$RUNTIME/edits/." "$dest_dir/public/designed/edits/"
}

restore_runtime_files() {
  local dest_dir="$1"
  mkdir -p "$dest_dir/data"
  # Landing is tracked, so git reset replaces it. Put the live file back.
  if [ -f "$RUNTIME/landing-sections.json" ]; then
    cp "$RUNTIME/landing-sections.json" "$dest_dir/data/landing-sections.json"
  fi
  # Customers, orders, and receipts are not in git. A reset leaves them in
  # place; a fresh clone does not. Copy the snapshot only when the update
  # removed them, so an order written during the pull is kept.
  if [ -f "$RUNTIME/shop-activity.json" ] && [ ! -f "$dest_dir/data/shop-activity.json" ]; then
    cp "$RUNTIME/shop-activity.json" "$dest_dir/data/shop-activity.json"
  fi
  if [ -d "$RUNTIME/receipts" ] && [ ! -d "$dest_dir/data/receipts" ]; then
    mkdir -p "$dest_dir/data/receipts"
    cp -a "$RUNTIME/receipts/." "$dest_dir/data/receipts/"
  fi
}

merge_live_catalog() {
  local dest_dir="$1"
  if [ ! -f "$RUNTIME/design-catalog.json" ]; then
    return 0
  fi
  mkdir -p "$dest_dir/data"
  if [ ! -f "$dest_dir/data/design-catalog.json" ]; then
    cp "$RUNTIME/design-catalog.json" "$dest_dir/data/design-catalog.json"
    return 0
  fi
  cp "$dest_dir/data/design-catalog.json" "$RUNTIME/incoming-design-catalog.json"
  if ! docker run --rm \
    -v "$dest_dir/deploy/merge-runtime-catalog.mjs:/merge.mjs:ro" \
    -v "$RUNTIME/design-catalog.json:/live.json:ro" \
    -v "$RUNTIME/incoming-design-catalog.json:/incoming.json:ro" \
    -v "$dest_dir/data:/out" \
    node:22-bookworm-slim \
    node /merge.mjs --live /live.json --incoming /incoming.json --out /out/design-catalog.json
  then
    cp "$RUNTIME/design-catalog.json" "$dest_dir/data/design-catalog.json"
    echo "catalog merge failed; restored the cached catalog and continuing the code update" >&2
  fi
}

if [ -d "$APP_DIR" ]; then
  snapshot_runtime_data "$APP_DIR"
fi

if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --depth 1 origin main
  git -C "$APP_DIR" reset --hard FETCH_HEAD
else
  staging="$(mktemp -d)"
  rmdir "$staging"
  git clone --depth 1 --branch main "$REPO_URL" "$staging"
  if [ -d "$APP_DIR" ]; then
    preserve_local_files "$APP_DIR" "$staging"
    rm -rf /root/shopghab.old
    mv "$APP_DIR" /root/shopghab.old
  fi
  mv "$staging" "$APP_DIR"
fi

restore_runtime_files "$APP_DIR"
restore_server_mockups "$APP_DIR"
restore_server_edits "$APP_DIR"
ensure_prepared_templates
merge_live_catalog "$APP_DIR"
mkdir -p "$APP_DIR/mockup-templates/prepared" "$APP_DIR/public/designed/mockups" "$APP_DIR/public/designed/edits"

if [ ! -f "$APP_DIR/.env" ]; then
  printf '%s\n' \
    'NEXT_PUBLIC_SITE_URL=https://shopghab.ir' \
    'API_BASE_URL=https://api.k3isonfire.ir/api/v1' \
    'NEXT_PUBLIC_API_TENANT_ID=shop-ghab' \
    'NEXT_PUBLIC_GA_MEASUREMENT_ID=G-V8RY8QJX79' \
    > "$APP_DIR/.env"
fi

archive="$(mktemp)"
curl -fL "$RELEASE_BASE/shopghab-next.tgz" -o "$archive"
rm -rf "$APP_DIR/.next"
tar -xzf "$archive" -C "$APP_DIR"
rm -f "$archive"

cd "$APP_DIR"
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d --force-recreate --remove-orphans
docker image prune -f

if [ -f "$APP_DIR/deploy/bootstrap-shopghab.sh" ]; then
  bash "$APP_DIR/deploy/bootstrap-shopghab.sh"
fi

printf '%s\n' "$remote_sha" > "$APP_DIR/DEPLOY_SHA"
rm -rf /root/shopghab.old
echo "Updated shopghab to $remote_sha"
