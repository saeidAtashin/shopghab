import { cn } from "@/lib/utils";
import {
  SHOPGHAB_MARK_PATHS,
  SHOPGHAB_MARK_VIEWBOX,
} from "@/lib/case-loading/shopghab-mark";

type MenuLogoMarkProps = {
  className?: string;
};

export default function MenuLogoMark({ className }: MenuLogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={SHOPGHAB_MARK_VIEWBOX}
      aria-hidden
      overflow="hidden"
      className={cn("block overflow-hidden", className)}
    >
      {SHOPGHAB_MARK_PATHS.map((path) => (
        <path
          key={path.fill}
          d={path.d}
          fill={path.fill}
          fillRule="evenodd"
          stroke={path.fill === "#101728" || path.fill === "#543ee8" ? undefined : path.fill}
          strokeWidth={path.fill === "#101728" || path.fill === "#543ee8" ? undefined : 0.25}
          strokeLinejoin={path.fill === "#101728" || path.fill === "#543ee8" ? undefined : "round"}
        />
      ))}
    </svg>
  );
}
