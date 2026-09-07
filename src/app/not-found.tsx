import type { Metadata } from "next";

import GamingStatusScreen from "./components/pages/GamingStatusScreen";
import { createPageMetadata } from "../lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "صفحه پیدا نشد",
  description:
    "این آدرس در نقشه بازی وجود ندارد. به صفحه اصلی فیکس‌بازی برگردید یا درخواست تعمیر ثبت کنید.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <GamingStatusScreen
      variant="not-found"
      code="404"
      hudLabel="▮ GAME OVER ▮"
      title="مرحله‌ای پیدا نشد"
      description="انگار این مسیر از نقشه حذف شده، یا هرگز وجود نداشته.   نگران نباش — می‌توانی به خانه برگردی و دوباره شروع کنی. "
      flavorText="YOU HAVE DIED · بازگشت به آخرین چک‌پوینت"
      quickLinks={[
        { href: "/repair", label: "ثبت درخواست تعمیر" },
        { href: "/services", label: "لیست خدمات" },
      ]}
    />
  );
}
