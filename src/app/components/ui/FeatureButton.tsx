import { motion } from "framer-motion";

type FeatureButtonProps = {
  title: string;
  desc: string;
  onClick?: () => void;
  className?: string;
};

export default function FeatureButton({
  title,
  desc,
  onClick,
  className = "",
}: FeatureButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left backdrop-blur-xl ${className}`}
    >
      {/* glow hover effect */}
      <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_50%)]" />

      {/* content */}
      <div className="relative z-10">
        <div className="text-sm font-semibold text-white group-hover:text-cyan-300">
          {title}
        </div>

        <div className="mt-1 text-xs leading-5 text-zinc-400">{desc}</div>
      </div>

      {/* animated bottom line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />
    </motion.button>
  );
}
