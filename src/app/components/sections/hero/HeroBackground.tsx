export default function HeroBackground() {
  return (
    <>
      {/* gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,0.12),transparent_40%)]" />

      {/* grid */}
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

      {/* glow */}
      <div className="absolute right-[8%] top-24 h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ background: "var(--brand)" }}
      />

      {/* noise */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-screen noise-bg" />
    </>
  );
}
