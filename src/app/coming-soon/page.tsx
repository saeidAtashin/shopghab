import type { Metadata } from "next";

import GamingStatusScreen from "../components/pages/GamingStatusScreen";
import { createPageMetadata } from "../../lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "در حال ساخت",
  description:
    "این بخش سایت فیکس‌بازی هنوز در حال ساخت است. به زودی در دسترس قرار می‌گیرد.",
  path: "/coming-soon",
  noIndex: true,
});

export default function ComingSoonPage() {
  return (
    <GamingStatusScreen
      variant="construction"
      code="WIP"
      hudLabel="▮ BUILD MODE ▮"
      title="این بخش در حال ساخت است"
      description="تیم فیکس‌بازی روی این مرحله کار می‌کند یا آپدیت کردن یک دنیای آنلاین. به زودی آماده می‌شود."
      flavorText="GENERATING WORLD..."
      quickLinks={[
        { href: "/repair", label: "ثبت درخواست تعمیر" },
        { href: "/services", label: "خدمات فعال" },
        { href: "/tracking", label: "پیگیری سفارش" },
      ]}
    />
  );
}
