import { notFound, permanentRedirect } from "next/navigation";

import CatalogBreadcrumbs from "@/app/components/designs/CatalogBreadcrumbs";
import CatalogListing from "@/app/components/designs/CatalogListing";
import JsonLd from "@/app/components/seo/JsonLd";
import {
  categoryChain,
  categorySeoDescription,
  categorySeoTitle,
  findCategoryRedirect,
  isCategoryIndexable,
  parsePublicListingQuery,
  publicCategoryCards,
  queryPublicDesigns,
} from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
import { breadcrumbJsonLd, breadcrumbTrail } from "@/lib/seo/breadcrumbs";
import { collectionPageJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; sort?: string; page?: string; attr?: string; sub?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = parsePublicListingQuery(await searchParams);
  const catalog = readCatalog();
  const redirected = findCategoryRedirect(catalog, slug);
  if (redirected) permanentRedirect(`/designs/category/${redirected.slug}`);
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category || !isCategoryIndexable(catalog, category)) return {};

  const parentName = category.parentId
    ? catalog.categories.find((item) => item.id === category.parentId)?.name
    : undefined;
  return createPageMetadata({
    title: categorySeoTitle(category),
    description: categorySeoDescription(category, parentName),
    path: `/designs/category/${category.slug}`,
    noIndex: query.noIndex || query.page > 1 || !isCategoryIndexable(catalog, category),
    ogImage: category.coverImage || undefined,
  });
}

export default async function DesignCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = parsePublicListingQuery(await searchParams);
  const catalog = readCatalog();
  const redirected = findCategoryRedirect(catalog, slug);
  if (redirected) permanentRedirect(`/designs/category/${redirected.slug}`);
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category || !isCategoryIndexable(catalog, category)) notFound();

  const ancestry = categoryChain(catalog, category);
  const root = ancestry[0] ?? category;
  const innerCards = publicCategoryCards(catalog, root.id);
  const allowedSubs = new Set(innerCards.map((card) => card.slug));
  const querySubs = query.subs.filter((item) => allowedSubs.has(item));
  const selectedChildIds = querySubs.flatMap((item) => {
    const match = catalog.categories.find((categoryItem) => categoryItem.slug === item);
    return match ? [match.id] : [];
  });
  const result = queryPublicDesigns(catalog, {
    q: query.q,
    sort: query.sort,
    page: query.page,
    attributeValueIds: query.attrs,
    ...(selectedChildIds.length > 0 ? { categoryIds: selectedChildIds } : { categoryId: category.id }),
  });
  if (query.page > result.pageCount && result.total > 0) notFound();

  const parentName = category.parentId
    ? catalog.categories.find((item) => item.id === category.parentId)?.name
    : undefined;
  const title = categorySeoTitle(category);
  const description = categorySeoDescription(category, parentName);
  const path = `/designs/category/${category.slug}`;
  const chain = breadcrumbTrail(
    { label: "طراحی‌های آماده", href: "/designs" },
    ...ancestry.map((item, index) =>
      index === ancestry.length - 1
        ? { label: item.name }
        : { label: item.name, href: `/designs/category/${item.slug}` },
    ),
  );
  const categoryNames = Object.fromEntries(catalog.categories.map((item) => [item.id, item.name]));

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path }),
          collectionPageJsonLd({ name: title, description, path }),
          breadcrumbJsonLd(chain, path),
          ...(result.items.length > 0
            ? [
                itemListJsonLd({
                  name: title,
                  path,
                  items: result.items.map((design) => ({
                    name: design.title,
                    url: `/designs/${design.slug}`,
                  })),
                }),
              ]
            : []),
        ]}
      />
      <CatalogBreadcrumbs items={chain} soft />
      <h1 className="mt-4 text-2xl font-black sm:text-3xl">{category.name}</h1>
      {category.description ? (
        <p className="mt-2 max-w-2xl leading-8 text-muted">{category.description}</p>
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
          sub={querySubs.join(",")}
        />
      </div>
    </>
  );
}
