import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "نتیجه پرداخت",
  description: "وضعیت پرداخت سفارش قاب موبایل در شاپ قاب.",
  path: "/payment/callback",
  noIndex: true,
});

export default function PaymentCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
