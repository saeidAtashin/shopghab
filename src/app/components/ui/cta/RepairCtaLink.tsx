import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PrimaryCtaLinkProps = {
  href?: string;
  label?: string;
};

export default function PrimaryCtaLink({
  href = "/cases",
  label = "مشاهده قاب‌ها",
}: PrimaryCtaLinkProps) {
  return (
    <Link
      href={href}
      className="group relative inline-flex w-full items-center gap-2 overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500/90 px-8 py-4 text-lg font-bold text-black shadow-[0_10px_40px_rgba(245,158,11,0.25)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_14px_55px_rgba(251,146,60,0.35)] md:w-auto"
    >
      <span className="absolute inset-0 -translate-x-[120%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
      <span className="relative z-10">{label}</span>
      <ArrowLeft className="relative z-10 h-5 w-5 opacity-80 transition group-hover:-translate-x-0.5" />
    </Link>
  );
}
