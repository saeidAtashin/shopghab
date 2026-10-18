import {
  Home,
  Images,
  PackageSearch,
  PenLine,
  type LucideIcon,
} from "lucide-react";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/designs": Images,
  "/create": PenLine,
  "/tracking": PackageSearch,
};

export function navItemIcon(href: string): LucideIcon | null {
  return NAV_ICONS[href] ?? null;
}
