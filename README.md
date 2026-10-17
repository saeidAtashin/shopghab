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

Pushes to `main` run [`.github/workflows/deploy-shopghab.yml`](.github/workflows/deploy-shopghab.yml): build on Actions and publish the Next.js output on the `deploy-latest` release. The VPS pulls that release; Actions does not SSH in.

See [`deploy/README.md`](deploy/README.md) for the one-time updater install, nginx, and bootstrap.

Do **not** commit `.env` or live secrets.
