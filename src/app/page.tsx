import HomeCasePage from "./components/HomeCasePage";
import JsonLd from "./components/seo/JsonLd";
import { createPageMetadata } from "../lib/seo/metadata";
import { webPageJsonLd } from "../lib/seo/jsonld";

const HOME_TITLE = "طراحی و خرید قاب موبایل اختصاصی";
const HOME_DESCRIPTION =
  "قاب موبایل خودت را طراحی کن — انتخاب برند و مدل، افزودن متن و استیکر، پیش‌نمایش و خرید آنلاین با ارسال سریع.";

export const metadata = createPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  keywords: ["قاب موبایل", "طراحی قاب", "قاب آیفون", "قاب سامسونگ", "قاب سفارشی"],
});

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
