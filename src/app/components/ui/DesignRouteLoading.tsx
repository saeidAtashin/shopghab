import { DESIGN_ROUTE_LOADER_LABEL } from "@/lib/route-navigation";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function DesignRoutePendingLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center justify-center gap-1.5 text-center text-xs font-semibold text-cyan-300",
        className,
      )}
    >
      <span
        className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300"
        aria-hidden
      />
      <span>{DESIGN_ROUTE_LOADER_LABEL}</span>
    </span>
  );
}

export default function DesignRouteLoading({ className }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-background px-4 pt-24 text-center",
        className,
      )}
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400"
        aria-hidden
      />
      <p className="mt-4 text-sm font-bold text-foreground">{DESIGN_ROUTE_LOADER_LABEL}</p>
    </div>
  );
}
