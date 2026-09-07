import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "../../../../lib/utils";

const NeonTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("input-neon", className)} {...props} />
));

NeonTextarea.displayName = "NeonTextarea";

export default NeonTextarea;
