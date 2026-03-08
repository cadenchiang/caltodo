"use client";

import { useEffect } from "react";

/**
 * Error boundary for the authenticated app routes.
 * Catches unhandled render errors and shows a recovery UI
 * instead of a white screen crash.
 *
 * For ChunkLoadError (stale deployments), auto-reloads the page once.
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
  useEffect(() => {
    const isChunkError =
      error.name === "ChunkLoadError" ||
      error.message?.includes("Loading chunk") ||
      error.message?.includes("Failed to load chunk");

    if (isChunkError) {
      // Prevent infinite reload loops — max 2 retries per session
      const RELOAD_KEY = "caltodo_chunk_reload_count";
      const count = parseInt(sessionStorage.getItem(RELOAD_KEY) ?? "0", 10);
      if (count < 2) {
        sessionStorage.setItem(RELOAD_KEY, String(count + 1));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-20 text-center">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity"
      >
        Reload page
      </button>
    </div>
  );
}
