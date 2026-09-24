/** Instant skeleton for /app/calendar — shaped like the week grid header. */
export default function CalendarLoading() {
  return (
    <div className="h-full flex flex-col px-2 md:px-4 pt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-32 rounded bg-muted animate-pulse" />
        <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-7 gap-px border border-border rounded-2xl overflow-hidden flex-1">
        {Array.from({ length: 7 * 5 }).map((_, i) => (
          <div key={i} className="bg-muted/60 animate-pulse min-h-[60px]" />
        ))}
      </div>
    </div>
  );
}
