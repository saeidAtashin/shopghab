import Link from "next/link";

import { getSeriesForBrand } from "@/lib/cases/series";
import { cn } from "@/lib/utils";

type Props = {
  brandSlug: string;
  activeSlug?: string;
  pathname?: string;
  onSelect?: (seriesSlug: string | undefined) => void;
};

function chipClass(active: boolean): string {
  return cn(
    "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
    active
      ? "border-cyan-400 bg-cyan-500 text-black"
      : "border-border bg-card/80 text-foreground hover:border-cyan-500/40",
  );
}

export default function SeriesChips({ brandSlug, activeSlug, pathname, onSelect }: Props) {
  const series = getSeriesForBrand(brandSlug);
  if (series.length === 0) return null;

  const allActive = !activeSlug;

  return (
    <nav aria-label="سری گوشی" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {onSelect ? (
        <button
          type="button"
          aria-pressed={allActive}
          onClick={() => onSelect(undefined)}
          className={chipClass(allActive)}
        >
          همه
        </button>
      ) : (
        <Link href={pathname ?? "#"} aria-current={allActive ? "true" : undefined} className={chipClass(allActive)}>
          همه
        </Link>
      )}
      {series.map((item) => {
        const active = item.slug === activeSlug;
        if (onSelect) {
          return (
            <button
              key={item.slug}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(item.slug)}
              className={chipClass(active)}
            >
              {item.name}
            </button>
          );
        }
        return (
          <Link
            key={item.slug}
            href={`${pathname}?series=${item.slug}`}
            aria-current={active ? "true" : undefined}
            className={chipClass(active)}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
