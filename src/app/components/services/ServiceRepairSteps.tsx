"use client";

import { motion } from "framer-motion";
import { Flame, Hammer, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type ServiceRepairStepsProps = {
  steps: string[];
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// Norse Rune translations for step indicators
const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ"];

function StepIcon({ index }: { index: number }) {
  // 0: Leviathan Frost, 1: Guardian Shield, 2: Blades of Chaos (Fiery Red)
  const isAxe = index % 3 === 0;
  const isShield = index % 3 === 1;

  const icon = isAxe ? (
    <Hammer className="h-6 w-6 text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
  ) : isShield ? (
    <Shield className="h-6 w-6 text-muted drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
  ) : (
    <Flame className="h-6 w-6 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse" />
  );

  return (
    <div
      className={cn(
        "relative mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-background/90 shadow-2xl transition-transform duration-300 group-hover:scale-110",
        isAxe
          ? "border-sky-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(14,165,233,0.15)]"
          : isShield
            ? "border-zinc-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_0_20px_rgba(255,255,255,0.05)]"
            : "border-red-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(239,68,68,0.15)]",
      )}
    >
      {/* Runes background glow inside icon frame */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-20",
          isAxe
            ? "from-sky-500 via-transparent to-cyan-500"
            : isShield
              ? "from-zinc-400 via-transparent to-stone-600"
              : "from-red-600 via-transparent to-amber-600",
        )}
      />
      {icon}
    </div>
  );
}

function RepairStepCard({ step, index }: { step: string; index: number }) {
  const currentRune = RUNES[index % RUNES.length];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card/90 to-background/95 p-8 backdrop-blur-xl",
        "transition-all duration-500 hover:border-red-500/40 hover:shadow-[0_25px_50px_-12px_rgba(220,38,38,0.15)]",
      )}
    >
      {/* Stone slab grid overlay texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:16px_16px]"
      />

      {/* Leviathan Frost top glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/0 to-transparent transition-all duration-500 group-hover:via-sky-400/60"
      />

      {/* Spartan Red corner slash highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rotate-45 bg-gradient-to-b from-red-600/20 to-transparent blur-md transition-opacity duration-500 group-hover:from-red-600/40"
      />

      {/* Norse Rune Watermark */}
      <div className="absolute right-4 top-2 font-serif text-8xl font-black text-foreground/10 pointer-events-none select-none transition-colors duration-500 group-hover:text-red-600/10">
        {currentRune}
      </div>

      {/* Kratos' mark label */}
      <span className="absolute left-6 top-4 font-mono text-[9px] tracking-[0.3em] text-muted transition-colors duration-500 group-hover:text-red-500/70">
        REALM_VALHAL_{String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative z-10 mt-4">
        <StepIcon index={index} />

        <h3 className="font-serif text-xl font-bold tracking-wide text-stone-200 transition-colors duration-300 group-hover:text-foreground">
          {step}
        </h3>

        {/* Runes / Norse Lore-friendly Description */}
        <p className="mt-3 text-sm leading-relaxed text-muted font-sans transition-colors duration-300 group-hover:text-muted">
          با استعانت از مهارت دورف‌ها در کارگاه سندری و بروک؛ فلز را رام کرده و
          نظم و پایداری را به ابزارت بازمی‌گردانیم.
        </p>
      </div>
    </motion.div>
  );
}

export default function ServiceRepairSteps({ steps }: ServiceRepairStepsProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-radial-[at_50%_0%] from-card/60 via-background to-background p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
      {/* Ember glow backgrounds */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-red-950/20 blur-3xl opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full bg-amber-950/10 blur-3xl opacity-50"
      />

      {/* Subtle ice mist glow top border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent"
      />

      {/* Runic Frame borders */}
      <div className="absolute inset-2 pointer-events-none border border-border/40 rounded-2xl" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="relative grid gap-8 lg:grid-cols-3 z-10"
      >
        {steps.map((step, index) => (
          <RepairStepCard key={`${step}-${index}`} step={step} index={index} />
        ))}
      </motion.div>
    </div>
  );
}
