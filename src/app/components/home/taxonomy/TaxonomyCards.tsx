import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { designedAssetUrl } from "@/lib/designed-assets";
import type { LandingCardStyle } from "@/lib/landing/sections";
import type { TaxonomyCard, TaxonomyChip } from "@/lib/landing/taxonomy";

type Props = {
  items: TaxonomyCard[];
  style: LandingCardStyle;
  contained?: boolean;
};

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function countLabel(count: number): string {
  const digits = String(count).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
  return `${digits} طرح`;
}

function CardMedia({ image, className }: { image: string; className?: string }) {
  if (!image) return <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-transparent to-fuchsia-500/20" />;
  return (
    <Image
      src={designedAssetUrl(image)}
      alt=""
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className={className ?? "object-cover"}
    />
  );
}

function ChipRow({ chips }: { chips: TaxonomyChip[] }) {
  return (
    <div className="mt-3 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
      {chips.map((chip) => (
        <Link
          key={chip.id}
          href={chip.href}
          className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm transition hover:border-cyan-300/60 hover:text-cyan-200"
        >
          {chip.label}
        </Link>
      ))}
    </div>
  );
}

function CardFrame({
  item,
  className,
  children,
}: {
  item: TaxonomyCard;
  className: string;
  children: ReactNode;
}) {
  if (item.chips.length > 0) {
    return <article className={className}>{children}</article>;
  }
  return (
    <Link
      href={item.href}
      className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70`}
    >
      {children}
    </Link>
  );
}

function TitleBlock({
  item,
  titleClass,
  showDescription = true,
}: {
  item: TaxonomyCard;
  titleClass: string;
  showDescription?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <p className={titleClass}>{item.title}</p>
        <span className="shrink-0 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-bold text-cyan-100">
          {countLabel(item.count)}
        </span>
      </div>
      {showDescription && item.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">{item.description}</p>
      ) : null}
      {item.chips.length > 0 ? <ChipRow chips={item.chips} /> : null}
    </div>
  );
}

function GlassCards({ items }: { items: TaxonomyCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-3xl bg-gradient-to-br from-cyan-300/80 via-white/20 to-fuchsia-400/70 p-px shadow-[0_24px_50px_-28px_rgba(34,211,238,0.85)]"
        >
          <CardFrame
            item={item}
            className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-[22px] bg-[#071018]/85"
          >
            <div className="pointer-events-none absolute inset-0">
              <CardMedia
                image={item.image}
                className="scale-110 object-cover opacity-40 blur-md transition duration-700 group-hover:scale-125 group-hover:opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/75 to-cyan-400/10" />
            </div>
            <div className="relative z-10 p-5">
              <TitleBlock item={item} titleClass="text-lg font-black text-white" />
            </div>
          </CardFrame>
        </div>
      ))}
    </div>
  );
}

function BentoCards({ items, contained }: { items: TaxonomyCard[]; contained: boolean }) {
  return (
    <div className={contained ? "max-h-[36rem] overflow-y-auto pe-1" : undefined}>
      <div className="grid grid-cols-2 items-start gap-3 lg:grid-cols-4">
        {items.map((item, index) => {
          const lead = index === 0;
          return (
            <CardFrame
              key={item.id}
              item={item}
              className={`group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220] ${
                lead ? "col-span-2" : ""
              }`}
            >
              <div className={`relative ${lead ? "h-52" : "h-28"}`}>
                <CardMedia
                  image={item.image}
                  className="object-cover opacity-90 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] to-transparent" />
              </div>
              <div className={lead ? "p-5" : "p-3"}>
                <TitleBlock
                  item={item}
                  titleClass={lead ? "text-2xl font-black text-white" : "line-clamp-2 text-sm font-black text-white"}
                  showDescription={lead}
                />
              </div>
            </CardFrame>
          );
        })}
      </div>
    </div>
  );
}

function EditorialCards({ items }: { items: TaxonomyCard[] }) {
  const [lead, ...rest] = items;
  if (!lead) return null;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-5">
      <div className={rest.length > 0 ? "lg:col-span-3" : "lg:col-span-5"}>
        <CardFrame
          item={lead}
          className="group grid overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220] lg:min-h-[24rem] lg:grid-cols-2"
        >
          <div className="relative min-h-52">
            <CardMedia
              image={lead.image}
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-end bg-gradient-to-bl from-cyan-400/10 to-transparent p-6">
            <p className="text-xs font-bold tracking-[0.25em] text-cyan-300">منتخب</p>
            <div className="mt-3">
              <TitleBlock item={lead} titleClass="text-3xl font-black text-white" />
            </div>
          </div>
        </CardFrame>
      </div>
      {rest.length > 0 ? (
        <div className="flex max-h-[32rem] flex-col gap-3 overflow-y-auto pe-1 lg:col-span-2">
          {rest.map((item) => (
            <CardFrame
              key={item.id}
              item={item}
              className="flex gap-3 rounded-2xl border border-white/10 bg-card/70 p-3 transition hover:border-cyan-300/40"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#0b1220]">
                <CardMedia image={item.image} className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 self-center">
                <TitleBlock item={item} titleClass="line-clamp-1 text-sm font-black text-foreground" showDescription={false} />
              </div>
            </CardFrame>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TicketCards({ items }: { items: TaxonomyCard[] }) {
  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
      {items.map((item, index) => (
        <CardFrame
          key={item.id}
          item={item}
          className="relative flex min-h-[22rem] w-[18rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0c1424]"
        >
          <span className="absolute inset-y-4 start-0 w-1.5 rounded-full bg-gradient-to-b from-cyan-300 to-fuchsia-400" />
          <div className="relative mx-4 mt-4 h-36 overflow-hidden rounded-2xl">
            <CardMedia image={item.image} className="object-cover" />
          </div>
          <div className="mx-5 mt-4 border-t border-dashed border-white/20" />
          <span className="absolute top-[10.6rem] -start-2 h-4 w-4 rounded-full bg-background" />
          <span className="absolute top-[10.6rem] -end-2 h-4 w-4 rounded-full bg-background" />
          <div className="flex flex-1 flex-col px-5 pb-4 pt-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-cyan-300/80">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="mt-2">
              <TitleBlock item={item} titleClass="line-clamp-2 text-base font-black text-white" showDescription={false} />
            </div>
          </div>
        </CardFrame>
      ))}
    </div>
  );
}

export default function TaxonomyCards({ items, style, contained = false }: Props) {
  if (items.length === 0) return null;
  if (style === "bento") return <BentoCards items={items} contained={contained} />;
  if (style === "editorial") return <EditorialCards items={items} />;
  if (style === "ticket") return <TicketCards items={items} />;
  return <GlassCards items={items} />;
}
