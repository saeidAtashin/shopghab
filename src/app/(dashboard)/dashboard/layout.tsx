import { createPageMetadata } from "../../../lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "داشبورد",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
