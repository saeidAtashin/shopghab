import Link from "next/link";
import Image from "next/image";
import type { PhoneBrand } from "@/lib/cases/types";

type Props = {
  brands: PhoneBrand[];
};

export default function BrandGrid({ brands }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {brands.map((brand) => (
        <Link
          key={brand.slug}
          href={`/create/${brand.slug}`}
          className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/60 p-6 transition hover:border-cyan-500/50 hover:bg-card"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface p-3 transition group-hover:bg-cyan-500/10">
            <Image
              src={brand.logo}
              alt={brand.name}
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
            />
          </div>
          <div className="text-center">
            <p className="font-bold text-foreground">{brand.name}</p>
            <p className="text-xs text-muted">{brand.nameEn}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
