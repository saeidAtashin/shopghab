import type { LucideIcon } from "lucide-react";
import {
  Car,
  CassetteTape,
  Cpu,
  Crown,
  Eye,
  Flame,
  Flower2,
  Gamepad2,
  Gem,
  Heart,
  Image as ImageIcon,
  Landmark,
  Languages,
  Layers,
  LayoutGrid,
  Moon,
  Music,
  Palette,
  PawPrint,
  PenLine,
  Pin,
  Shapes,
  Sparkles,
  Swords,
  Trophy,
  Type,
  Wand2,
} from "lucide-react";

export type Accent = {
  text: string;
  soft: string;
  wash: string;
  edge: string;
  ring: string;
  chip: string;
};

const ACCENTS = {
  cyan: {
    text: "text-cyan-300",
    soft: "bg-cyan-500/15",
    wash: "bg-cyan-500/10",
    edge: "border-s-cyan-400",
    ring: "ring-cyan-300",
    chip: "border-cyan-400/70 bg-cyan-500/15 text-cyan-200",
  },
  amber: {
    text: "text-amber-300",
    soft: "bg-amber-500/15",
    wash: "bg-amber-500/10",
    edge: "border-s-amber-400",
    ring: "ring-amber-300",
    chip: "border-amber-400/70 bg-amber-500/15 text-amber-200",
  },
  emerald: {
    text: "text-emerald-300",
    soft: "bg-emerald-500/15",
    wash: "bg-emerald-500/10",
    edge: "border-s-emerald-400",
    ring: "ring-emerald-300",
    chip: "border-emerald-400/70 bg-emerald-500/15 text-emerald-200",
  },
  rose: {
    text: "text-rose-300",
    soft: "bg-rose-500/15",
    wash: "bg-rose-500/10",
    edge: "border-s-rose-400",
    ring: "ring-rose-300",
    chip: "border-rose-400/70 bg-rose-500/15 text-rose-200",
  },
  violet: {
    text: "text-violet-300",
    soft: "bg-violet-500/15",
    wash: "bg-violet-500/10",
    edge: "border-s-violet-400",
    ring: "ring-violet-300",
    chip: "border-violet-400/70 bg-violet-500/15 text-violet-200",
  },
  sky: {
    text: "text-sky-300",
    soft: "bg-sky-500/15",
    wash: "bg-sky-500/10",
    edge: "border-s-sky-400",
    ring: "ring-sky-300",
    chip: "border-sky-400/70 bg-sky-500/15 text-sky-200",
  },
  gold: {
    text: "text-yellow-300",
    soft: "bg-yellow-500/15",
    wash: "bg-yellow-500/10",
    edge: "border-s-yellow-400",
    ring: "ring-yellow-300",
    chip: "border-yellow-400/70 bg-yellow-500/15 text-yellow-100",
  },
  orange: {
    text: "text-orange-300",
    soft: "bg-orange-500/15",
    wash: "bg-orange-500/10",
    edge: "border-s-orange-400",
    ring: "ring-orange-300",
    chip: "border-orange-400/70 bg-orange-500/15 text-orange-200",
  },
  fuchsia: {
    text: "text-fuchsia-300",
    soft: "bg-fuchsia-500/15",
    wash: "bg-fuchsia-500/10",
    edge: "border-s-fuchsia-400",
    ring: "ring-fuchsia-300",
    chip: "border-fuchsia-400/70 bg-fuchsia-500/15 text-fuchsia-200",
  },
} as const satisfies Record<string, Accent>;

type Tone = keyof typeof ACCENTS;

const CATEGORIES: Record<string, { icon: LucideIcon; tone: Tone }> = {
  abstract: { icon: Shapes, tone: "cyan" },
  "abstract-minimal": { icon: Sparkles, tone: "cyan" },
  general: { icon: LayoutGrid, tone: "sky" },
  religion: { icon: Moon, tone: "violet" },
  animals: { icon: PawPrint, tone: "amber" },
  nature: { icon: Flower2, tone: "emerald" },
  "fantasy-cute": { icon: Wand2, tone: "fuchsia" },
  "anime-manga": { icon: Swords, tone: "rose" },
  gaming: { icon: Gamepad2, tone: "violet" },
  "iranian-art": { icon: Landmark, tone: "gold" },
  spiritual: { icon: Moon, tone: "violet" },
  love: { icon: Heart, tone: "rose" },
  typography: { icon: Type, tone: "sky" },
  luxury: { icon: Gem, tone: "gold" },
  retro: { icon: CassetteTape, tone: "orange" },
  street: { icon: Flame, tone: "orange" },
  "sports-motors": { icon: Car, tone: "sky" },
  lifestyle: { icon: Music, tone: "fuchsia" },
  "color-pattern": { icon: Palette, tone: "rose" },
  personalization: { icon: PenLine, tone: "cyan" },
  electronics: { icon: Cpu, tone: "sky" },
  pinterest: { icon: Pin, tone: "rose" },
  "optical-illusion": { icon: Eye, tone: "violet" },
  bestsellers: { icon: Trophy, tone: "amber" },
  popular: { icon: Eye, tone: "sky" },
  "shopghab-exclusive": { icon: Crown, tone: "gold" },
};

const FILTERS: Record<string, { icon: LucideIcon; tone: Tone }> = {
  colors: { icon: Palette, tone: "rose" },
  "visual-styles": { icon: Sparkles, tone: "violet" },
  "image-types": { icon: ImageIcon, tone: "amber" },
  mood: { icon: Heart, tone: "rose" },
  language: { icon: Languages, tone: "sky" },
  characteristics: { icon: Layers, tone: "emerald" },
};

const SWATCHES: Record<string, string> = {
  مشکی: "#171717",
  سفید: "#f4f4f5",
  قرمز: "#ef4444",
  صورتی: "#ec4899",
  آبی: "#3b82f6",
  سبز: "#22c55e",
  زرد: "#eab308",
  نارنجی: "#f97316",
  بنفش: "#a855f7",
  "قهوه‌ای": "#92400e",
  خاکستری: "#71717a",
  طلایی: "#d4a017",
  "نقره‌ای": "#cbd5e1",
};

export type SectionLayout = "stage" | "filmstrip" | "bento" | "editorial" | "stagger";

const LAYOUTS: SectionLayout[] = ["stage", "filmstrip", "bento", "editorial", "stagger"];

const PICK_LAYOUTS: Record<string, SectionLayout> = {
  bestsellers: "filmstrip",
  popular: "stage",
  "shopghab-exclusive": "bento",
};

const FALLBACK = { icon: Sparkles, tone: "cyan" as Tone };

export function categoryVisual(slug: string): { icon: LucideIcon; accent: Accent } {
  const match = CATEGORIES[slug] ?? FALLBACK;
  return { icon: match.icon, accent: ACCENTS[match.tone] };
}

export function filterVisual(slug: string): { icon: LucideIcon; accent: Accent } {
  const match = FILTERS[slug] ?? { icon: Layers, tone: "cyan" as Tone };
  return { icon: match.icon, accent: ACCENTS[match.tone] };
}

export function sectionLayout(slug: string, index: number): SectionLayout {
  return PICK_LAYOUTS[slug] ?? LAYOUTS[index % LAYOUTS.length] ?? "stage";
}

export function colorSwatch(label: string): string | "split" | null {
  if (label === "چندرنگ") return "split";
  return SWATCHES[label] ?? null;
}

export const allDesignsVisual = { icon: LayoutGrid, accent: ACCENTS.cyan };
