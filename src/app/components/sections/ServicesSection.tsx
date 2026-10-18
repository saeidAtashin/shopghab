import FadeUp from "@/app/components/animations/FadeUp";
import { Cpu, Gamepad2, Zap, Wind, Monitor, HardDrive } from "lucide-react";

const services = [
  {
    title: "طراحی قاب",
    desc: "متن، استیکر و تصویر را در شاپ قاب روی قاب گوشی بچینید.",
    icon: <Cpu className="text-cyan-400" size={32} />,
    tag: "Design",
  },
  {
    title: "طرح آماده",
    desc: "فروش قاب موبایل با طرح‌های آماده برای چاپ روی مدل گوشی شما.",
    icon: <Gamepad2 className="text-purple-400" size={32} />,
    tag: "Ready",
  },
  {
    title: "پیش‌نمایش چاپ",
    desc: "قبل از تولید، طرح را روی قاب مدل انتخاب‌شده ببینید.",
    icon: <Monitor className="text-blue-400" size={32} />,
    tag: "Preview",
  },
  {
    title: "چاپ باکیفیت",
    desc: "چاپ طرح روی قاب با رنگ پایدار برای استفاده روزمره.",
    icon: <Wind className="text-emerald-400" size={32} />,
    tag: "Print",
  },
  {
    title: "ارسال سراسری",
    desc: "سفارش قاب موبایل شاپ قاب به سراسر ایران ارسال می‌شود.",
    icon: <Zap className="text-yellow-400" size={32} />,
    tag: "Shipping",
  },
  {
    title: "پیگیری سفارش",
    desc: "وضعیت چاپ و ارسال را با کد سفارش در شاپ قاب ببینید.",
    icon: <HardDrive className="text-pink-400" size={32} />,
    tag: "Tracking",
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
            شاپ قاب / فروش قاب موبایل
          </span>
          <h2 className="mb-6 text-5xl font-black text-foreground leading-tight">
            طراحی و{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-600">
              چاپ قاب
            </span>
          </h2>
          <p className="max-w-2xl text-muted text-lg">
            فروش قاب موبایل با پیش‌نمایش، چاپ باکیفیت و ارسال به سراسر ایران.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <FadeUp key={index} delay={index * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-md transition-all duration-500 hover:border-cyan-500/50">
                {/* Glow Effect on Hover */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px] transition-opacity opacity-0 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-surface border border-border shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {service.icon}
                  </div>

                  <div className="mb-2 text-xs font-mono text-muted uppercase tracking-tighter">
                    {service.tag}
                  </div>

                  <h3 className="mb-4 text-xl font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-muted leading-relaxed text-sm">
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
