import { cn } from "../../../lib/utils";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({
  variant = "primary",
  className,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "px-5 py-3 rounded-xl font-medium transition-all duration-300",
        variant === "primary" && "bg-blue-600 hover:bg-blue-700 text-white",
        variant === "secondary" && "bg-zinc-800 hover:bg-zinc-700 text-white",
        className,
      )}
      {...props}
    />
  );
}
