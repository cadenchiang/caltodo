import Skeleton from "@/components/ui/Skeleton";

/**
 * Instant skeleton for /app/calendar. Mirrors CalendarPanel's wrapper (the
 * same header padding and the bordered grid card with mx-4 md:mx-8) so the
 * grid lands where the real one does. It draws a month grid regardless of
 * the saved view; the panel reads the saved view in its state initializer,
 * so there is no month-then-week flip once it mounts.
 */
export default function CalendarLoading() {
  return (
    <div className="flex flex-col flex-1 h-full -m-4 md:-m-10">
      <div className="px-4 md:px-8 pt-4 md:pt-5 pb-3 shrink-0 flex items-center gap-2">
        <Skeleton shape="circle" />
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="ml-auto h-8 w-32 rounded-xl" />
      </div>
      <div className="flex-1 flex flex-col mx-4 md:mx-8 rounded-2xl border border-border bg-card overflow-hidden min-h-0">
        <div className="grid grid-cols-7 flex-1 min-h-0" role="status" aria-busy="true">
          <span className="sr-only">Loading calendar</span>
          {Array.from({ length: 7 * 5 }).map((_, i) => (
            <div key={i} className={`${(i + 1) % 7 === 0 ? "" : "border-r"} border-b border-border p-1 min-h-[56px] md:min-h-[64px]`}>
              <Skeleton className="w-5 h-5 rounded-full mx-auto mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
