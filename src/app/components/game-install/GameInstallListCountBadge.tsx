"use client";

import { motion } from "framer-motion";

import { useGameInstallList } from "@/app/context/GameInstallListContext";

type Props = {
  className?: string;
  children: React.ReactNode;
};

const receiveTransition = {
  duration: 0.45,
  times: [0, 0.2, 0.55, 1],
  ease: "easeOut" as const,
};

export default function GameInstallListCountBadge({
  className,
  children,
}: Props) {
  const { listBounce } = useGameInstallList();

  return (
    <motion.span
      data-game-install-list-target
      animate={listBounce ? { scale: [1, 0.88, 1.12, 1] } : { scale: 1 }}
      transition={listBounce ? receiveTransition : { duration: 0.2 }}
      className={className}
    >
      {listBounce ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-400/70"
          initial={{ scale: 0.6, opacity: 0.7 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      ) : null}
      <span className="relative">{children}</span>
    </motion.span>
  );
}
