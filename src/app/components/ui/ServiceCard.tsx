import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Brand, brandThemes } from "../../../lib/brand-theme";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  slug: string;
  brand: Brand;
}

export default function ServiceCard({
  title,
  description,
  icon: Icon,
  slug,
  brand,
}: Props) {
  const theme = brandThemes[brand];

  return (
    <Link href={`/services/${slug}`} className="block h-full">
      <div
        className={`
          group
          relative
          flex
          h-full
          min-h-[260px]
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-zinc-800
          bg-white/5
          p-8
          backdrop-blur-xl
          transition-all
          duration-500
          hover:-translate-y-2
          ${theme.border}
        `}
      >
        {/* Glow */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div
            className={`absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${theme.glow}`}
          />
        </div>

        {/* Icon */}
        <div
          className={`
            mb-6
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            ${theme.bg}
            ${theme.primary}
          `}
        >
          <Icon size={32} />
        </div>

        <h3 className="mb-4 text-2xl font-black text-white">{title}</h3>

        <p className="leading-8 text-zinc-400 line-clamp-3">{description}</p>

        <div className={`mt-auto pt-6 text-sm font-bold ${theme.primary}`}>
          مشاهده جزئیات ←
        </div>
      </div>
    </Link>
  );
}
