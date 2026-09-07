import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "../../../../lib/utils";

const NeonSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "input-neon h-12 w-full appearance-none pe-10 ps-4 font-semibold text-white",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400"
      aria-hidden
    />
  </div>
));

NeonSelect.displayName = "NeonSelect";

export default NeonSelect;
