import { Suspense } from "react";

import CatalogBrowseChrome from "@/app/components/designs/CatalogBrowseChrome";
import { publicBrowseShell } from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";

export default function DesignsBrowseLayout({ children }: { children: React.ReactNode }) {
  const shell = publicBrowseShell(readCatalog());

  return (
    <main
      id="main"
      tabIndex={-1}
      className="min-h-screen bg-background px-4 pb-16 pt-24 text-foreground outline-none sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={null}>
          <CatalogBrowseChrome shell={shell}>{children}</CatalogBrowseChrome>
        </Suspense>
      </div>
    </main>
  );
}
