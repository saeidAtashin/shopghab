import FadeUp from "@/app/components/animations/FadeUp";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "علی رضایی",
    text: "PS5 من مشکل HDMI داشت و خیلی سریع و حرفه‌ای تعمیر شد.",
  },
  {
    name: "محمد کریمی",
    text: "دسته PS5 دریفت داشت و کامل مثل روز اول شد.",
  },
  {
    name: "پارسا احمدی",
    text: "رفتار حرفه‌ای، قیمت مناسب و تحویل سریع.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-32">
      <div className="container mx-auto px-6">
        {/* Header */}
        <FadeUp>
          <div className="mb-20 text-center">
            <span className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
              نظرات مشتریان
            </span>

            <h2 className="mb-6 text-5xl font-black text-white">
              مشتری‌ها درباره ما چه می‌گویند؟
            </h2>

            <p className="mx-auto max-w-2xl text-lg leading-8 text-zinc-400">
              رضایت مشتری مهم‌ترین سرمایه ماست.
            </p>
          </div>
        </FadeUp>

        {/* Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <FadeUp key={item.name} delay={index * 0.15}>
              <div
                className="
    group
    relative
    flex h-full flex-col justify-between
    overflow-hidden
    rounded-3xl
    border
    border-zinc-800
    bg-white/5
    p-8
    backdrop-blur-xl
    transition-all
    duration-500
    hover:-translate-y-2
    hover:border-blue-500/40
  "
              >
                {/* Glow */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
                </div>

                {/* Stars */}
                <div>
                  <div className="mb-6 flex gap-1 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                  </div>

                  <p className="mb-8 leading-8 text-zinc-300">{item.text}</p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">{item.name}</h4>

                  <span className="text-sm text-zinc-500">مشتری مجموعه</span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
