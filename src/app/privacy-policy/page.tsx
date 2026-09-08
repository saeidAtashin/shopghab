import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";

const PATH = "/privacy-policy";
const TITLE = "حریم خصوصی";
const DESCRIPTION =
  "نحوه جمع آوری، استفاده و نگهداری اطلاعات کاربران در کنسول ریپیر.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["حریم خصوصی", "حفاظت اطلاعات کاربران", "Privacy Policy"],
});

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <p className="mt-6 max-w-4xl leading-8 text-muted">
          اطلاعات مورد نیاز برای ارائه خدمات، ثبت سفارش و ارتباط با مشتریان
          دریافت می شود و صرفا برای بهبود تجربه کاربری و انجام فرآیند تعمیرات
          استفاده خواهد شد. اطلاعات کاربران بدون مجوز به شخص ثالث منتقل نمی شود.
        </p>
      </PageShell>
    </main>
  );
}
