export type Brand = "shop" | "custom" | "accent";

export const brandThemes: Record<
  Brand,
  {
    primary: string;
    bg: string;
    border: string;
    glow: string;
  }
> = {
  shop: {
    primary: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-400/30",
    glow: "from-amber-500/20",
  },

  custom: {
    primary: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-400/30",
    glow: "from-rose-500/20",
  },

  accent: {
    primary: "text-stone-300",
    bg: "bg-stone-500/10",
    border: "border-stone-400/30",
    glow: "from-stone-500/20",
  },
};
