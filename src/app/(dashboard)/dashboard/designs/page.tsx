import { createPageMetadata } from "@/lib/seo/metadata";
import DesignsDashboardClient from "./DesignsDashboardClient";

export const metadata = createPageMetadata({
  title: "طراحی‌های من",
  path: "/dashboard/designs",
});

export default function DesignsPage() {
  return <DesignsDashboardClient />;
}
