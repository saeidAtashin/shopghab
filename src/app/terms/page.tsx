import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_BRAND } from "@/lib/seo/site";

const PATH = "/terms";
const TITLE = "قوانین و شرایط";
const DESCRIPTION =
  "شرایط سفارش، چاپ، ارسال و بازگشت قاب موبایل در شاپ‌قاب.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["قوانین شاپ‌قاب", "شرایط سفارش قاب", "بازگشت کالا"],
});

export default function TermsPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 text-foreground outline-none">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <p className="mt-6 max-w-4xl leading-8 text-muted">
          ثبت سفارش در {SITE_BRAND} به معنی پذیرش طرح تأییدشده، زمان چاپ، هزینه
          ارسال و شرایط تحویل است. طرح سفارشی پس از تأیید نهایی چاپ می‌شود.
          درخواست بازگشت تا ۷ روز پس از تحویل، در صورتی که قاب استفاده نشده باشد،
          بررسی می‌شود.
        </p>
      </PageShell>
    </main>
  );
}
