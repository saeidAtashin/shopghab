import { notFound } from "next/navigation";

import CatalogBreadcrumbs from "@/app/components/designs/CatalogBreadcrumbs";
import CatalogListing from "@/app/components/designs/CatalogListing";
import CatalogSectionPreview from "@/app/components/designs/CatalogSectionPreview";
import JsonLd from "@/app/components/seo/JsonLd";
import { parsePublicListingQuery, publicBrowseSections, queryPublicDesigns } from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
import { breadcrumbJsonLd, breadcrumbTrail } from "@/lib/seo/breadcrumbs";
import { collectionPageJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

const TITLE = "طرح‌های آماده قاب موبایل";
const DESCRIPTION =
  "فروش قاب موبایل با طرح‌های آماده در شاپ قاب — قابل چاپ روی آیفون، سامسونگ و شیائومی.";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; attr?: string; view?: string }>;
};

export async function generateMetadata({ searchParams }: Props) {
  const params = await searchParams;
  const query = parsePublicListingQuery(params);
  return createPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/designs",
    noIndex: query.noIndex || query.page > 1 || params.view === "all",
  });
}

export default async function DesignsGalleryPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = parsePublicListingQuery(params);
  const catalog = readCatalog();
  const showResults =
    params.view === "all" ||
    query.q.length > 0 ||
    query.attrs.length > 0 ||
    query.sort !== "featured" ||
    query.page > 1;
  const result = showResults
    ? queryPublicDesigns(catalog, {
        q: query.q,
        sort: query.sort,
        page: query.page,
        attributeValueIds: query.attrs,
      })
    : null;
  if (result && query.page > result.pageCount && result.total > 0) notFound();

  const sections = showResults ? [] : publicBrowseSections(catalog);
  const categoryNames = Object.fromEntries(catalog.categories.map((category) => [category.id, category.name]));
  const crumbs = breadcrumbTrail({ label: TITLE });
  const listed = result?.items ?? [];

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
          ...(listed.length > 0
            ? [
                itemListJsonLd({
                  name: TITLE,
                  path: "/designs",
                  items: listed.map((design) => ({
                    name: design.title,
                    url: `/designs/${design.slug}`,
                  })),
                }),
              ]
            : []),
        ]}
      />
      <CatalogBreadcrumbs items={crumbs} soft />
      <h1 className="mt-4 text-2xl font-black text-foreground sm:text-3xl">{TITLE}</h1>
      <p className="mt-2 max-w-2xl text-muted">{DESCRIPTION}</p>
      <div className="mt-6">
        {showResults ? (
          <CatalogListing
            designs={listed}
            categoryNames={categoryNames}
            basePath="/designs"
            q={query.q}
            sort={query.sort}
            page={result?.page ?? 1}
            pageSize={result?.pageSize ?? 24}
            pageCount={result?.pageCount ?? 1}
            total={result?.total ?? 0}
            attr={query.attr}
            viewAll={params.view === "all"}
          />
        ) : (
          <div className="space-y-10">
            {sections.map((section, index) => (
              <CatalogSectionPreview key={section.id} section={section} index={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
