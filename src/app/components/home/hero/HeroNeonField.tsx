const PETALS = [
  { start: "6%", top: "8%", delay: "0s", duration: "13s", size: 11 },
  { start: "18%", top: "18%", delay: "3.2s", duration: "15s", size: 8 },
  { start: "74%", top: "6%", delay: "1.4s", duration: "12s", size: 9 },
  { start: "86%", top: "22%", delay: "4.6s", duration: "16s", size: 7 },
  { start: "42%", top: "2%", delay: "2.1s", duration: "14s", size: 8 },
  { start: "58%", top: "28%", delay: "6s", duration: "17s", size: 6 },
] as const;

const RIBBONS = [
  "M-120 210C160 20 420 390 720 150S1180 10 1720 230",
  "M-140 390C180 250 520 560 880 320S1320 160 1740 420",
  "M-60 640C120 500 300 780 540 610S900 460 1180 700",
  "M280 70C620 210 860 20 1180 190S1520 380 1760 140",
] as const;

export default function HeroNeonField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#05070e]" />
      <div className="absolute inset-x-0 top-0 h-[62%] bg-[radial-gradient(ellipse_at_50%_-10%,rgba(47,107,255,0.55),transparent_58%)]" />
      <div className="absolute -start-24 top-1/4 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.45),transparent_68%)] blur-3xl" />
      <div className="absolute -end-16 top-8 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28),transparent_70%)] blur-3xl" />
      <div className="absolute -bottom-16 -start-10 h-80 w-96 rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.42),transparent_68%)] blur-3xl" />
      <div className="absolute -bottom-20 end-0 h-72 w-80 rounded-full bg-[radial-gradient(circle,rgba(185,28,28,0.32),transparent_70%)] blur-3xl" />

      <svg
        className="hero-neon-drift absolute -inset-x-[8%] -top-[12%] h-[88%] w-[116%] mix-blend-screen"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="hero-neon-blue" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1d4ed8" stopOpacity="0" />
            <stop offset="0.28" stopColor="#3b82f6" stopOpacity="0.95" />
            <stop offset="0.62" stopColor="#93c5fd" stopOpacity="0.75" />
            <stop offset="1" stopColor="#1e3a8a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-neon-red" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="0.45" stopColor="#60a5fa" stopOpacity="0.55" />
            <stop offset="1" stopColor="#1d4ed8" stopOpacity="0" />
          </linearGradient>
          <filter id="hero-neon-blur" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <g filter="url(#hero-neon-blur)" opacity="0.95">
          {RIBBONS.map((d) => (
            <path key={d} d={d} stroke="url(#hero-neon-blue)" strokeWidth="34" strokeLinecap="round" />
          ))}
          <path d={RIBBONS[2]} stroke="url(#hero-neon-red)" strokeWidth="28" strokeLinecap="round" />
        </g>
      </svg>

      <svg
        className="hero-neon-drift-alt absolute -inset-x-[6%] top-0 h-[78%] w-[112%] mix-blend-screen"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        fill="none"
      >
        {RIBBONS.map((d) => (
          <path
            key={d}
            d={d}
            stroke="#dbeafe"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        ))}
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-x-[12%] bottom-6 h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />

      {PETALS.map((petal) => (
        <span
          key={`${petal.start}-${petal.top}`}
          className="hero-neon-petal absolute rounded-[100%_0_100%_0] bg-[#fb7185] shadow-[0_0_12px_rgba(244,63,94,0.85)]"
          style={{
            insetInlineStart: petal.start,
            top: petal.top,
            width: petal.size,
            height: petal.size * 1.45,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
          }}
        />
      ))}
    </div>
  );
}
