import { notFound, permanentRedirect } from "next/navigation";

import CatalogBreadcrumbs from "@/app/components/designs/CatalogBreadcrumbs";
import CatalogCategoryNav from "@/app/components/designs/CatalogCategoryNav";
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
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
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

  const childCards = publicCategoryCards(catalog, category.id);
  const searching = query.q.length > 0;
  const result = queryPublicDesigns(catalog, {
    ...query,
    categoryId: category.id,
    includeDescendants: childCards.length > 0 && !searching ? false : undefined,
  });
  if (query.page > result.pageCount && result.total > 0) notFound();

  const showResults = childCards.length === 0 || searching || result.total > 0;
  const parentName = category.parentId
    ? catalog.categories.find((item) => item.id === category.parentId)?.name
    : undefined;
  const title = categorySeoTitle(category);
  const description = categorySeoDescription(category, parentName);
  const path = `/designs/category/${category.slug}`;
  const ancestry = categoryChain(catalog, category);
  const root = ancestry[0];
  const chain = breadcrumbTrail(
    { label: "طراحی‌های آماده", href: "/designs" },
    ...ancestry.map((item, index) =>
      index === ancestry.length - 1
        ? { label: item.name }
        : { label: item.name, href: `/designs/category/${item.slug}` },
    ),
  );
  const categoryNames = Object.fromEntries(
    catalog.categories.map((item) => [item.id, item.name]),
  );
  const listed = showResults ? result.items : [];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path }),
          collectionPageJsonLd({ name: title, description, path }),
          breadcrumbJsonLd(chain, path),
          ...(listed.length > 0
            ? [
                itemListJsonLd({
                  name: title,
                  path,
                  items: listed.map((design) => ({
                    name: design.title,
                    url: `/designs/${design.slug}`,
                  })),
                }),
              ]
            : []),
        ]}
      />
      <main
        id="main"
        tabIndex={-1}
        className="min-h-screen bg-background px-4 pb-16 pt-24 text-foreground outline-none sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <CatalogBreadcrumbs items={chain} />
          <h1 className="mt-4 text-2xl font-black sm:text-3xl">{category.name}</h1>
          {category.description ? (
            <p className="mt-2 max-w-2xl leading-8 text-muted">{category.description}</p>
          ) : null}
          <div className="mt-8 space-y-10">
            <CatalogCategoryNav
              roots={publicCategoryCards(catalog, null)}
              inners={root ? publicCategoryCards(catalog, root.id) : []}
              activeRootSlug={root?.slug}
              activeChildSlug={ancestry[1]?.slug}
            />
            <CatalogListing
              designs={listed}
              categoryNames={categoryNames}
              basePath={path}
              q={query.q}
              sort={query.sort}
              page={result.page}
              pageSize={result.pageSize}
              pageCount={result.pageCount}
              total={showResults ? result.total : 0}
              showResults={showResults}
              heading={childCards.length > 0 && !searching && result.total > 0 ? "طرح‌های این دسته" : undefined}
            />
          </div>
        </div>
      </main>
    </>
  );
}
