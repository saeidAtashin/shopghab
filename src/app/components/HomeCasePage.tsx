import HomeBenefits from "@/app/components/home/HomeBenefits";
import HomeCategoryMosaic from "@/app/components/home/HomeCategoryMosaic";
import HomeCollections from "@/app/components/home/HomeCollections";
import HomeDiscovery from "@/app/components/home/HomeDiscovery";
import HomeMobileDock from "@/app/components/home/HomeMobileDock";
import HomeHero from "@/app/components/home/hero/HomeHero";
import NavSearch from "@/app/components/layout/nav/NavSearch";
import { PHONE_BRANDS, getCaseTotalPrice, getCaseTypeBySlug, SELECTABLE_CASE_TYPE_SLUG } from "@/lib/cases/brands.static";
import {
  parsePublicListingQuery,
  publicBrowseShell,
  publicPickCards,
  queryPublicDesigns,
} from "@/lib/catalog/logic";
import type { DesignCatalog } from "@/lib/catalog/schema";
import { readCatalog } from "@/lib/catalog/store";
import { selectLandingItems } from "@/lib/landing/sections";
import { readLandingSections } from "@/lib/landing/store";
import { landingTaxonomy, type TaxonomyCard } from "@/lib/landing/taxonomy";
import { formatToman } from "@/lib/shop/format";

const BRAND_LABELS: Record<string, string> = {
  apple: "iPhone",
  samsung: "Samsung",
  xiaomi: "Xiaomi",
  huawei: "Huawei",
  other: "Other",
};

const HOME_PAGE_SIZE = 24;
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
      pageSize: 8,
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

export default function HomeCasePage({ searchParams }: { searchParams: SearchParams }) {
  const query = parsePublicListingQuery(searchParams);
  const catalog = readCatalog();
  const result = queryPublicDesigns(catalog, {
    q: query.q,
    sort: query.sort,
    page: 1,
    pageSize: HOME_PAGE_SIZE,
    attributeValueIds: query.attrs,
  });

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
  const brands = PHONE_BRANDS.map((brand) => ({
    name: BRAND_LABELS[brand.slug] ?? brand.nameEn,
    href: `/create/${brand.slug}`,
  }));

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
  const featured = storyCards[0];

  return (
    <main
      id="main"
      tabIndex={-1}
      className="home-storefront min-h-screen overflow-x-clip px-4 pb-28 pt-16 outline-none sm:px-6 xl:pb-16 xl:pt-24"
    >
      <div className="mx-auto flex max-w-[90rem] flex-col gap-4">
        <NavSearch placeholder="جستجو در طرح‌ها..." className="xl:hidden" />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
          <HomeHero className="xl:order-2 xl:min-w-0 xl:flex-1" />
          {categoryItems.length > 0 ? (
            <HomeCategoryMosaic
              items={categoryItems.slice(0, MOSAIC_LIMIT)}
              className="xl:order-1 xl:w-[28rem] xl:shrink-0"
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
          pageCount={result.pageCount}
          brands={brands}
          featured={
            featured
              ? {
                  title: featured.title,
                  href: featured.href,
                  image: featured.image,
                  description: featured.description || featured.title,
                }
              : null
          }
          rail={collectionRail(catalog)}
        />

        <HomeCollections cards={storyCards} />
      </div>
      <HomeMobileDock />
    </main>
  );
}
