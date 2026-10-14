import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  SITE_ADDRESS_DISPLAY,
  SITE_PHONE,
  SITE_PHONE_DISPLAY,
} from "@/lib/seo/site";

const PATH = "/contact";
const TITLE = "تماس با ما";
const DESCRIPTION =
  "تلفن و آدرس شاپ‌قاب برای سفارش قاب موبایل، پیگیری چاپ و پرسش درباره ارسال.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["تماس با شاپ‌قاب", "پشتیبانی سفارش قاب", "آدرس شاپ‌قاب"],
});

export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 text-foreground outline-none">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <p className="text-sm text-cyan-400">تلفن پشتیبانی</p>
            <a href={`tel:${SITE_PHONE}`} className="mt-3 block text-lg text-foreground">
              {SITE_PHONE_DISPLAY}
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <p className="text-sm text-cyan-400">آدرس</p>
            <p className="mt-3 text-lg text-foreground">{SITE_ADDRESS_DISPLAY}</p>
          </div>
        </div>
      </PageShell>
    </main>
  );
}
