import { cn } from "../../../../lib/utils";

import MagneticConsultButton from "./MagneticConsultButton";
import PrimaryCtaLink from "./RepairCtaLink";
import TrackingCtaLink from "./TrackingCtaLink";

export type CtaSecondaryAction = "consult" | "tracking";

export type CtaButtonGroupProps = {
  repairHref?: string;
  repairLabel?: string;
  secondary?: CtaSecondaryAction;
  trackingHref?: string;
  className?: string;
};

export default function CtaButtonGroup({
  repairHref = "/cases",
  repairLabel = "مشاهده قاب‌ها",
  secondary = "consult",
  trackingHref = "/tracking",
  className,
}: CtaButtonGroupProps) {
  return (
    <div
      className={cn(
        "mt-10 flex flex-col flex-wrap items-center gap-4 md:flex-row",
        className,
      )}
    >
      <PrimaryCtaLink href={repairHref} label={repairLabel} />
      {secondary === "consult" ? (
        <MagneticConsultButton />
      ) : (
        <TrackingCtaLink href={trackingHref} />
      )}
    </div>
  );
}
