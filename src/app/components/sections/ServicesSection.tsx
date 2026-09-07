import FadeUp from "@/app/components/animations/FadeUp";
import { Cpu, Gamepad2, Zap, Wind, Monitor, HardDrive } from "lucide-react";

const services = [
  {
    title: "تعمیر تخصصی برد",
    desc: "عیب‌یابی و تعمیر تخصصی ICها و مدارهای تغذیه کنسول.",
    icon: <Cpu className="text-cyan-400" size={32} />,
    tag: "Hardware",
  },
  {
    title: "رفع دریفت آنالوگ",
    desc: "تعویض آنالوگ و رفع مشکل کشیده شدن دسته PS5 و Xbox.",
    icon: <Gamepad2 className="text-purple-400" size={32} />,
    tag: "Controller",
  },
  {
    title: "تعویض پورت HDMI",
    desc: "تعویض پورت‌های شکسته و رفع مشکل تصویر (4K/120Hz).",
    icon: <Monitor className="text-blue-400" size={32} />,
    tag: "Display",
  },
  {
    title: "سرویس و رفع داغی",
    desc: "تعویض خمیر سیلیکون (یا فلز مایع) و جرم‌گیری کامل فن.",
    icon: <Wind className="text-emerald-400" size={32} />,
    tag: "Cooling",
  },
  {
    title: "تعمیر منبع تغذیه",
    desc: "رفع مشکل روشن نشدن و پریدن فیوز در اثر نوسان برق.",
    icon: <Zap className="text-yellow-400" size={32} />,
    tag: "Power",
  },
  {
    title: "ارتقا و هارد",
    desc: "نصب حافظه SSD پرسرعت و ارتقای ظرفیت کنسول.",
    icon: <HardDrive className="text-pink-400" size={32} />,
    tag: "Storage",
  },
];

export default function ServicesSection() {
  return (
    <section className="relative py-24 bg-[#0505054c]">
      {/* Background Grid - مشابه تصویر هیرو */}
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="container relative mx-auto px-6">
        {/* Header */}
        <div className="mb-20 text-right">
          <span className="mb-4 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Tech Station / خدمات ما
          </span>
          <h2 className="mb-6 text-5xl font-black text-white leading-tight">
            لیست کامل{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-600">
              خدمات فنی
            </span>
          </h2>
          <p className="max-w-2xl text-zinc-500 text-lg">
            تمامی قطعات استفاده شده اورجینال بوده و شامل ضمانت‌نامه کتبی مجموعه
            می‌باشند.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <FadeUp key={index} delay={index * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-8 backdrop-blur-md transition-all duration-500 hover:border-cyan-500/50">
                {/* Glow Effect on Hover */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px] transition-opacity opacity-0 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {service.icon}
                  </div>

                  <div className="mb-2 text-xs font-mono text-zinc-500 uppercase tracking-tighter">
                    {service.tag}
                  </div>

                  <h3 className="mb-4 text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-zinc-400 leading-relaxed text-sm">
                    {service.desc}
                  </p>
                </div>

                {/* Bottom Line Decoration */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-all duration-700 group-hover:w-full" />
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
