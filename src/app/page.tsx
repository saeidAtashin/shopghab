import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import HomeCasePage from "./components/HomeCasePage";
import JsonLd from "./components/seo/JsonLd";
import { cleanAttributeRedirect, parsePublicListingQuery } from "../lib/catalog/logic";
import { readCatalog } from "../lib/catalog/store";
import { createPageMetadata } from "../lib/seo/metadata";
import { webPageJsonLd } from "../lib/seo/jsonld";

export const dynamic = "force-dynamic";

const HOME_TITLE = "خرید قاب موبایل و قاب اختصاصی | شاپ قاب";
const HOME_DESCRIPTION =
  "خرید قاب موبایل، قاب گوشی و قاب تلفن همراه در شاپ قاب. خرید قاب اختصاصی یا قاب خاص با انتخاب برند و مدل، چاپ با کیفیت و ارسال به سراسر ایران.";

const KEYWORDS = [
  "خرید قاب موبایل",
  "خرید قاب اختصاصی",
  "خرید قاب خاص",
  "خرید قاب تلفن همراه",
  "قاب گوشی",
  "قاب موبایل",
  "شاپ قاب",
  "shopghab",
];

type SearchParams = {
  q?: string;
  sort?: string;
  page?: string;
  attr?: string;
  sub?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const query = parsePublicListingQuery(params);
  const target = cleanAttributeRedirect(readCatalog(), query);
  if (target) permanentRedirect(target);
  return {
    ...createPageMetadata({
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      path: "/",
      noIndex: query.noIndex || query.page > 1,
      keywords: KEYWORDS,
    }),
    title: { absolute: HOME_TITLE },
  };
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const target = cleanAttributeRedirect(readCatalog(), parsePublicListingQuery(params));
  if (target) permanentRedirect(target);
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: HOME_TITLE,
          description: HOME_DESCRIPTION,
          path: "/",
        })}
      />
      <HomeCasePage searchParams={params} />
    </>
  );
}
