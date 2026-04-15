/** Instant skeleton for /app/inbox — shaped like the task list. */
export default function InboxLoading() {
  return (
    <div className="h-full flex flex-col px-4 md:px-10 pt-4 md:pt-6">
      <div className="h-8 w-32 rounded bg-muted animate-pulse mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
