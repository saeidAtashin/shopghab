const stats = [
  { value: "+1200", label: "تعمیر موفق" },
  { value: "24h", label: "پاسخگویی سریع" },
  { value: "6 ماه", label: "ضمانت خدمات" },
];

export default function HeroStats() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="rounded-3xl border border-border bg-white/[0.045] p-5 backdrop-blur-2xl"
        >
          <div className="text-3xl font-black text-foreground">{stat.value}</div>
          <div className="mt-2 text-sm text-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
