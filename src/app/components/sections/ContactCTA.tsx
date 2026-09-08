import FadeUp from "@/app/components/animations/FadeUp";
import { SITE_PHONE } from "../../../lib/seo/site";
import {
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  HeadphonesIcon,
} from "lucide-react";

export default function ContactConsultation() {
  return (
    <section
      id="contact"
      className="relative py-24 overflow-hidden bg-[#00000068]"
    >
      {/* Background Decor - مشابه استایل هیرو */}
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />

      <div className="container relative mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left Side: Content */}
          <FadeUp>
            <div className="text-right">
              <div className="mb-6 flex items-center justify-end gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                <span className="text-sm font-mono text-cyan-400 tracking-[0.2em] uppercase">
                  Support Online / آماده پاسخگویی
                </span>
              </div>

              <h2 className="mb-8 text-5xl font-black text-foreground leading-[1.2]">
                نیاز به{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-500">
                  مشاوره فنی
                </span>{" "}
                دارید؟
              </h2>

              <p className="mb-10 text-lg text-muted leading-relaxed max-w-xl">
                اگر در مورد هزینه تعمیر، مدت زمان تحویل یا نوع قطعات سوالی
                دارید، متخصصین ما آماده راهنمایی رایگان شما هستند.
              </p>

              <div className="space-y-6">
                <div className="flex items-center justify-end gap-4 group">
                  <div className="text-right">
                    <p className="text-sm text-muted">ساعات کاری</p>
                    <p className="text-foreground font-medium">
                      شنبه تا پنجشنبه - ۱۰ صبح الی ۹ شب
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
                    <Clock size={24} />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 group">
                  <div className="text-right">
                    <p className="text-sm text-muted">آدرس مرکز</p>
                    <p className="text-foreground font-medium">
                      تهران، مجتمع تجاری پایتخت، طبقه سوم
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
                    <MapPin size={24} />
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Right Side: Contact Cards */}
          <div className="grid gap-4">
            <FadeUp delay={0.2}>
              <a
                href="tel:09107701704"
                className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-border bg-card/40 p-8 backdrop-blur-xl transition-all hover:border-cyan-500/40 hover:bg-card/60"
              >
                <div className="absolute right-0 top-0 h-full w-2 bg-cyan-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:scale-110 transition-transform">
                  <Phone size={32} />
                </div>

                <div className="text-right">
                  <h4 className="text-2xl font-bold text-foreground mb-1">
                    تماس مستقیم
                  </h4>
                  <p className="text-muted">{SITE_PHONE}</p>
                </div>
              </a>
            </FadeUp>

            <FadeUp delay={0.3}>
              <a
                href="https://wa.me/989107701704"
                className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-border bg-card/40 p-8 backdrop-blur-xl transition-all hover:border-green-500/40 hover:bg-card/60"
              >
                <div className="absolute right-0 top-0 h-full w-2 bg-green-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] group-hover:scale-110 transition-transform">
                  <MessageCircle size={32} />
                </div>

                <div className="text-right">
                  <h4 className="text-2xl font-bold text-foreground mb-1">
                    ارسال پیام در واتساپ
                  </h4>
                  <p className="text-muted">
                    مشاوره آنلاین و ارسال عکس دستگاه
                  </p>
                </div>
              </a>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted">
                  <HeadphonesIcon
                    size={16}
                    className="inline ml-2 text-cyan-500"
                  />
                  میانگین زمان پاسخگویی:{" "}
                  <span className="text-cyan-400">کمتر از ۱۵ دقیقه</span>
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
