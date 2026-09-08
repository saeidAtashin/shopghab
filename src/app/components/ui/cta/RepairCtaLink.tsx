import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type RepairCtaLinkProps = {
  href?: string;
  label?: string;
};

export default function RepairCtaLink({
  href = "/repair",
  label = "ثبت درخواست",
}: RepairCtaLinkProps) {
  return (
    <Link
      href={href}
      className="group w-full md:w-auto relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-blue-400/40 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500/90 px-8 py-4 text-lg font-bold text-white shadow-[0_10px_40px_rgba(59,130,246,0.28)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_14px_55px_rgba(34,211,238,0.38)]"
    >
      <span className="absolute inset-0 -translate-x-[120%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
      <span className="relative z-10">{label}</span>
      <ArrowLeft className="relative z-10 h-5 w-5 opacity-80 transition group-hover:-translate-x-0.5" />
    </Link>
  );
}
