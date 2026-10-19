# shopghab.ir on the existing VPS

This site shares the FixBazi VPS and the k3isonfire API. FixBazi stays on port **3001**. ShopGhab runs in a second container on port **3002**.

Tenant header: `X-Tenant-ID: shop-ghab`. Confirm that tenant exists on the API before going live.

## DNS

Point both records at the **same VPS IP** as fixbazi.ir and namaking.ir (`185.204.197.187`):

- `shopghab.ir` A
- `www.shopghab.ir` A (or CNAME to `shopghab.ir`)

Until those records exist, shopghab.ir will not resolve. The other two frontends already share this IP.

## First-time VPS setup

```bash
mkdir -p /root/shopghab
cd /root/shopghab
# The updater clones the repo here. Create .env before the first update if you
# need values other than the defaults written when .env is missing.
cp .env.example .env   # if you have the file locally; otherwise create it by hand
```

Required `.env` values:

```
NEXT_PUBLIC_SITE_URL=https://shopghab.ir
API_BASE_URL=https://api.k3isonfire.ir/api/v1
NEXT_PUBLIC_API_TENANT_ID=shop-ghab
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-V8RY8QJX79
```

Set `ADMIN_PHONE_NUMBER` and `ADMIN_PASSWORD` before opening the admin UI.

## nginx

```bash
cp deploy/nginx/shopghab.ir.conf /etc/nginx/sites-available/shopghab.ir
ln -sf /etc/nginx/sites-available/shopghab.ir /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

The site proxies `shopghab.ir` / `www.shopghab.ir` to `127.0.0.1:3002`. Do not change the FixBazi site on port 3001.

Or run the one-shot installer after the updater has cloned the repo onto the VPS:

```bash
bash /root/shopghab/deploy/bootstrap-shopghab.sh
```

## TLS

Use the Let's Encrypt PEMs (fullchain + private key). Do not commit them. Copy onto the VPS, then bootstrap:

```bash
ssh root@185.204.197.187 'mkdir -p /root/shopghab/deploy/ssl'
scp deploy/ssl/fullchain.pem root@185.204.197.187:/root/shopghab/deploy/ssl/fullchain.pem
scp deploy/ssl/privkey.pem root@185.204.197.187:/root/shopghab/deploy/ssl/privkey.pem
ssh root@185.204.197.187 'bash /root/shopghab/deploy/bootstrap-shopghab.sh'
```

nginx will listen on 443 and redirect HTTP to HTTPS. The `.pfx` is not used. Certs expire about every 90 days (this pair is valid until 29 Nov 2026).

## Deploy

Push to `main` (or run **Deploy shopghab to VPS** in GitHub Actions). Actions builds Next.js and publishes `.next/standalone`, `.next/static`, and the commit sha on the public release tag `deploy-latest`. It does not open SSH to the VPS. `public/` and `data/design-catalog.json` stay in git; the release is only the Next.js build.

The VPS pulls that release. From this PC (port 22 on the VPS is reachable here), install the updater once:

```bash
ssh root@185.204.197.187
curl -fsSL -o /tmp/update-from-release.sh https://raw.githubusercontent.com/saeidAtashin/shopghab/main/deploy/update-from-release.sh
bash /tmp/update-from-release.sh
(crontab -l 2>/dev/null | grep -v update-from-release.sh; echo '* * * * * bash /root/shopghab/deploy/update-from-release.sh >> /var/log/shopghab-update.log 2>&1') | crontab -
```

Run the `curl` after this change is on `main`, so the raw URL exists. The script keeps `.env` and `deploy/ssl`. It also keeps the live catalog, landing settings, customers, orders, and payment receipts. A release does not replace those files with the git copies.

The server catalog stays the source of truth. Existing designs, categories, collections, attributes, and redirects are left as they were edited on the site. Records that exist only in the new release are added. Customers and orders are never taken from git. New image files under `public/` still come from the release. `npm run catalog:sync` adds new design files to the local catalog; commit that catalog when you want those new rows to appear on the server. Pushing does not copy local edits over rows that already exist on the server.

The copy of this script already on the VPS is what runs the next update. Before the first deploy that contains this change, copy `/root/shopghab/data` aside. After the change is on `main`, install the new script before cron runs it, so that update does not reset the catalog:

```bash
cp -a /root/shopghab/data /root/shopghab-data-backup
curl -fsSL -o /root/shopghab/deploy/update-from-release.sh https://raw.githubusercontent.com/saeidAtashin/shopghab/main/deploy/update-from-release.sh
bash /root/shopghab/deploy/update-from-release.sh
```

After a successful update the app should answer on `http://127.0.0.1:3002` and at `https://shopghab.ir`.

## VPS health (three frontends)

Three Next.js containers (FixBazi `:3001`, ShopGhab `:3002`, Namaking) plus nginx are fine on about **4 GB RAM**. On **2 GB** they will likely swap or get killed.

ShopGhab is capped at **768 MB / 1 CPU** in `docker-compose.prod.yml` so it cannot starve the other sites. After ShopGhab is up, check leftover RAM on the server:

```bash
free -h; df -h; uptime
docker stats --no-stream
docker ps
```

If `free` shows less than about **1 GB unused**, lower the other sites' `mem_limit` the same way, or upgrade the VPS.
