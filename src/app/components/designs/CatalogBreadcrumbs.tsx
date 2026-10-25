import Link from "next/link";

import BrowseLink from "@/app/components/designs/BrowseLink";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs";

export default function CatalogBreadcrumbs({
  items,
  soft = false,
}: {
  items: BreadcrumbItem[];
  soft?: boolean;
}) {
  const linkClass = "text-cyan-400 hover:underline";
  return (
    <nav aria-label="مسیر" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              soft ? (
                <BrowseLink href={item.href} className={linkClass}>
                  {item.label}
                </BrowseLink>
              ) : (
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              )
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
