import Image from "next/image";
import Link from "next/link";

import type { PhoneBrand } from "@/lib/cases/types";
import { cn } from "@/lib/utils";

type Props = {
  brand: PhoneBrand;
  href?: string;
  selected?: boolean;
  onSelect?: () => void;
};

const tileClass = (selected: boolean) =>
  cn(
    "group flex min-h-11 w-full flex-col items-center gap-3 rounded-2xl border bg-card/60 p-3 transition hover:border-cyan-500/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
    selected ? "border-cyan-500/60 ring-1 ring-cyan-500/30" : "border-border",
  );

function Logo({ brand }: { brand: PhoneBrand }) {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100 p-3 transition group-hover:bg-white">
      <Image
        src={brand.logo}
        alt=""
        width={64}
        height={64}
        className="h-16 w-16 object-contain"
      />
    </span>
  );
}

export default function BrandPickerTile({ brand, href, selected = false, onSelect }: Props) {
  const body = (
    <>
      <Logo brand={brand} />
      <span className="text-center text-sm font-bold text-foreground">{brand.name}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={tileClass(selected)} onClick={onSelect}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} className={tileClass(selected)}>
      {body}
    </button>
  );
}
