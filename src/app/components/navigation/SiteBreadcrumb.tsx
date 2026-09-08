"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Home } from "lucide-react";

import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs";

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

function collapseForMobile(items: BreadcrumbItem[]): BreadcrumbItem[] {
  if (items.length <= 3) return items;

  const first = items[0];
  const last = items[items.length - 1];
  const penultimate = items[items.length - 2];

  return [
    first,
    { label: "…", href: penultimate?.href },
    last,
  ];
}

function BreadcrumbSegment({
  item,
  isLast,
  isFirst,
  index,
}: {
  item: BreadcrumbItem;
  isLast: boolean;
  isFirst: boolean;
  index: number;
}) {
  const isEllipsis = item.label === "…";

  const content = (
    <span className="inline-flex items-center gap-1.5 leading-none">
      {isFirst && (
        <Home
          size={14}
          strokeWidth={2}
          className="size-3.5 shrink-0 text-cyan-400/80"
          aria-hidden
        />
      )}
      <span
        className={`leading-none ${isEllipsis ? "tracking-widest" : "truncate"}`}
      >
        {isFirst && !isEllipsis ? "خانه" : item.label}
      </span>
    </span>
  );

  const baseClass =
    "inline-flex items-center leading-none max-w-[10rem] sm:max-w-none";

  if (isLast || !item.href) {
    return (
      <motion.span
        key={`${item.label}-${index}`}
        initial={{ opacity: 0, x: 6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.04 }}
        className={`${baseClass} inline-flex items-center font-medium text-foreground shadow-[0_1px_0_0_rgba(34,211,238,0.35)]`}
        aria-current="page"
      >
        {content}
      </motion.span>
    );
  }

  return (
      <motion.span
        key={`${item.label}-${index}`}
        initial={{ opacity: 0, x: 6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.04 }}
        className="inline-flex items-center"
      >
        <Link
          href={item.href}
          className={`${baseClass} text-muted transition-colors hover:text-cyan-200`}
        >
          {content}
        </Link>
      </motion.span>
  );
}

export default function SiteBreadcrumb({ items, className = "" }: Props) {
  if (items.length === 0) return null;

  const desktopItems = items;
  const mobileItems = collapseForMobile(items);

  return (
    <nav
      dir="rtl"
      aria-label="مسیر صفحه"
      className={className}
    >
      <div
        className="
          inline-flex min-h-9 max-w-full items-center
          rounded-2xl border border-border bg-card/40
          px-4 py-2 backdrop-blur-md
        "
      >
        {/* Desktop */}
        <ol className="hidden items-center gap-1 sm:flex">
          {desktopItems.map((item, index) => (
            <li key={`d-${item.label}-${index}`} className="flex items-center">
              {index > 0 && (
                <ChevronLeft
                  size={12}
                  className="mx-1 size-3 shrink-0 self-center text-cyan-500/30"
                  aria-hidden
                />
              )}
              <BreadcrumbSegment
                item={item}
                isLast={index === desktopItems.length - 1}
                isFirst={index === 0}
                index={index}
              />
            </li>
          ))}
        </ol>

        {/* Mobile (collapsed) */}
        <ol className="flex items-center gap-1 sm:hidden">
          {mobileItems.map((item, index) => (
            <li key={`m-${item.label}-${index}`} className="flex items-center">
              {index > 0 && (
                <ChevronLeft
                  size={12}
                  className="mx-1 size-3 shrink-0 self-center text-cyan-500/30"
                  aria-hidden
                />
              )}
              <BreadcrumbSegment
                item={item}
                isLast={index === mobileItems.length - 1}
                isFirst={index === 0}
                index={index}
              />
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
