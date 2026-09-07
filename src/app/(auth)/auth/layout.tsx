import { createPageMetadata } from "../../../lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "احراز هویت",
  path: "/auth",
  noIndex: true,
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
