import FadeUp from "@/app/components/animations/FadeUp";
import {
  SITE_ADDRESS,
  SITE_HOURS,
  SITE_PHONE,
  SITE_PHONE_DISPLAY,
  whatsAppUrl,
} from "../../../lib/seo/site";
import {
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  HeadphonesIcon,
} from "lucide-react";
import Link from "next/link";

export default function ContactConsultation() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#00000068] py-24"
    >
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-amber-600/10 blur-[120px]" />
      <div className="absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-orange-700/10 blur-[120px]" />

      <div className="container relative mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeUp>
            <div className="text-right">
              <div className="mb-6 flex items-center justify-end gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
                </span>
                <span className="font-mono text-sm uppercase tracking-[0.2em] text-amber-400">
                  پشتیبانی سفارش
                </span>
              </div>

              <h2 className="mb-8 text-4xl font-black leading-[1.2] text-white md:text-5xl">
                برای انتخاب قاب یا{" "}
                <span className="bg-gradient-to-l from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  طرح سفارشی
                </span>{" "}
                سوال دارید؟
              </h2>

              <p className="mb-10 max-w-xl text-lg leading-relaxed text-zinc-400">
                درباره مدل گوشی، قیمت تقریبی، زمان آماده‌سازی یا چاپ طرح شخصی،
                تیم شاپ‌قاب آماده راهنمایی است.
              </p>

              <div className="mb-8 flex flex-wrap gap-3">
                <Link
                  href="/cases"
                  className="rounded-2xl bg-amber-500 px-5 py-3 font-bold text-black transition hover:bg-amber-400"
                >
                  مشاهده قاب‌ها
                </Link>
                <Link
                  href="/custom"
                  className="rounded-2xl border border-white/15 px-5 py-3 font-bold text-white transition hover:border-amber-400/40"
                >
                  سفارش سفارشی
                </Link>
              </div>

              <div className="space-y-6">
                <div className="group flex items-center justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">ساعات کاری</p>
                    <p className="font-medium text-white">{SITE_HOURS}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-amber-400 transition-colors group-hover:border-amber-500/50">
                    <Clock size={24} />
                  </div>
                </div>

                <div className="group flex items-center justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">آدرس</p>
                    <p className="font-medium text-white">
                      {SITE_ADDRESS.streetAddress}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-amber-400 transition-colors group-hover:border-amber-500/50">
                    <MapPin size={24} />
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          <div className="grid gap-4">
            <FadeUp delay={0.2}>
              <a
                href={`tel:${SITE_PHONE}`}
                className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-8 backdrop-blur-xl transition-all hover:border-amber-500/40 hover:bg-zinc-900/60"
              >
                <div className="absolute right-0 top-0 h-full w-2 translate-x-full transform bg-amber-500 transition-transform duration-500 group-hover:translate-x-0" />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-transform group-hover:scale-110">
                  <Phone size={32} />
                </div>

                <div className="text-right">
                  <h4 className="mb-1 text-2xl font-bold text-white">
                    تماس مستقیم
                  </h4>
                  <p className="text-zinc-400" dir="ltr">
                    {SITE_PHONE_DISPLAY}
                  </p>
                </div>
              </a>
            </FadeUp>

            <FadeUp delay={0.3}>
              <a
                href={whatsAppUrl("سلام، درباره سفارش قاب از شاپ‌قاب سوال دارم.")}
                className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-8 backdrop-blur-xl transition-all hover:border-green-500/40 hover:bg-zinc-900/60"
              >
                <div className="absolute right-0 top-0 h-full w-2 translate-x-full transform bg-green-500 transition-transform duration-500 group-hover:translate-x-0" />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-transform group-hover:scale-110">
                  <MessageCircle size={32} />
                </div>

                <div className="text-right">
                  <h4 className="mb-1 text-2xl font-bold text-white">
                    واتساپ
                  </h4>
                  <p className="text-zinc-400">مشاوره و ارسال طرح</p>
                </div>
              </a>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center">
                <p className="text-sm text-zinc-500">
                  <HeadphonesIcon
                    size={16}
                    className="ml-2 inline text-amber-500"
                  />
                  میانگین زمان پاسخگویی:{" "}
                  <span className="text-amber-400">کمتر از ۱۵ دقیقه</span>
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
