import type { ConsoleId } from "./console-catalog";

export type Brand = "playstation" | "xbox" | "gaming";

export type BrandTheme = {
  primary: string;
  bg: string;
  border: string;
  borderHover: string;
  glow: string;
  ambient: string;
  pageWash: string;
  submit: string;
};

export const consoleBrands: Record<ConsoleId, Brand> = {
  ps4: "playstation",
  ps5: "playstation",
  xbox: "xbox",
};

export const brandThemes: Record<Brand, BrandTheme> = {
  playstation: {
    primary: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-400/30",
    borderHover: "hover:border-blue-400/40",
    glow: "from-blue-500/20",
    ambient: "bg-blue-600/10",
    pageWash: "from-blue-600/12 via-transparent to-blue-950/25",
    submit:
      "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
  },

  xbox: {
    primary: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-400/30",
    borderHover: "hover:border-green-400/40",
    glow: "from-green-500/20",
    ambient: "bg-green-500/10",
    pageWash: "from-green-600/12 via-transparent to-emerald-950/25",
    submit:
      "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]",
  },

  gaming: {
    primary: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/30",
    borderHover: "hover:border-cyan-400/40",
    glow: "from-cyan-500/20",
    ambient: "bg-cyan-500/10",
    pageWash: "from-cyan-600/12 via-transparent to-blue-950/25",
    submit:
      "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]",
  },
};

export function getBrandForConsole(consoleId: ConsoleId): Brand {
  return consoleBrands[consoleId];
}

export function getThemeForConsole(consoleId?: ConsoleId): BrandTheme {
  if (!consoleId) return brandThemes.gaming;
  return brandThemes[getBrandForConsole(consoleId)];
}
