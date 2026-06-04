/**
 * Route-level loading state for all /app pages.
 *
 * Streams instantly while the server renders the page, so a new tab shows
 * the app frame plus this skeleton instead of hanging on a blank screen
 * (cause: dynamic SSR + auth round-trips on every fresh document request).
 */
export default function AppLoading() {
  return (
    <div className="h-full w-full animate-pulse pt-2" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-44 rounded-lg bg-foreground/10" />
      <div className="mt-6 space-y-3">
        <div className="h-14 rounded-xl bg-foreground/5" />
        <div className="h-14 rounded-xl bg-foreground/5" />
        <div className="h-14 rounded-xl bg-foreground/5" />
        <div className="h-14 w-2/3 rounded-xl bg-foreground/5" />
      </div>
    </div>
  );
}
