import { createPageMetadata } from "../../../lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "پنل مدیریت",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
