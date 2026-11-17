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

Design names and metadata on production come from the **VPS** catalog, not from a plain deploy of your local `data/design-catalog.json`. Edit them in the production admin UI, or see **Changing designs on production** in [`deploy/README.md`](deploy/README.md) for the rare one-time catalog overwrite (`deploy/push-local-catalog.sh`).

Do **not** commit `.env` or live secrets.


<!-- 
==========
کلا قسمت پروفایل تکمیل تر بشه و افزودن به علاقه مندی هم اضافه بشه اگر وارد حساب کاربری شده بود.
==========
و بخش قبلا مشاهده شده یا علاقه مندی هم اضافه شه که قابل حذف کردن هم باشه.
به شکل کروسل.
==========
یکم توی صفحه ادیتور قاب رو از اطراف فاصله بده نچسبه.
وقتی میچرخونه هر ۴۵ درجه یکم بچسبه، متن رو هم وقتی از گوشه scale میکنه aspect ratio بهم نریزه.
نوار ابزار بالای صفحه ادیتور رو تک خطی کن که دو سطر نشه، اگر لازم بود اسکرول بخوره.
با دو انگشت هم صفحه ادیتور کار کنه، روتیت و زوم و اینا انجام شه.
یه گزینه تغییر رنگ پس زمینه اضافه بشه، و بتونه کالر پیکر هم داشته باشه از توی طرح هم رنگ انتخاب کنه با یه حالت زوم مناسب حرفه ای. همچنین بتونه از پترن ها هم استفاده کنه به عنوان بک گراند.
==========
; به عنوان ادمین که وارد میشم، توی صفحه طرح میخوام عکس های رند شده و اصلی رو بیاره و بتونم جای عکس‌های رندر شده توی هر psd رو تغییر بدم، همچنین میخوام بتونم محصول رو کپی کنم و عکس رو ادیت کنم با امکانات ادیتور و ذخیره کنم به عنوان طرح جدید.
==========
اضافه شدن بخش طراحی اختصاصی شاپ قاب
==========
in circle of categories and in its list of desktop should show عکس خام of its categories (not mockup) and in full size of its card

; make navbar and footer of mobile apply for all pages like landing
make side toolbar in /designs look like landing but add a icon for categories too. 

; in /designs/category/general ui of رنگ‌ طرح is not good in mobile also in /designs/category/general should be scroll show next page too.

while scrolling for each time that is fetching new designs, should show a list of پرفروش ترین/ پربازدیدترین / یا 4 تا از یکی از کتگوری ها یا فیلتر ها رو نمایش بده به شکل   -->

<!-- 
Best next plan (do in this order)
Week 1–2 — highest ROI
Slug cleanup + 301 redirects for stock/hash design URLs → Persian-friendly Latin slugs
Enrich design PDPs: 2–3 unique FA sentences, mini-FAQ, links to /phones/*, /create, parent category
Fix model hub ItemList (cap to ~8–12 designs) + soften noIndex to still follow
Pass real price into Product Offer on designs (no fake ratings)
Submit sitemap in Google Search Console and spot-check sample URLs
Month 1 — growth
6–10 Persian guide pages (model + material + gift clusters) linking into categories/phones
Stronger internal linking (Xiaomi/Huawei, sibling categories, category → model CTAs)
Local trust: Instagram/Telegram sameAs, richer /about-us, Enamad/NAP consistency
GA4 ecommerce events (view_item, begin_checkout, purchase)
Later
Quality gate before indexing thin designs
Deeper child-category copy for winners only
Real review schema only when you have real reviews
What you should personally do (not just code)
Claim/verify Search Console for shopghab.ir and watch queries for قاب آیفون, قاب اختصاصی, category themes
Prioritize top 50–100 bestsellers for unique titles/descriptions first (don’t rewrite all 638 at once)
Add real Instagram/Telegram + process photos (print, packaging, shop) — Iran trust signals matter
Keep filling empty high-intent themes before reactivating them (don’t index empty again)
If you want me to execute next, the best single follow-up sprint is: slug redirects + design PDP enrichment + model JSON-LD fix.
 -->
