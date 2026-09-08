import FadeUp from "@/app/components/animations/FadeUp";
import ServiceCard from "@/app/components/ui/ServiceCard";

import { services } from "@/app/data/services";

export default function Services() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Glow */}
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="container mx-auto px-6">
        {/* Header */}
        <FadeUp>
          <div className="mb-20 text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-400 backdrop-blur-xl">
              خدمات تخصصی
            </span>

            <h2 className="mb-6 text-4xl font-black text-foreground md:text-6xl">
              خدمات تعمیرات کنسول
            </h2>

            <p className="mx-auto max-w-2xl text-base leading-8 text-muted md:text-lg">
              تعمیر تخصصی انواع کنسول بازی، دسته و HDMI با تجهیزات حرفه‌ای و
              ضمانت خدمات
            </p>
          </div>
        </FadeUp>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-5">
          {services.map((service, index) => (
            <FadeUp key={service.slug} delay={index * 0.08}>
              <div className="h-full">
                <ServiceCard
                  brand={
                    service.title?.includes("Xbox") ? "xbox" : "playstation"
                  }
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  slug={service.slug}
                />
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
