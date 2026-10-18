import { notFound } from "next/navigation";

import CatalogBreadcrumbs from "@/app/components/designs/CatalogBreadcrumbs";
import CatalogListing from "@/app/components/designs/CatalogListing";
import JsonLd from "@/app/components/seo/JsonLd";
import {
  collectionSeoDescription,
  collectionSeoTitle,
  isCollectionIndexable,
  parsePublicListingQuery,
  queryPublicDesigns,
  rootCategories,
} from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
import { breadcrumbJsonLd, breadcrumbTrail } from "@/lib/seo/breadcrumbs";
import { collectionPageJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = parsePublicListingQuery(await searchParams);
  const catalog = readCatalog();
  const collection = catalog.collections.find((item) => item.slug === slug);
  if (!collection || collection.status !== "active") return {};

  return createPageMetadata({
    title: collectionSeoTitle(collection),
    description: collectionSeoDescription(collection),
    path: `/designs/collection/${collection.slug}`,
    noIndex: query.noIndex || query.page > 1 || !isCollectionIndexable(catalog, collection),
    ogImage: collection.coverImage || undefined,
  });
}

export default async function DesignCollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = parsePublicListingQuery(await searchParams);
  const catalog = readCatalog();
  const collection = catalog.collections.find((item) => item.slug === slug);
  if (!collection || collection.status !== "active") notFound();

  const result = queryPublicDesigns(catalog, { ...query, collectionId: collection.id });
  if (query.page > result.pageCount && result.total > 0) notFound();

  const title = collectionSeoTitle(collection);
  const description = collectionSeoDescription(collection);
  const path = `/designs/collection/${collection.slug}`;
  const crumbs = breadcrumbTrail(
    { label: "طراحی‌های آماده", href: "/designs" },
    { label: collection.name },
  );
  const categories = rootCategories(catalog).map((item) => ({
    slug: item.slug,
    name: item.name,
  }));
  const categoryNames = Object.fromEntries(
    catalog.categories.map((item) => [item.id, item.name]),
  );

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path }),
          collectionPageJsonLd({ name: title, description, path }),
          breadcrumbJsonLd(crumbs, path),
          itemListJsonLd({
            name: title,
            path,
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
          <h1 className="mt-4 text-2xl font-black sm:text-3xl">{collection.name}</h1>
          {collection.description ? (
            <p className="mt-2 max-w-2xl leading-8 text-muted">{collection.description}</p>
          ) : null}
          <div className="mt-8">
            <CatalogListing
              designs={result.items}
              categoryNames={categoryNames}
              categories={categories}
              basePath={path}
              q={query.q}
              sort={query.sort}
              page={result.page}
              pageSize={result.pageSize}
              pageCount={result.pageCount}
              total={result.total}
            />
          </div>
        </div>
      </main>
    </>
  );
}
