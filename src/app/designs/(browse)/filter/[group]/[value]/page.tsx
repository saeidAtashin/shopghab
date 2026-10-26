import { notFound, permanentRedirect } from "next/navigation";

import CatalogBreadcrumbs from "@/app/components/designs/CatalogBreadcrumbs";
import CatalogListing from "@/app/components/designs/CatalogListing";
import JsonLd from "@/app/components/seo/JsonLd";
import { parsePublicListingQuery, queryPublicDesigns, resolvePublicFilter } from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
import { suggestedFilterSeoDescription, suggestedFilterSeoTitle } from "@/lib/catalog/seo-copy";
import { breadcrumbJsonLd, breadcrumbTrail } from "@/lib/seo/breadcrumbs";
import { collectionPageJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ group: string; value: string }>;
  searchParams: Promise<{ q?: string; sort?: string; page?: string; attr?: string; sub?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { group: groupSlug, value: valueSlug } = await params;
  const query = parsePublicListingQuery(await searchParams);
  const catalog = readCatalog();
  const match = resolvePublicFilter(catalog, groupSlug, valueSlug);
  if (!match) return {};

  const path = `/designs/filter/${match.group.slug}/${match.value.slug}`;
  const extraAttrs = query.attrs.filter((id) => id !== match.value.id);
  if (
    query.attrs.length > 0 &&
    extraAttrs.length === 0 &&
    !query.q &&
    query.subs.length === 0 &&
    query.sort === "featured" &&
    query.page === 1
  ) {
    permanentRedirect(path);
  }
  const title = suggestedFilterSeoTitle(match.group.slug, match.value.name);
  const description = suggestedFilterSeoDescription(match.group.slug, match.value.name, match.value.slug);
  const noIndex =
    query.q.length > 0 ||
    extraAttrs.length > 0 ||
    query.subs.length > 0 ||
    query.sort !== "featured" ||
    query.page > 1;

  return createPageMetadata({
    title,
    description,
    path,
    noIndex,
  });
}

export default async function DesignFilterPage({ params, searchParams }: Props) {
  const { group: groupSlug, value: valueSlug } = await params;
  const query = parsePublicListingQuery(await searchParams);
  const catalog = readCatalog();
  const match = resolvePublicFilter(catalog, groupSlug, valueSlug);
  if (!match) notFound();

  const { group, value } = match;
  const path = `/designs/filter/${group.slug}/${value.slug}`;
  const extraAttrs = query.attrs.filter((id) => id !== value.id);
  if (
    query.attrs.length > 0 &&
    extraAttrs.length === 0 &&
    !query.q &&
    query.subs.length === 0 &&
    query.sort === "featured" &&
    query.page === 1
  ) {
    permanentRedirect(path);
  }

  const attributeValueIds = [...new Set([value.id, ...extraAttrs])];
  const result = queryPublicDesigns(catalog, {
    q: query.q,
    sort: query.sort,
    page: query.page,
    attributeValueIds,
  });
  if (query.page > result.pageCount && result.total > 0) notFound();

  const title = suggestedFilterSeoTitle(group.slug, value.name);
  const description = suggestedFilterSeoDescription(group.slug, value.name, value.slug);
  const crumbs = breadcrumbTrail(
    { label: "طراحی‌های آماده", href: "/designs" },
    { label: group.name },
    { label: value.name },
  );
  const categoryNames = Object.fromEntries(catalog.categories.map((item) => [item.id, item.name]));

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path }),
          collectionPageJsonLd({ name: title, description, path }),
          breadcrumbJsonLd(crumbs, path),
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
      <CatalogBreadcrumbs items={crumbs} soft />
      <h1 className="mt-4 text-2xl font-black sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl leading-8 text-muted">{description}</p>
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
          attr={extraAttrs.join(",")}
          sub={query.subs.join(",")}
        />
      </div>
    </>
  );
}
