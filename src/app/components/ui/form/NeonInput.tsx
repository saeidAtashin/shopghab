import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "../../../../lib/utils";

const NeonInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("input-neon", className)} {...props} />
  ),
);

NeonInput.displayName = "NeonInput";

export default NeonInput;
