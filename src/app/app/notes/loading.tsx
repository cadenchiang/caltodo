/**
 * Instant skeleton shown while the Notes server component fetches
 * courses, note counts, and recent notes. Without this, the user sees
 * a blank viewport during the server round-trip on route navigation.
 */
export default function NotesLoading() {
  return (
    <div className="w-full h-full px-6 py-6 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
      <div className="mt-8 space-y-2">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-md bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
