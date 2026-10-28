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

<!-- in circle of categories and in its list of desktop should show عکس خام of its categories (not mockup) and in full size of its card -->


<!-- make navbar and footer of mobile apply for all pages like landing -->
<!-- make side toolbar in /designs look like landing but add a icon for categories too.  -->

<!-- in /designs/category/general ui of رنگ‌ طرح is not good in mobile also in /designs/category/general should be scroll show next page too. -->

<!-- while scrolling for each time that is fetching new designs, should show a list of پرفروش ترین/ پربازدیدترین / یا 4 تا از یکی از کتگوری ها یا فیلتر ها رو نمایش بده به شکل  -->
