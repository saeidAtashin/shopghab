import { BadgeCheck, Clock3, ShieldCheck, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

export type TrustSignal = {
  icon?: "clock" | "shield" | "price" | "expert";
  label: string;
  value: string;
};

const ICONS = {
  clock: Clock3,
  shield: ShieldCheck,
  price: BadgeCheck,
  expert: Wrench,
} as const;

type Props = {
  signals: TrustSignal[];
  className?: string;
  iconClassName?: string;
};

export default function TrustSignalsBar({
  signals,
  className = "",
  iconClassName = "text-cyan-400",
}: Props) {
  return (
    <section
      className={`border-t border-border py-16 ${className}`}
      aria-label="مزایای خدمات"
    >
      <div className="container mx-auto px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal, index) => {
            const Icon = ICONS[signal.icon ?? "shield"];
            return (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card/60 p-6"
              >
                <Icon className={cn("mb-3 h-6 w-6", iconClassName)} />
                <p className="text-sm text-muted">{signal.label}</p>
                <p className="mt-1 font-bold leading-7">{signal.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
