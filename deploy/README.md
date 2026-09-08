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
# After the first CI deploy (or after copying .env.example from the repo):
cp .env.example .env   # if you have the file locally; otherwise create it by hand
```

Required `.env` values:

```
NEXT_PUBLIC_SITE_URL=https://shopghab.ir
API_BASE_URL=https://api.k3isonfire.ir/api/v1
NEXT_PUBLIC_API_TENANT_ID=shop-ghab
```

Set `ADMIN_PHONE_NUMBER` and `ADMIN_PASSWORD` before opening the admin UI.

## nginx

```bash
cp deploy/nginx/shopghab.ir.conf /etc/nginx/sites-available/shopghab.ir
ln -sf /etc/nginx/sites-available/shopghab.ir /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

The site proxies `shopghab.ir` / `www.shopghab.ir` to `127.0.0.1:3002`. Do not change the FixBazi site on port 3001.

Or run the one-shot installer after a CI deploy has copied `deploy/` onto the VPS:

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

Push to `print-site` (or run **Deploy shopghab to VPS** in GitHub Actions). The workflow reuses `VPS_HOST`, `VPS_USER`, and `VPS_SSH_KEY`, copies the standalone build to `/root/shopghab`, and restarts the `shopghab` container.

After a successful deploy the app should answer on `http://127.0.0.1:3002` and at `https://shopghab.ir`.

## VPS health (three frontends)

Three Next.js containers (FixBazi `:3001`, ShopGhab `:3002`, Namaking) plus nginx are fine on about **4 GB RAM**. On **2 GB** they will likely swap or get killed.

ShopGhab is capped at **768 MB / 1 CPU** in `docker-compose.prod.yml` so it cannot starve the other sites. After ShopGhab is up, check leftover RAM on the server:

```bash
free -h; df -h; uptime
docker stats --no-stream
docker ps
```

If `free` shows less than about **1 GB unused**, lower the other sites' `mem_limit` the same way, or upgrade the VPS.
