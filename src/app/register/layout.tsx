import { createPageMetadata } from "../../lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "ثبت‌نام",
  description: "ایجاد حساب کاربری در مرکز تعمیر کنسول.",
  path: "/register",
  noIndex: true,
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
