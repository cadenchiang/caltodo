import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline",
  description: "You're offline. Reconnect to sync your tasks.",
};

/**
 * Offline fallback page served by the service worker when a navigation
 * request fails because the device has no network.
 *
 * Returns: minimal themed shell using existing CSS variables for parity
 * with light/dark/miffy themes.
 * Edge cases: renders before hydration, so no client hooks or context.
 */
export default function OfflinePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background text-foreground px-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-3">
        <WifiOff size={32} className="text-muted-foreground" aria-hidden />
        <h1 className="text-base font-semibold text-foreground">You&apos;re offline</h1>
        <p className="text-xs text-muted-foreground">
          Reconnect to sync your tasks. CalTodo will load again automatically
          once you&apos;re back online.
        </p>
      </div>
    </main>
  );
}
