export default function SiteBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute left-[-120px] top-[8%] h-[420px] w-[420px] rounded-full bg-amber-600/15 blur-3xl" />
      <div className="absolute right-[-100px] bottom-[12%] h-[380px] w-[380px] rounded-full bg-orange-700/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-500/10 blur-3xl" />
    </div>
  );
}
