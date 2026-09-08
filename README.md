# Shopghab

Next.js storefront for [shopghab.ir](https://shopghab.ir) — custom and predesigned phone cases (print-site base).

## Local development

```bash
cp .env.example .env
# set NEXT_PUBLIC_SITE_URL, API_BASE_URL, NEXT_PUBLIC_API_TENANT_ID, admin credentials

npm install
npm run dev
```

App: http://localhost:3000

## Production deploy (shopghab.ir)

Pushes to `main` run [`.github/workflows/deploy-shopghab.yml`](.github/workflows/deploy-shopghab.yml): build on Actions, copy artifacts to the VPS, then `docker compose -f docker-compose.prod.yml` rebuild/restart.

See [`deploy/README.md`](deploy/README.md) for nginx/bootstrap details.

### GitHub secrets

| Secret | Purpose |
|--------|---------|
| `VPS_HOST` | VPS hostname or IP |
| `VPS_USER` | SSH user |
| `VPS_SSH_KEY` | Private SSH key |

Do **not** commit `.env` or live secrets.
