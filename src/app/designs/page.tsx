import { notFound } from "next/navigation";

import CatalogBreadcrumbs from "@/app/components/designs/CatalogBreadcrumbs";
import CatalogListing from "@/app/components/designs/CatalogListing";
import DesignTaxonomyShowcase from "@/app/components/home/taxonomy/DesignTaxonomyShowcase";
import JsonLd from "@/app/components/seo/JsonLd";
import {
  parsePublicListingQuery,
  queryPublicDesigns,
  rootCategories,
} from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
import { landingTaxonomy } from "@/lib/landing/taxonomy";
import { breadcrumbJsonLd, breadcrumbTrail } from "@/lib/seo/breadcrumbs";
import { collectionPageJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

const TITLE = "طراحی‌های آماده";
const DESCRIPTION =
  "مجموعه طراحی‌های از پیش ساخته‌شده برای قاب موبایل — روی هر مدل گوشی قابل استفاده";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; attr?: string }>;
};

export async function generateMetadata({ searchParams }: Props) {
  const query = parsePublicListingQuery(await searchParams);
  return createPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/designs",
    noIndex: query.noIndex || query.page > 1,
  });
}

export default async function DesignsGalleryPage({ searchParams }: Props) {
  const query = parsePublicListingQuery(await searchParams);
  const catalog = readCatalog();
  const result = queryPublicDesigns(catalog, {
    q: query.q,
    sort: query.sort,
    page: query.page,
    attributeValueId: query.attr || undefined,
  });
  const attributeName =
    catalog.attributeValues.find((value) => value.id === query.attr)?.name ?? "";
  if (query.page > result.pageCount && result.total > 0) notFound();

  const categories = rootCategories(catalog).map((category) => ({
    slug: category.slug,
    name: category.name,
  }));
  const categoryNames = Object.fromEntries(
    catalog.categories.map((category) => [category.id, category.name]),
  );
  const crumbs = breadcrumbTrail({ label: TITLE });

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: TITLE, description: DESCRIPTION, path: "/designs" }),
          collectionPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/designs",
          }),
          breadcrumbJsonLd(crumbs, "/designs"),
          itemListJsonLd({
            name: TITLE,
            path: "/designs",
            items: result.items.map((design) => ({
              name: design.title,
              url: `/designs/${design.slug}`,
            })),
          }),
        ]}
      />
      <main id="main" tabIndex={-1} className="min-h-screen bg-background px-4 pb-16 pt-24 text-foreground outline-none sm:px-6">
        <div className="mx-auto max-w-6xl">
          <CatalogBreadcrumbs items={crumbs} />
          <h1 className="mt-4 text-2xl font-black text-foreground sm:text-3xl">{TITLE}</h1>
          <p className="mt-2 max-w-2xl text-muted">{DESCRIPTION}</p>
          <div className="mt-10">
            <DesignTaxonomyShowcase taxonomy={landingTaxonomy(catalog)} />
            <CatalogListing
              designs={result.items}
              categoryNames={categoryNames}
              categories={categories}
              basePath="/designs"
              q={query.q}
              sort={query.sort}
              page={result.page}
              pageSize={result.pageSize}
              pageCount={result.pageCount}
              total={result.total}
              attr={query.attr}
              attrLabel={attributeName}
            />
          </div>
        </div>
      </main>
    </>
  );
}
