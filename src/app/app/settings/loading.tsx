/**
 * Instant skeleton for /app/settings. Shape matches SettingsContent.tsx
 * desktop layout so the transition to the full page is visually seamless.
 */
export default function SettingsLoading() {
  return (
    <div className="hidden md:flex flex-col h-full">
      <div className="flex-1 overflow-auto px-8 pt-20 pb-8">
        <div className="max-w-2xl mx-auto mr-auto ml-[15%] space-y-3">
          <div className="h-6 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          <div className="h-28 rounded-2xl bg-muted animate-pulse mt-4" />
          <div className="h-28 rounded-2xl bg-muted animate-pulse" />
          <div className="h-28 rounded-2xl bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
