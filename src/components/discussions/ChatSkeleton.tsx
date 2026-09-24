/**
 * The one set of chat skeletons. loading.tsx, the list page, the room page
 * and the sidebar all used to carry their own copy of these placeholders,
 * which drifted; they now render these so every loading frame matches the
 * mounted layout exactly and there is no second skeleton flash.
 */

/** Placeholder rows for the conversation list. */
export function ChatListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-1" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse motion-reduce:animate-none">
          <div className="w-11 h-11 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-24 rounded bg-muted" />
            <div className="h-3 w-36 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder bubbles for the message area. */
export function ChatMessagesSkeleton() {
  return (
    <div className="p-4 space-y-4" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`flex gap-2 animate-pulse motion-reduce:animate-none ${i % 3 === 0 ? "flex-row-reverse" : ""}`}
        >
          <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
          <div className={`rounded-2xl bg-muted ${i % 3 === 0 ? "w-40" : i % 2 === 0 ? "w-52" : "w-32"} h-9`} />
        </div>
      ))}
    </div>
  );
}

/**
 * Full-page skeleton: sidebar list (md and up) plus a room header and
 * bubbles. Used by loading.tsx, the list page while boards load, and the
 * room page while onboarding status resolves.
 */
export function ChatPageSkeleton() {
  return (
    <div className="absolute inset-0 flex" role="status" aria-label="Loading chats">
      <div className="hidden md:flex w-72 shrink-0 border-r border-border flex-col">
        <div className="px-4 pt-5 pb-3 shrink-0">
          <div className="h-6 w-24 rounded bg-muted animate-pulse motion-reduce:animate-none" />
        </div>
        <div className="flex-1 px-2 py-1.5">
          <ChatListSkeleton />
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-40 rounded bg-muted animate-pulse motion-reduce:animate-none" />
            <div className="h-2.5 w-24 rounded bg-muted animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatMessagesSkeleton />
        </div>
      </div>
    </div>
  );
}
