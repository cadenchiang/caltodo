/**
 * Instant route-segment skeleton for /app/home.
 * Next.js renders this during the server round-trip before the client
 * component mounts, eliminating the white flash on cold navigation.
 * Shape mirrors the in-hook skeleton at src/app/app/home/page.tsx:200-217.
 */
export default function HomeLoading() {
  return (
    <div className="h-full overflow-hidden -mx-4 md:-mx-10 -mt-4 md:-mt-10 -mb-4 md:-mb-10">
      <div className="h-40 w-full bg-muted animate-pulse" />
      <div className="px-6 md:px-10 pt-6 space-y-3">
        <div className="h-14 w-14 rounded-lg bg-muted animate-pulse" />
        <div className="h-8 w-1/3 rounded bg-muted animate-pulse" />
      </div>
      <div className="px-6 md:px-10 pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
