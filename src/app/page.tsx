import HomePage from "./components/HomePage";
import JsonLd from "./components/seo/JsonLd";
import { createPageMetadata } from "../lib/seo/metadata";
import { webPageJsonLd } from "../lib/seo/jsonld";

const HOME_TITLE = "Shopghab | شاپ‌قاب — قاب گوشی آماده و سفارشی";
const HOME_DESCRIPTION =
  "شاپ‌قاب (Shopghab) فروشگاه قاب گوشی آماده و طراحی سفارشی با چاپ باکیفیت برای آیفون، سامسونگ و شیائومی.";

export const metadata = createPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  keywords: [
    "Shopghab",
    "شاپ‌قاب",
    "قاب گوشی",
    "خرید قاب گوشی",
    "قاب سفارشی",
    "قاب آیفون",
    "قاب سامسونگ",
  ],
});

const HOME_SCHEMA = webPageJsonLd({
  name: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd data={HOME_SCHEMA} />
      <HomePage />
    </>
  );
}
