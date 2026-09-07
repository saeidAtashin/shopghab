import JsonLd from "@/app/components/seo/JsonLd";
import PageShell from "@/app/components/seo/PageShell";
import CaseOrderForm from "@/app/components/orders/CaseOrderForm";
import { createPageMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";

const PATH = "/custom";
const TITLE = "طراحی سفارشی قاب";
const DESCRIPTION =
  "طرح دلخواه خود را برای قاب گوشی بسازید — مدل گوشی را انتخاب کنید، توضیح دهید یا تصویر مرجع آپلود کنید.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "قاب سفارشی",
    "طراحی قاب گوشی",
    "چاپ روی قاب",
    "قاب شخصی‌سازی",
    "شاپ قاب",
  ],
});

export default function CustomCasePage() {
  const schema = webPageJsonLd({
    name: TITLE,
    description: DESCRIPTION,
    path: PATH,
  });

  return (
    <main className="min-h-screen bg-[#0c0a09] pt-24 text-white">
      <JsonLd data={schema} />
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto max-w-3xl px-6 pb-16"
      >
        <p className="text-sm font-medium text-amber-400">سفارشی‌سازی</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">{TITLE}</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-400">{DESCRIPTION}</p>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            "انتخاب مدل گوشی",
            "توضیح یا آپلود طرح",
            "ثبت سفارش و پیگیری",
          ].map((step, index) => (
            <li
              key={step}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <span className="text-sm text-amber-400">مرحله {index + 1}</span>
              <p className="mt-2 font-bold text-white">{step}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <CaseOrderForm
            designType="custom"
            submitLabel="ثبت سفارش سفارشی"
          />
        </div>
      </PageShell>
    </main>
  );
}
