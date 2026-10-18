import type { Metadata } from "next";

import GamingStatusScreen from "../components/pages/GamingStatusScreen";
import { createPageMetadata } from "../../lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "در حال ساخت",
  description:
    "این بخش شاپ قاب هنوز در حال ساخت است. به زودی در دسترس قرار می‌گیرد.",
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
      description="این بخش شاپ قاب به‌زودی آماده می‌شود. تا آن زمان می‌توانید طرح قاب را ببینید یا سفارش را پیگیری کنید."
      flavorText="GENERATING WORLD..."
      quickLinks={[
        { href: "/designs", label: "طرح‌های قاب" },
        { href: "/contact", label: "تماس با ما" },
        { href: "/tracking", label: "پیگیری سفارش" },
      ]}
    />
  );
}
