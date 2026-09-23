"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import IntegrationLogo from "@/components/ui/IntegrationLogo";
import { BRAND } from "@/lib/copy";
import { isCleanSync, type SyncStats } from "@/lib/onboarding-sync-stats";

/** The bar never finishes before the sync has, and never shorter than this. */
export const MIN_SYNC_DISPLAY_MS = 1500;
/** Hold on the full bar and checkmark before the recap replaces it. */
export const DONE_HOLD_MS = 600;
/** Progress bar tick while the request is in flight. */
const TICK_MS = 100;
/** Ceiling the bar creeps toward until the sync resolves. */
const PENDING_CEILING = 90;
/** Where the "Fix in settings" link sends a user whose sources failed. */
export const INTEGRATIONS_SETTINGS_PATH = "/app/settings?section=integrations";

/** Status lines cycled while syncing. */
export const SYNC_BLURBS = [
  "Hunting down sneaky deadlines...",
  "Untangling your schedule...",
  "Cross-referencing due dates...",
  "Decoding mysterious syllabi...",
  "Indexing your assignments...",
  "Almost there, hang tight...",
];

export interface DoneStepProps {
  /** Called when the user leaves. Receives the destination path. */
  onComplete: (destination?: string) => void;
  /** Runs the sync; resolves when the request has settled either way. */
  triggerSync: () => Promise<void>;
  /** Reads the latest sync result into recap stats. Read after triggerSync settles. */
  getSyncStats: () => SyncStats | null;
}

/**
 * Final onboarding step. Runs the sync, shows a progress bar driven by the
 * real request (with a short minimum so it does not flash), then a recap
 * that names every source that failed instead of claiming success.
 *
 * @param onComplete - Exit handler; gets INTEGRATIONS_SETTINGS_PATH from "Fix in settings"
 * @param triggerSync - The sync promise the bar waits on
 * @param getSyncStats - Stats reader, called once the sync has settled
 * @remarks getSyncStats is read through a ref so the recap sees the result
 *          that arrived after mount, not the null captured at mount.
 */
export default function DoneStep({ onComplete, triggerSync, getSyncStats }: DoneStepProps) {
  const [progress, setProgress] = useState(0);
  const [blurbIndex, setBlurbIndex] = useState(0);
  const [phase, setPhase] = useState<"syncing" | "complete">("syncing");
  const [stats, setStats] = useState<SyncStats | null>(null);
  const getStatsRef = useRef(getSyncStats);
  getStatsRef.current = getSyncStats;

  // Runs once: sync and the minimum display time race together, then the
  // bar fills, holds briefly, and the recap takes over.
  useEffect(() => {
    let cancelled = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    const minimum = new Promise<void>((resolve) => setTimeout(resolve, MIN_SYNC_DISPLAY_MS));
    const sync = triggerSync().catch((err: unknown) => {
      // triggerSync reports failures through TaskContext; a rejection here
      // would only be a programming error, which must still not strand the user.
      console.error("[onboarding] sync promise rejected", err);
    });
    Promise.all([sync, minimum]).then(() => {
      if (cancelled) return;
      setProgress(100);
      holdTimer = setTimeout(() => {
        if (cancelled) return;
        setStats(getStatsRef.current());
        setPhase("complete");
      }, DONE_HOLD_MS);
    });
    return () => {
      cancelled = true;
      if (holdTimer) clearTimeout(holdTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Creep toward the ceiling while pending; the effect above sets 100.
  useEffect(() => {
    if (phase !== "syncing") return;
    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      if (tick % 24 === 0) setBlurbIndex((i) => (i + 1) % SYNC_BLURBS.length);
      setProgress((p) => (p >= PENDING_CEILING ? p : Math.min(PENDING_CEILING, p + (PENDING_CEILING - p) * 0.08 + 0.5)));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  if (phase === "syncing") {
    const shown = Math.round(progress);
    return (
      <div key="syncing" className="px-2 animate-phase-in -mt-[15vh]">
        <img src="/logo.png" alt={BRAND} className="h-10 dark:invert mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Setting up your account</h2>
        <p className="text-sm text-muted-foreground mb-8 min-h-5" aria-live="polite">
          {SYNC_BLURBS[blurbIndex]}
        </p>
        <div
          role="progressbar"
          aria-label="Sync progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={shown}
          className="w-full h-4 rounded-full bg-muted overflow-hidden mb-3"
        >
          <div
            className="h-full rounded-l-full bg-blue-500 transition-[width] duration-200 ease-out"
            style={{ width: `${shown}%` }}
          />
        </div>
        <div className="flex items-center gap-2 h-6">
          {shown >= 100 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 animate-check-in">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white">
                <Check size={12} strokeWidth={3} aria-hidden="true" />
              </span>
              Done
            </span>
          ) : (
            <p className="text-sm font-medium text-foreground tabular-nums">{shown}%</p>
          )}
        </div>
      </div>
    );
  }

  return <SyncRecap stats={stats} onComplete={onComplete} />;
}

/**
 * Recap shown once the sync has settled.
 *
 * @param stats - Built stats, or null when nothing synced and nothing failed
 * @param onComplete - Exit handler
 */
function SyncRecap({ stats, onComplete }: { stats: SyncStats | null; onComplete: (destination?: string) => void }) {
  const clean = isCleanSync(stats);
  const heading = stats?.syncError
    ? "Sync did not finish"
    : clean
      ? "You're all set."
      : "Synced with some problems";
  const subheading = stats?.syncError
    ? "We could not reach your platforms. You can retry from settings."
    : clean
      ? "Here's what we synced."
      : "Some sources could not sync. The rest is ready.";

  return (
    <div key="complete" className="px-2 animate-phase-in">
      <img src="/logo.png" alt={BRAND} className="h-10 dark:invert mb-6" />
      <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{heading}</h2>
      <p className="text-sm text-muted-foreground mb-8">{subheading}</p>

      {!clean && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger-tint p-3 mb-3 text-left">
          {stats?.syncError && <p className="text-sm text-red-600 dark:text-red-400">{stats.syncError}</p>}
          {stats?.sourceErrors.map((row) => (
            <p key={row.provider} className="text-sm text-red-600 dark:text-red-400">
              <span className="font-semibold">{row.label}:</span> {row.message}
            </p>
          ))}
          <button
            type="button"
            onClick={() => onComplete(INTEGRATIONS_SETTINGS_PATH)}
            className="mt-2 text-sm font-medium text-blue-500 hover:underline"
          >
            Fix in settings
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <StatTile value={stats?.total ?? 0} singular="Assignment" plural="Assignments" />
        <StatTile value={stats?.courses.length ?? 0} singular="Class" plural="Classes" />
      </div>

      {stats && stats.perSource.length > 0 && (
        <div className="bg-muted rounded-2xl p-3 mb-3 flex flex-col gap-2">
          {stats.perSource.map((row) => (
            <div key={row.provider} className="flex items-center gap-3 px-2 py-2 rounded-xl bg-card">
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                {row.provider === "syllabus" ? (
                  <FileText size={14} className="text-secondary-foreground" aria-hidden="true" />
                ) : (
                  <IntegrationLogo provider={row.provider} size="md" decorative />
                )}
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-foreground">{row.label}</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {row.count} {row.count === 1 ? "assignment" : "assignments"}
              </span>
            </div>
          ))}
        </div>
      )}

      {stats && stats.courses.length > 0 && (
        <div className="bg-muted rounded-2xl px-4 py-4 mb-8 text-left">
          <p className="text-xs font-medium text-foreground mb-2.5">Your classes</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.courses.slice(0, 14).map((name) => (
              <span key={name} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-card text-foreground">
                {name}
              </span>
            ))}
            {stats.courses.length > 14 && (
              <span className="text-xs font-medium px-2.5 py-1 text-foreground">
                +{stats.courses.length - 14} more
              </span>
            )}
          </div>
        </div>
      )}

      {clean && (
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 mb-4">
          <span className="relative inline-flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>
          Live sync is on. New assignments appear automatically.
        </p>
      )}

      <Button variant="inverted" size="lg" className="w-full" onClick={() => onComplete()}>
        Let&apos;s go
      </Button>
    </div>
  );
}

/**
 * One big-number tile in the recap.
 *
 * @param value - The count
 * @param singular - Label when value is 1
 * @param plural - Label otherwise
 */
function StatTile({ value, singular, plural }: { value: number; singular: string; plural: string }) {
  return (
    <div className="bg-muted rounded-2xl px-4 py-5">
      <p className="text-4xl font-bold text-foreground tabular-nums tracking-tight">{value}</p>
      <p className="text-xs font-medium text-foreground mt-1.5">{value === 1 ? singular : plural}</p>
    </div>
  );
}
