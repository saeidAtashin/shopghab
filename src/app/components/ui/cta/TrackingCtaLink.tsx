import Link from "next/link";
import { PackageSearch } from "lucide-react";

type TrackingCtaLinkProps = {
  href?: string;
};

export default function TrackingCtaLink({
  href = "/tracking",
}: TrackingCtaLinkProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-2 text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:border-cyan-400/30 hover:bg-white/[0.08] hover:shadow-[0_12px_48px_rgba(34,211,238,0.12)]"
    >
      <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition duration-300 group-hover:scale-105 group-hover:border-cyan-400/35">
        <PackageSearch
          className="relative h-5 w-5 text-cyan-300"
          strokeWidth={2.25}
        />
      </span>

      <span className="relative z-10 w-full shrink text-right">
        <span className="block text-lg font-bold tracking-tight">
          پیگیری سفارش
        </span>
        <span className="mt-0.5 block text-sm text-zinc-400 transition-colors group-hover:text-amber-200/70">
          وضعیت قاب را ببینید
        </span>
      </span>
    </Link>
  );
}
