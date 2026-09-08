#!/bin/bash
set -euo pipefail

APP_DIR="/root/shopghab"
VPS_IP="185.204.197.187"
SSL_DST="/etc/nginx/ssl/shopghab.ir"
SSL_SRC="$APP_DIR/deploy/ssl"
CONF_SSL="$APP_DIR/deploy/nginx/shopghab.ir.conf"
CONF_HTTP="$APP_DIR/deploy/nginx/shopghab.ir.http.conf"

echo "==> Installing nginx vhost for shopghab.ir"

if ! command -v nginx >/dev/null 2>&1; then
  echo "nginx is not installed. Install nginx, then re-run this script."
  exit 1
fi

mkdir -p "$SSL_DST"

if [ -f "$SSL_SRC/fullchain.pem" ] && [ -f "$SSL_SRC/privkey.pem" ]; then
  install -m 644 "$SSL_SRC/fullchain.pem" "$SSL_DST/fullchain.pem"
  install -m 600 "$SSL_SRC/privkey.pem" "$SSL_DST/privkey.pem"
  echo "Installed TLS certs to $SSL_DST"
else
  echo "No PEM pair in $SSL_SRC (need fullchain.pem and privkey.pem)."
fi

if [ -f "$SSL_DST/fullchain.pem" ] && [ -f "$SSL_DST/privkey.pem" ]; then
  CONF_SRC="$CONF_SSL"
  echo "Using HTTPS vhost (HTTP → HTTPS, proxy :3002)"
else
  CONF_SRC="$CONF_HTTP"
  echo "Using HTTP-only vhost until certs are in $SSL_SRC"
fi

if [ ! -f "$CONF_SRC" ]; then
  echo "Missing $CONF_SRC — copy deploy/nginx from the repo or wait for CI."
  exit 1
fi

cp "$CONF_SRC" /etc/nginx/sites-available/shopghab.ir
ln -sf /etc/nginx/sites-available/shopghab.ir /etc/nginx/sites-enabled/shopghab.ir
nginx -t
systemctl reload nginx
echo "nginx reloaded. shopghab.ir → 127.0.0.1:3002 (not the FixBazi default vhost)"

echo "==> Checking public DNS (must be $VPS_IP)"
dns_ok=1
for host in shopghab.ir www.shopghab.ir; do
  resolved="$(getent ahostsv4 "$host" 2>/dev/null | awk '{print $1; exit}' || true)"
  if [ "$resolved" = "$VPS_IP" ]; then
    echo "  $host → $resolved"
  else
    echo "  $host → ${resolved:-unresolved}  (expected $VPS_IP)"
    dns_ok=0
  fi
done

if [ "$dns_ok" -ne 1 ]; then
  echo "DNS is not public yet. The app is on http://127.0.0.1:3002"
  echo "After fire.parspack.net / continent.parspack.net publish, https://shopghab.ir will work."
fi
