import { Wrench, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    icon: Wrench,
    text: "عیب‌یابی دقیق و تخصصی",
  },
  {
    icon: ShieldCheck,
    text: "استفاده از قطعات اصلی",
  },
  {
    icon: Zap,
    text: "تحویل سریع و امن",
  },
];

export default function HeroFeatures() {
  return (
    <div className="mt-10 grid gap-4 grid-cols-3">
      {features.map((item, i) => {
        const Icon = item.icon;

        return (
          <div
            key={i}
            className="group relative flex md:flex-row flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-zinc-300 backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-white/[0.06]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 transition group-hover:bg-cyan-400/20">
              <Icon size={18} />
            </div>

            <p className="text-sm font-medium">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}
