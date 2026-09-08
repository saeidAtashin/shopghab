import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";

const PATH = "/contact";
const TITLE = "تماس با ما";
const DESCRIPTION =
  "راه های ارتباطی کنسول ریپیر برای مشاوره، ثبت سفارش تعمیر و پیگیری درخواست.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["تماس با ما", "پشتیبانی تعمیر کنسول", "شماره تماس تعمیرات"],
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <p className="text-sm text-cyan-400">تلفن پشتیبانی</p>
            <p className="mt-3 text-lg text-foreground">09107701704</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <p className="text-sm text-cyan-400">آدرس</p>
            <p className="mt-3 text-lg text-foreground">
              تهران، توپخانه پاساژ لیلا طبقه 4 واحد 21
            </p>
          </div>
        </div>
      </PageShell>
    </main>
  );
}
