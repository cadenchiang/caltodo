"use client";

import { useRouter } from "next/navigation";

/**
 * Default Canvas integration card shown in the integrations list.
 * Always visible regardless of credentials. Allows users to connect
 * a non-Berkeley Canvas instance (e.g. other schools).
 *
 * Navigates to the Canvas setup flow on click.
 */
export default function CanvasGenericCard() {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <img src="/canvas-logo.png" alt="" className="w-7 h-7 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Another Canvas school</p>
          <p className="text-xs text-muted-foreground truncate">A second Canvas account</p>
        </div>
        <button
          onClick={() => router.push("/app/onboarding?setup=canvas-add")}
          className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer"
        >
          Connect
        </button>
      </div>
    </div>
  );
}
