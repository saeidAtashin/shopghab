"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { useCallback, useRef } from "react";

import GameImageStrip from "@/app/components/ui/GameImageStrip";
import ConsoleTabIcon from "@/app/components/ui/ConsoleTabIcon";
import type { BlogGame } from "@/app/data/blog";
import { resolveGameImages } from "@/lib/game-images";
import { cn } from "@/lib/utils";

import "./blog-animations.css";

const CONSOLE_META = {
  ps5: { label: "PS5", icon: "/icons/ps5.svg", color: "text-blue-400" },
  ps4: { label: "PS4", icon: "/icons/ps4.svg", color: "text-indigo-400" },
  xbox: { label: "Xbox", icon: "/icons/xbox.svg", color: "text-green-400" },
} as const;

type Props = {
  game: BlogGame;
  index?: number;
  className?: string;
};

export default function BlogGameCard({ game, index = 0, className }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cardRef.current.style.transform = `perspective(900px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale(1.02)`;
    },
    [prefersReducedMotion],
  );

  const handlePointerLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
  }, []);

  const consoleMeta = CONSOLE_META[game.console];
  const { images } = resolveGameImages({
    slug: game.slug,
    name: game.name,
    fallback: game.coverImage,
  });

  const card = (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "blog-card-3d group/card flex w-[200px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-surface shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] sm:w-[220px]",
        className,
      )}
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-card">
        <GameImageStrip
          images={images}
          alt={game.name}
          sizes="220px"
          aspectClass="h-full w-full"
          className="absolute inset-0"
          imageClassName="object-cover transition duration-500 group-hover/card:scale-110"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/25 to-transparent opacity-90"
          aria-hidden
        />
        <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg border border-border bg-background/55 px-2 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
          {game.rating.toFixed(1)}
        </span>
        <span
          className={cn(
            "absolute end-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg border border-border bg-background/55 px-2 py-1 text-[10px] font-bold backdrop-blur-sm",
            consoleMeta.color,
          )}
        >
          <ConsoleTabIcon src={consoleMeta.icon} className="h-3.5 w-3.5" />
          {consoleMeta.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5 pt-2.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {game.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted">
          <span>{game.genre}</span>
          {game.metacritic != null ? (
            <span>
              · <span className="text-violet-400/90">{game.metacritic}</span> MC
            </span>
          ) : null}
        </div>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted">
          {game.highlight}
        </p>
      </div>
    </article>
  );

  if (prefersReducedMotion) {
    return card;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4 + index * 0.3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2,
        }}
      >
        {card}
      </motion.div>
    </motion.div>
  );
}
