import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import HeroDeviceScene from "./HeroDeviceScene";

export default function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden text-[#fa25sd]"
      dir="rtl"
    >
      <HeroBackground />
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-4 sm:px-6 xl:px-10">
        <div className="grid min-h-0 items-start gap-8 py-6 sm:min-h-[90vh] sm:gap-14 sm:py-10 lg:min-h-[92vh] lg:grid-cols-[1.05fr_0.95fr] lg:py-14 xl:gap-20">
          <HeroContent />

          <HeroDeviceScene />
        </div>
      </div>
    </section>
  );
}
