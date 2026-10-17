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
  exit 0
fi

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

if [ ! -f "$APP_DIR/.env" ]; then
  printf '%s\n' \
    'NEXT_PUBLIC_SITE_URL=https://shopghab.ir' \
    'API_BASE_URL=https://api.k3isonfire.ir/api/v1' \
    'NEXT_PUBLIC_API_TENANT_ID=shop-ghab' \
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
