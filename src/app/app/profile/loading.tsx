/** Instant skeleton for /app/profile. */
export default function ProfileLoading() {
  return (
    <div className="h-full flex flex-col px-4 md:px-10 pt-4 md:pt-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-56 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-20 rounded-2xl bg-muted animate-pulse" />
        <div className="h-20 rounded-2xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}
