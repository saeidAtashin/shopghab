import { Headset, PenLine, ShieldCheck, Truck } from "lucide-react";

const BENEFITS = [
  { icon: Headset, title: "پشتیبانی واقعی", desc: "پاسخ‌گویی ۷ روز هفته" },
  { icon: PenLine, title: "طراحی اختصاصی", desc: "و امکان سفارش طرح دلخواه" },
  { icon: ShieldCheck, title: "ضمانت کیفیت چاپ", desc: "و ماندگاری بالا" },
  { icon: Truck, title: "ارسال سریع", desc: "به سراسر ایران" },
] as const;

export default function HomeBenefits() {
  return (
    <section aria-label="مزیت‌ها" className="hidden rounded-2xl border border-border bg-card/80 xl:block">
      <ul className="grid grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, desc }, index) => (
          <li
            key={title}
            className={`flex items-center gap-3 px-4 py-3.5 ${index > 0 ? "border-s border-border" : ""}`}
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#5145FF]/30 text-[#C4C0FF]">
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
