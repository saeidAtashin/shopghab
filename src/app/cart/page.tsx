import { createPageMetadata } from "@/lib/seo/metadata";
import CartPageClient from "./CartPageClient";

export const metadata = createPageMetadata({
  title: "سبد خرید",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageClient />;
}
