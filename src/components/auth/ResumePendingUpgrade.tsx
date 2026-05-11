"use client";

import { useEffect } from "react";

/**
 * On mount, checks sessionStorage for an upgrade intent stashed by the
 * landing pricing card before it redirected an unauthenticated user to
 * /login. If found, clears it and POSTs to /api/stripe/checkout (or the
 * dev grant on localhost without Stripe keys) so the user lands on Stripe
 * checkout without having to re-click "Start Pro" after signing in.
 *
 * Idempotent: removeItem runs before the network call, so a re-render or
 * a remount cannot trigger the upgrade twice.
 */
const STORAGE_KEY = "caltodo_pending_upgrade";

/** Intent stashed by the pricing card. ts is used to drop stale entries. */
interface PendingUpgrade {
  interval: "month" | "year";
  ts: number;
}

const MAX_AGE_MS = 15 * 60 * 1000;

export default function ResumePendingUpgrade() {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      let raw: string | null = null;
      try {
        raw = sessionStorage.getItem(STORAGE_KEY);
      } catch {
        return;
      }
      if (!raw) return;
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }

      let parsed: PendingUpgrade;
      try {
        parsed = JSON.parse(raw) as PendingUpgrade;
      } catch {
        return;
      }
      if (
        !parsed ||
        (parsed.interval !== "month" && parsed.interval !== "year") ||
        typeof parsed.ts !== "number" ||
        Date.now() - parsed.ts > MAX_AGE_MS
      ) {
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: parsed.interval }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        alreadyPro?: boolean;
        devGrantAvailable?: boolean;
        message?: string;
      };
      if (cancelled) return;

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.alreadyPro) {
        // Already paying — no-op, the user is back on /app and that's fine.
        return;
      }
      if (res.status === 503 && data.devGrantAvailable) {
        await fetch("/api/dev/grant-pro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interval: parsed.interval }),
        }).catch(() => null);
        // Soft refresh so the entitlement hook picks up the new plan.
        if (!cancelled) window.location.reload();
      }
      // Any other failure mode is left silent: the user is already inside
      // the app and we don't want to surface a noisy alert on first paint.
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
