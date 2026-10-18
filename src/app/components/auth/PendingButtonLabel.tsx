import { Loader2 } from "lucide-react";

type Props = {
  pending: boolean;
  idle: string;
  pendingLabel: string;
};

export default function PendingButtonLabel({ pending, idle, pendingLabel }: Props) {
  if (!pending) return idle;

  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {pendingLabel}
    </span>
  );
}
