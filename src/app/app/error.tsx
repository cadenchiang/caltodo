"use client";

/**
 * Error boundary for the authenticated app routes.
 * Catches unhandled render errors and shows a recovery UI
 * instead of a white screen crash.
 *
 * @param error - The error that was thrown
 * @param reset - Function to retry rendering the failed component tree
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-20 text-center">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
