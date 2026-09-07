import FadeUp from "@/app/components/animations/FadeUp";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  ShieldCheck,
  Wrench,
  Clock3,
} from "lucide-react";

const values = [
  {
    title: "تخصص در تعمیر کنسول",
    description:
      "FixBazi روی PS5، PS4، Xbox و دسته بازی تمرکز دارد — از HDMI تا آنالوگ.",
    icon: Wrench,
  },
  {
    title: "ضمانت واقعی",
    description: "هر تعمیر با گارانتی ارائه می‌شود تا با خیال راحت بازی کنید.",
    icon: ShieldCheck,
  },
  {
    title: "قطعات اورجینال",
    description:
      "فقط قطعات باکیفیت و اصل برای افزایش عمر دستگاه استفاده می‌شود.",
    icon: BadgeCheck,
  },
  {
    title: "فرآیند شفاف",
    description:
      "از عیب‌یابی تا اعلام هزینه و پیگیری آنلاین — همه‌چیز روشن و قابل پیگیری است.",
    icon: Clock3,
  },
];

export default function AboutFixBazi() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[100px]" />

      <div className="container relative mx-auto px-6">
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
              درباره FixBazi
            </span>
            <h2 className="text-4xl font-black text-white md:text-5xl">
              مرکز تخصصی{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-500">
                تعمیر کنسول
              </span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              FixBazi (فیکس‌بازی) با تمرکز بر عیب‌یابی دقیق، قطعات اورجینال و
              تحویل سریع، خدمات تعمیر PS5، PS4، Xbox و دسته بازی را در تهران
              ارائه می‌دهد. هدف ما یک تجربه شفاف و قابل اعتماد است — از ثبت
              سفارش آنلاین تا پیگیری وضعیت تعمیر.
            </p>
          </div>
        </FadeUp>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item, index) => (
            <FadeUp key={item.title} delay={index * 0.1}>
              <div className="h-full rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-xl transition-colors hover:border-cyan-500/30">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  {item.description}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.4}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about-us"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-400/50 hover:bg-cyan-500/10"
            >
              بیشتر بدانید
              <ArrowLeft size={16} />
            </Link>
            <Link
              href="/repair"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
            >
              ثبت سفارش تعمیر
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 px-6 py-3 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/10"
            >
              تماس با ما
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
