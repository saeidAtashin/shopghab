"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

type Props = {
  itemCount: number;
  receiving: boolean;
  className?: string;
  onClick?: () => void;
};

const receiveTransition = {
  duration: 0.45,
  times: [0, 0.2, 0.55, 1],
  ease: "easeOut" as const,
};

export default function CartNavLink({ itemCount, receiving, className, onClick }: Props) {
  return (
    <motion.div
      animate={receiving ? { scale: [1, 0.88, 1.12, 1] } : { scale: 1 }}
      transition={receiving ? receiveTransition : { duration: 0.2 }}
      className="inline-flex"
    >
      <Link
        href="/cart"
        data-shop-cart-target
        onClick={onClick}
        className={`relative ${className ?? ""}`}
        aria-label="سبد خرید"
      >
        {receiving ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-lg border-2 border-cyan-400/70"
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        ) : null}

        <motion.span
          className="relative inline-flex"
          animate={
            receiving
              ? { y: [0, 3, -2, 0], rotate: [0, -8, 4, 0] }
              : { y: 0, rotate: 0 }
          }
          transition={receiving ? receiveTransition : { duration: 0.2 }}
        >
          <ShoppingCart size={18} />
        </motion.span>

        {itemCount > 0 ? (
          <motion.span
            key={itemCount}
            className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-black"
            animate={receiving ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={receiving ? { duration: 0.45, ease: "easeOut" } : { duration: 0.2 }}
          >
            {itemCount}
          </motion.span>
        ) : null}
      </Link>
    </motion.div>
  );
}
