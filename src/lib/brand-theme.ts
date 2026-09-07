export type Brand = "playstation" | "xbox" | "gaming";

export const brandThemes: Record<
  Brand,
  {
    primary: string;
    bg: string;
    border: string;
    glow: string;
  }
> = {
  playstation: {
    primary: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-400/30",
    glow: "from-blue-500/20",
  },

  xbox: {
    primary: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-400/30",
    glow: "from-green-500/20",
  },

  gaming: {
    primary: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/30",
    glow: "from-cyan-500/20",
  },
};
