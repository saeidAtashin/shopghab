export default function DesignsBrowseLoading() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-card" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded bg-card" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
    </div>
  );
}
