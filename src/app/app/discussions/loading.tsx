/** Instant skeleton for /app/discussions — list of course rows. */
export default function DiscussionsLoading() {
  return (
    <div className="h-full flex flex-col px-4 md:px-10 pt-4 md:pt-6 max-w-3xl">
      <div className="h-7 w-48 rounded bg-muted animate-pulse mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
