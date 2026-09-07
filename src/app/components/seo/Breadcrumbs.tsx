import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { type BreadcrumbItem } from "../../../lib/seo/breadcrumbs";

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumbs({ items, className = "" }: Props) {
  if (items.length === 0) return null;

  return (
    <>
      <nav
        aria-label="مسیر صفحه"
        className={`mb-8 flex flex-wrap items-center gap-2 text-sm text-zinc-400 ${className}`}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <span
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <ChevronLeft
                  className="h-3.5 w-3.5 shrink-0 text-zinc-600"
                  aria-hidden
                />
              )}
              {isLast || !item.href ? (
                <span className="text-white" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
