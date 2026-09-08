export default function GamingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:60px_60px]" />
      <div className="absolute left-[-100px] top-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
      <div className="absolute right-[-100px] bottom-[10%] h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
    </div>
  );
}
