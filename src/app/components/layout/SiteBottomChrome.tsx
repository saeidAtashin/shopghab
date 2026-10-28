"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import HomeMobileDock from "@/app/components/home/HomeMobileDock";

function mobileDockVisible(pathname: string): boolean {
  return !pathname.startsWith("/design/") && !pathname.startsWith("/admin");
}

export default function SiteBottomChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dock = mobileDockVisible(pathname);

  return (
    <>
      <div className={dock ? "pb-[calc(4rem+env(safe-area-inset-bottom))] xl:pb-0" : undefined}>
        {children}
      </div>
      {dock ? <HomeMobileDock /> : null}
    </>
  );
}
