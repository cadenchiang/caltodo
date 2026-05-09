/**
 * Instant skeleton for /app/discussions. Matches the sidebar + chat-bubble
 * layout the page renders post-mount so there's no second skeleton flash
 * when the route-level loading.tsx hands off to the page itself.
 */
export default function DiscussionsLoading() {
  return (
    <div className="absolute inset-0 flex">
      {/* Sidebar skeleton — chat row placeholders (matches page.tsx) */}
      <div className="hidden md:flex w-72 shrink-0 border-r border-black/30 dark:border-white/20 flex-col">
        <div className="px-4 pt-5 pb-3 shrink-0">
          <div className="h-6 w-24 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex-1 px-2 py-1.5 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-24 rounded bg-muted" />
                <div className="h-3 w-36 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Center column skeleton — header + bubble placeholders */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-black/30 dark:border-white/20 shrink-0">
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex gap-2 animate-pulse ${i % 3 === 0 ? "flex-row-reverse" : ""}`}
            >
              <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
              <div
                className={`rounded-2xl bg-muted ${
                  i % 3 === 0 ? "w-40" : i % 2 === 0 ? "w-52" : "w-32"
                } h-9`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
