export default function CheatHubSkeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-8" aria-hidden>
      <div className="rounded-2xl border border-border bg-card/60 p-4">
        <div className="h-10 w-full rounded-xl bg-surface" />
        <div className="mt-3 h-10 w-2/3 rounded-xl bg-surface" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-card/40 p-5"
        >
          <div className="mb-4 h-6 w-1/3 rounded-lg bg-surface" />
          <div className="h-24 rounded-xl bg-surface" />
        </div>
      ))}
    </div>
  );
}
