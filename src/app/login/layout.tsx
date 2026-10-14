import { createPageMetadata } from "../../lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "ورود",
  description: "ورود به حساب کاربری شاپ‌قاب برای پیگیری سفارش قاب موبایل.",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
