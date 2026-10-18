import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_BRAND } from "@/lib/seo/site";

const PATH = "/privacy-policy";
const TITLE = "حریم خصوصی";
const DESCRIPTION =
  "نحوه جمع‌آوری و استفاده از اطلاعات سفارش و حساب کاربری در شاپ قاب.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["حریم خصوصی شاپ قاب", "اطلاعات سفارش"],
});

export default function PrivacyPolicyPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 text-foreground outline-none">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <p className="mt-6 max-w-4xl leading-8 text-muted">
          {SITE_BRAND} نام، شماره تماس و آدرس را فقط برای ثبت سفارش، چاپ قاب،
          ارسال و پشتیبانی دریافت می‌کند. این اطلاعات برای تبلیغ به دیگران فروخته
          نمی‌شود و بدون اجازه شما به شخص ثالث منتقل نمی‌شود، مگر جایی که قانون
          یا انجام خود سفارش (مثل شرکت پست) لازم باشد.
        </p>
      </PageShell>
    </main>
  );
}
