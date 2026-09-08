import Image from "next/image";

import HomeHeroContent from "./HomeHeroContent";

export default function HomeHero() {
  return (
    <section
      className="relative isolate min-h-svh w-full overflow-hidden"
      aria-labelledby="home-hero-heading"
    >
      <Image
        src="/images/banner-shopghab-org.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[80%_center] sm:object-[70%_center] lg:object-right"
      />

      <div
        className="absolute inset-0 bg-linear-to-r from-black/90 via-black/55 to-transparent sm:from-black/85 sm:via-black/45"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-svh items-center justify-end px-4 pb-12 pt-24 sm:px-8 lg:px-12">
        <div className="w-full max-w-xl">
          <HomeHeroContent variant="onDark" />
        </div>
      </div>
    </section>
  );
}
