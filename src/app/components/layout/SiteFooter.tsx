"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function SiteFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/design/")) return null;
  return children;
}
