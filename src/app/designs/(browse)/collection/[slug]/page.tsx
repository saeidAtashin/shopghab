import { notFound, permanentRedirect } from "next/navigation";

import CatalogBreadcrumbs from "@/app/components/designs/CatalogBreadcrumbs";
import CatalogListing from "@/app/components/designs/CatalogListing";
import JsonLd from "@/app/components/seo/JsonLd";
import {
  cleanAttributeRedirect,
  collectionSeoDescription,
  collectionSeoTitle,
  isCollectionIndexable,
  parsePublicListingQuery,
  queryPublicDesigns,
} from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
import { FOLDED_OCCASION_SLUGS, OCCASION_COLLECTION_SLUG } from "@/lib/catalog/taxonomy";
import { breadcrumbJsonLd, breadcrumbTrail } from "@/lib/seo/breadcrumbs";
import { collectionPageJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; sort?: string; page?: string; attr?: string }>;
};

function redirectFoldedOccasion(slug: string) {
  if ((FOLDED_OCCASION_SLUGS as readonly string[]).includes(slug)) {
    permanentRedirect(`/designs/collection/${OCCASION_COLLECTION_SLUG}`);
  }
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  redirectFoldedOccasion(slug);
  const query = parsePublicListingQuery(await searchParams);
  const catalog = readCatalog();
  const collection = catalog.collections.find((item) => item.slug === slug);
  if (!collection || !isCollectionIndexable(catalog, collection)) return {};
  const attrTarget = cleanAttributeRedirect(catalog, query);
  if (attrTarget) permanentRedirect(attrTarget);

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
  redirectFoldedOccasion(slug);
  const query = parsePublicListingQuery(await searchParams);
  const catalog = readCatalog();
  const collection = catalog.collections.find((item) => item.slug === slug);
  if (!collection || !isCollectionIndexable(catalog, collection)) notFound();
  const attrTarget = cleanAttributeRedirect(catalog, query);
  if (attrTarget) permanentRedirect(attrTarget);

  const result = queryPublicDesigns(catalog, {
    q: query.q,
    sort: query.sort,
    page: query.page,
    attributeValueIds: query.attrs,
    collectionId: collection.id,
  });
  if (query.page > result.pageCount && result.total > 0) notFound();

  const title = collectionSeoTitle(collection);
  const description = collectionSeoDescription(collection);
  const path = `/designs/collection/${collection.slug}`;
  const crumbs = breadcrumbTrail(
    { label: "طراحی‌های آماده", href: "/designs" },
    { label: collection.name },
  );
  const categoryNames = Object.fromEntries(catalog.categories.map((item) => [item.id, item.name]));

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
      <CatalogBreadcrumbs items={crumbs} soft />
      <h1 className="mt-4 text-2xl font-black sm:text-3xl">{title}</h1>
      {collection.description ? (
        <p className="mt-2 max-w-2xl leading-8 text-muted">{collection.description}</p>
      ) : null}
      <div className="mt-6">
        <CatalogListing
          designs={result.items}
          categoryNames={categoryNames}
          basePath={path}
          q={query.q}
          sort={query.sort}
          page={result.page}
          pageSize={result.pageSize}
          pageCount={result.pageCount}
          total={result.total}
          attr={query.attr}
        />
      </div>
    </>
  );
}
