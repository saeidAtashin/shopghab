import { createPageMetadata } from "@/lib/seo/metadata";
import CheckoutPageClient from "./CheckoutPageClient";

export const metadata = createPageMetadata({
  title: "تسویه حساب",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
