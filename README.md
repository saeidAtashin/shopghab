# Shopghab

Next.js storefront for [shopghab.ir](https://shopghab.ir) — predesigned and custom phone cases.

## Local development

```bash
cp shopghab.env.example shopghab.env
# fill AUTH_SECRET and optional IPPanel keys

npm install
npm run db:migrate   # or: npx prisma migrate deploy
npm run dev
```

App: http://localhost:3000

## Dependencies

Prisma + SQLite are **required** for case orders and OTP user accounts. Unused FixBazi-era packages (Swagger, Lottie, themes, tilt, Zod/RHF) were removed.

## Production deploy (shopghab.ir)

Merges to `main` trigger GitHub Actions, which SSH into the VPS, pull the repo, and replace the Docker container.

### One-time server cutover

1. On the VPS (SSH as deploy user):

```bash
git clone https://github.com/saeidAtashin/shopghab.git /root/shopghab
cd /root/shopghab
cp shopghab.env.example shopghab.env
# Edit shopghab.env: AUTH_SECRET, IPPanel keys, DATABASE_URL=file:/data/app.db
```

2. **Stop and remove the old shopghab.ir app** (whatever currently serves the domain — old container, PM2 process, or previous compose stack). Free host port `3000` (or update [`docker-compose.yml`](docker-compose.yml) / reverse proxy to match).

3. First start of this project:

```bash
cd /root/shopghab
docker compose up -d --build
```

4. Point nginx/Caddy (if used) at `127.0.0.1:3000` for `shopghab.ir`, then reload the proxy.

5. Confirm https://shopghab.ir loads the new Shopghab UI.

### GitHub secrets

In the repo → Settings → Secrets and variables → Actions:

| Secret | Purpose |
|--------|---------|
| `DEPLOY_HOST` | VPS hostname or IP |
| `DEPLOY_USER` | SSH user (e.g. `root`) |
| `DEPLOY_SSH_KEY` | Private SSH key for that user |
| `DEPLOY_PATH` | Optional; default `/root/shopghab` |

Do **not** commit `shopghab.env`. Keep production secrets only on the server (and in your password manager).

### After cutover

Every push/merge to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

- `git reset --hard origin/main` in `DEPLOY_PATH`
- `docker compose down` then `docker compose up -d --build --force-recreate`

SQLite data lives in the Docker volume `shopghab-data` (`/data/app.db` in the container). Uploads use volume `shopghab-uploads`.
