import { Palette, Shield, Truck } from "lucide-react";

const BENEFITS = [
  { icon: Palette, title: "طراحی زنده", desc: "متن و استیکر را لحظه‌ای ببین" },
  { icon: Truck, title: "ارسال سریع", desc: "چاپ با کیفیت و ارسال به سراسر ایران" },
  { icon: Shield, title: "گارانتی", desc: "۷ روز ضمانت بازگشت" },
] as const;

export default function HomeBenefits() {
  return (
    <section aria-label="مزیت‌ها" className="rounded-2xl border border-border bg-card/80">
      <ul className="grid gap-0 sm:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, desc }, index) => (
          <li
            key={title}
            className={`flex items-center gap-3 px-4 py-3.5 ${index > 0 ? "border-t border-border sm:border-t-0 sm:border-s" : ""}`}
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5145FF]/15 text-[#C4C0FF]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-foreground">{title}</span>
              <span className="block text-xs leading-5 text-muted">{desc}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
