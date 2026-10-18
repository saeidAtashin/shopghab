import HomeCasePage from "./components/HomeCasePage";
import JsonLd from "./components/seo/JsonLd";
import { createPageMetadata } from "../lib/seo/metadata";
import { webPageJsonLd } from "../lib/seo/jsonld";
export const dynamic = "force-dynamic";

const HOME_TITLE = "فروش قاب موبایل | شاپ قاب";
const HOME_DESCRIPTION =
  "فروش قاب موبایل در شاپ قاب (shopghab): طراحی اختصاصی با انتخاب برند و مدل، چاپ با کیفیت و ارسال سریع به سراسر ایران.";

export const metadata = {
  ...createPageMetadata({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
    keywords: [
      "فروش قاب موبایل",
      "شاپ قاب",
      "shopghab",
      "قاب آیفون",
      "قاب سامسونگ",
      "قاب سفارشی",
    ],
  }),
  // Absolute so the layout template does not append the brand a second time.
  title: { absolute: HOME_TITLE },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: HOME_TITLE,
          description: HOME_DESCRIPTION,
          path: "/",
        })}
      />
      <HomeCasePage />
    </>
  );
}
