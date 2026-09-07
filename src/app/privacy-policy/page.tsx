import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";

const PATH = "/privacy-policy";
const TITLE = "حریم خصوصی";
const DESCRIPTION =
  "نحوه جمع‌آوری، استفاده و نگهداری اطلاعات کاربران در شاپ‌قاب.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["حریم خصوصی", "حفاظت اطلاعات کاربران", "Privacy Policy"],
});

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0c0a09] pt-24 text-white">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <p className="mt-6 max-w-4xl leading-8 text-zinc-300">
          اطلاعات موردنیاز برای ثبت سفارش، ارتباط و پیگیری دریافت می‌شود و صرفاً
          برای ارائه خدمات شاپ‌قاب استفاده خواهد شد. اطلاعات کاربران بدون مجوز به
          شخص ثالث منتقل نمی‌شود.
        </p>
      </PageShell>
    </main>
  );
}
