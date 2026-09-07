import { createPageMetadata } from "../../lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "پیگیری سفارش",
  description: "با کد رهگیری، وضعیت سفارش قاب خود را در شاپ‌قاب مشاهده کنید.",
  path: "/tracking",
  keywords: ["پیگیری سفارش قاب", "کد رهگیری شاپ قاب"],
});

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
