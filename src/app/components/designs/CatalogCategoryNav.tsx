import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { designedAssetUrl } from "@/lib/designed-assets";
import type { PublicCategoryCard } from "@/lib/catalog/logic";

type Props = {
  roots: PublicCategoryCard[];
  inners: PublicCategoryCard[];
  activeRootSlug?: string;
  activeChildSlug?: string;
  allActive?: boolean;
};

function countLabel(count: number): string {
  return `${count.toLocaleString("fa-IR")} طرح`;
}

function CategoryCardLink({ card, active }: { card: PublicCategoryCard; active: boolean }) {
  return (
    <Link
      href={card.href}
      aria-current={active ? "page" : undefined}
      className={`flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-right transition ${
        active
          ? "border-cyan-500/60 bg-cyan-500/10"
          : "border-border bg-card/60 hover:border-cyan-500/30"
      }`}
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.16),transparent_70%)]">
        {card.image ? (
          <Image
            src={designedAssetUrl(card.image)}
            alt=""
            fill
            sizes="48px"
            className="pointer-events-none object-cover"
          />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-foreground">{card.name}</span>
        <span className="mt-0.5 block text-xs text-muted">{countLabel(card.count)}</span>
      </span>
    </Link>
  );
}

function CardRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={label} className="space-y-3">
      <h2 className="text-sm font-bold text-foreground">{label}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export default function CatalogCategoryNav({
  roots,
  inners,
  activeRootSlug,
  activeChildSlug,
  allActive = false,
}: Props) {
  if (roots.length === 0 && inners.length === 0) return null;

  return (
    <div className="space-y-8">
      <CardRow label="دسته‌ها">
        <Link
          href="/designs?view=all"
          aria-current={allActive ? "page" : undefined}
          className={`flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-right transition ${
            allActive
              ? "border-cyan-500/60 bg-cyan-500/10"
              : "border-border bg-card/60 hover:border-cyan-500/30"
          }`}
        >
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-xs font-black text-cyan-300"
          >
            همه
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-foreground">همه طرح‌ها</span>
            <span className="mt-0.5 block text-xs text-muted">بدون انتخاب دسته</span>
          </span>
        </Link>
        {roots.map((card) => (
          <CategoryCardLink key={card.slug} card={card} active={!allActive && card.slug === activeRootSlug} />
        ))}
      </CardRow>

      {inners.length > 0 ? (
        <CardRow label="زیردسته‌ها">
          {inners.map((card) => (
            <CategoryCardLink key={card.slug} card={card} active={card.slug === activeChildSlug} />
          ))}
        </CardRow>
      ) : null}
    </div>
  );
}
