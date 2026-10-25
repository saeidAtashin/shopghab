import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import HomeBenefits from "@/app/components/home/HomeBenefits";
import HomeCategoryMosaic from "@/app/components/home/HomeCategoryMosaic";
import HomeDiscovery from "@/app/components/home/HomeDiscovery";
import HomeSpotlight from "@/app/components/home/HomeSpotlight";
import HomeHero from "@/app/components/home/hero/HomeHero";
import {
  getCaseTotalPrice,
  getCaseTypeBySlug,
  getModelBySlug,
  SELECTABLE_CASE_TYPE_SLUG,
} from "@/lib/cases/brands.static";
import { getCaseTemplateBySlug } from "@/lib/cases/templates.static";
import {
  parsePublicListingQuery,
  publicBrowseShell,
  publicPickCards,
  queryPublicDesigns,
} from "@/lib/catalog/logic";
import type { DesignCatalog } from "@/lib/catalog/schema";
import { readCatalog } from "@/lib/catalog/store";
import { designedAssetUrl } from "@/lib/designed-assets";
import { selectLandingItems } from "@/lib/landing/sections";
import { readLandingSections } from "@/lib/landing/store";
import { landingTaxonomy, type TaxonomyCard } from "@/lib/landing/taxonomy";
import { formatToman } from "@/lib/shop/format";

const POPULAR_MODELS = [
  { brandSlug: "apple", modelSlug: "iphone-16-pro" },
  { brandSlug: "apple", modelSlug: "iphone-14-pro" },
  { brandSlug: "samsung", modelSlug: "galaxy-s25-ultra" },
  { brandSlug: "samsung", modelSlug: "galaxy-a55" },
  { brandSlug: "xiaomi", modelSlug: "redmi-note-14-pro" },
  { brandSlug: "huawei", modelSlug: "pura-70-pro" },
] as const;

const HOME_PAGE_SIZE = 8;
const MOSAIC_LIMIT = 6;

type SearchParams = {
  q?: string;
  sort?: string;
  page?: string;
  attr?: string;
  sub?: string;
};

function printablePrice(): string {
  const caseType = getCaseTypeBySlug(SELECTABLE_CASE_TYPE_SLUG);
  if (!caseType) return "";
  return formatToman(getCaseTotalPrice(caseType, true));
}

function collectionRail(catalog: DesignCatalog) {
  for (const slug of ["bestsellers", "popular"] as const) {
    const collection = catalog.collections.find((item) => item.slug === slug);
    if (!collection) continue;
    const result = queryPublicDesigns(catalog, {
      collectionId: collection.id,
      sort: "featured",
      page: 1,
      pageSize: 4,
    });
    if (result.items.length === 0) continue;
    return {
      title: collection.name,
      href: `/designs/collection/${collection.slug}`,
      items: result.items,
    };
  }
  return null;
}

function primaryCategory(categoryIds: string[], names: Record<string, string>): string | undefined {
  for (const id of categoryIds) {
    const name = names[id];
    if (name) return name;
  }
  return undefined;
}

export default function HomeCasePage({ searchParams }: { searchParams: SearchParams }) {
  const query = parsePublicListingQuery(searchParams);
  const catalog = readCatalog();
  const result = queryPublicDesigns(catalog, {
    q: query.q,
    sort: query.sort,
    page: query.page,
    pageSize: HOME_PAGE_SIZE,
    attributeValueIds: query.attrs,
  });
  if (query.page > result.pageCount && result.total > 0) notFound();

  const landing = readLandingSections();
  const taxonomy = landingTaxonomy(
    catalog,
    {
      categories: landing.categories.banners,
      features: landing.features.banners,
      collections: landing.collections.banners,
    },
    { publicOnly: true },
  );
  const categoryItems = landing.categories.visible
    ? selectLandingItems(taxonomy.categories, landing.categories.itemIds)
    : [];
  const collectionItems = landing.collections.visible
    ? selectLandingItems(taxonomy.collections, landing.collections.itemIds)
    : [];
  const picks = publicPickCards(catalog);
  const categoryNames = Object.fromEntries(catalog.categories.map((category) => [category.id, category.name]));
  const priceLabel = printablePrice();
  const featured = queryPublicDesigns(catalog, { sort: "featured", page: 1, pageSize: 1 }).items[0];
  const template = featured ? (getCaseTemplateBySlug(featured.templateSlug) ?? null) : null;
  const models = POPULAR_MODELS.flatMap(({ brandSlug, modelSlug }) => {
    const model = getModelBySlug(brandSlug, modelSlug);
    if (!model) return [];
    return [{ name: model.name, href: `/phones/${model.brandSlug}/${model.slug}` }];
  });

  const storyCards: TaxonomyCard[] = [];
  const seen = new Set<string>();
  for (const card of collectionItems) {
    if (seen.has(card.href)) continue;
    seen.add(card.href);
    storyCards.push(card);
  }
  for (const pick of picks) {
    if (seen.has(pick.href)) continue;
    seen.add(pick.href);
    storyCards.push({
      id: pick.slug,
      title: pick.title,
      description: "",
      href: pick.href,
      image: pick.image,
      count: 0,
      chips: [],
    });
  }

  return (
    <main id="main" tabIndex={-1} className="home-storefront min-h-screen px-4 pb-16 pt-24 outline-none sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
          <HomeHero className="xl:order-3 xl:min-w-0 xl:flex-[1.45]" />
          {categoryItems.length > 0 ? (
            <HomeCategoryMosaic
              items={categoryItems.slice(0, MOSAIC_LIMIT)}
              hasMore={categoryItems.length > MOSAIC_LIMIT}
              className="xl:order-2 xl:w-[22rem] xl:shrink-0"
            />
          ) : null}
          {featured ? (
            <HomeSpotlight
              className="xl:order-1 xl:w-[17.5rem] xl:shrink-0"
              slug={featured.slug}
              title={featured.title}
              image={featured.imagePath || featured.thumbnailPath}
              alt={featured.alt}
              categoryName={primaryCategory(featured.categoryIds, categoryNames)}
              colors={featured.colors}
              priceLabel={priceLabel}
              template={template}
            />
          ) : null}
        </div>

        <HomeBenefits />

        <HomeDiscovery
          shell={publicBrowseShell(catalog)}
          query={{ q: query.q, sort: query.sort, attrs: query.attrs, page: query.page }}
          designs={result.items}
          categoryNames={categoryNames}
          priceLabel={priceLabel}
          total={result.total}
          pageSize={result.pageSize}
          pageCount={result.pageCount}
          models={models}
          rail={collectionRail(catalog)}
        />

        {storyCards.length > 0 ? (
          <section aria-label="کالکشن‌ها" className="pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground">کالکشن‌ها</h2>
              <Link href="/designs" className="text-sm font-bold text-[#C4C0FF] hover:underline">
                مشاهده همه
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {storyCards.map((card) => (
                <Link
                  key={card.id}
                  href={card.href}
                  className="flex min-w-[15rem] items-center gap-3 rounded-2xl border border-border bg-card p-2 transition hover:border-[#5145FF]/45"
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                    {card.image ? (
                      <Image src={designedAssetUrl(card.image)} alt="" fill sizes="64px" className="object-cover" />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-sm font-bold text-foreground">{card.title}</span>
                    {card.count > 0 ? (
                      <span className="mt-1 block text-xs text-muted">
                        {card.count.toLocaleString("fa-IR")} طرح
                      </span>
                    ) : null}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
