import type { Metadata } from "next";

import HomeCasePage from "./components/HomeCasePage";
import JsonLd from "./components/seo/JsonLd";
import { parsePublicListingQuery } from "../lib/catalog/logic";
import { createPageMetadata } from "../lib/seo/metadata";
import { webPageJsonLd } from "../lib/seo/jsonld";

export const dynamic = "force-dynamic";

const HOME_TITLE = "فروش قاب موبایل | شاپ قاب";
const HOME_DESCRIPTION =
  "فروش قاب موبایل در شاپ قاب (shopghab): طراحی اختصاصی با انتخاب برند و مدل، چاپ با کیفیت و ارسال سریع به سراسر ایران.";

const KEYWORDS = [
  "فروش قاب موبایل",
  "شاپ قاب",
  "shopghab",
  "قاب آیفون",
  "قاب سامسونگ",
  "قاب سفارشی",
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
