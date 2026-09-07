import HomePage from "./components/HomePage";
import JsonLd from "./components/seo/JsonLd";
import { createPageMetadata } from "../lib/seo/metadata";
import { webPageJsonLd } from "../lib/seo/jsonld";

const HOME_TITLE = "FixBazi | فیکس‌بازی — تعمیر تخصصی PS5، PS4 و Xbox";
const HOME_DESCRIPTION =
  "FixBazi (فیکس‌بازی) — تعمیر تخصصی پلی‌استیشن 5، PS4، Xbox و دسته بازی با گارانتی، عیب‌یابی دقیق و تحویل سریع. ثبت سفارش آنلاین و پیگیری وضعیت تعمیر.";

export const metadata = createPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  keywords: [
    "FixBazi",
    "فیکس‌بازی",
    "تعمیر کنسول",
    "تعمیر ps5",
    "تعمیر ps4",
    "تعمیر xbox",
    "تعمیر hdmi کنسول",
    "تعمیر دسته ps5",
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
