/**
 * Local persistence for onboarding progress.
 *
 * The flow used to hold its step in `useState("welcome")` with nothing
 * restoring it, so every reload dropped the user back at the first screen. In
 * 30 days of production data only 35 of 125 people saw the welcome step
 * exactly once; 90 saw it two or more times, one of them ten times. That both
 * cost real completions and corrupted the funnel, since a reset looked
 * identical to a fresh start.
 *
 * Progress lives in localStorage rather than the database: it is a per-device
 * convenience, needs no migration, and must never block the flow if it fails.
 * Every entry point is therefore total, returning a safe default instead of
 * throwing when storage is unavailable (private windows, disabled cookies).
 */

/** Every step the flow can rest on, in canonical order. */
export const ONBOARDING_STEPS = [
  "welcome",
  "school",
  "referral",
  "platforms",
  "gcal",
  "canvas",
  "gradescope",
  "pensieve",
  "brightspace",
  "blackboard",
  "classroom",
  "syllabus",
  "done",
] as const;

/** A single step of the onboarding flow. */
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** Platforms a user can choose to connect. */
export const ONBOARDING_PLATFORMS = [
  "gcal",
  "canvas",
  "gradescope",
  "pensieve",
  "brightspace",
  "blackboard",
  "classroom",
  "syllabus",
] as const;

/** A platform selectable on the "platforms" step. */
export type OnboardingPlatform = (typeof ONBOARDING_PLATFORMS)[number];

/**
 * Storage key. Versioned so that changing the shape below retires old entries
 * instead of forcing them through a migration.
 */
const STORAGE_KEY = "caltodo_onboarding_progress_v1";

/**
 * How long a saved position stays valid.
 *
 * Long enough to survive an abandoned session resumed days later, short enough
 * that a months-old entry does not drop a returning user into a half-finished
 * flow whose steps may no longer mean the same thing.
 */
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** A restorable snapshot of where the user had got to. */
export interface OnboardingProgress {
  /** The step to resume on. */
  step: OnboardingStep;
  /** Platforms picked so far; the step list is derived from these. */
  platforms: OnboardingPlatform[];
  /** School name entered on the "school" step, if any. */
  school: string;
  /** Referral answer given on the "referral" step, if any. */
  referral: string;
  /** Epoch milliseconds the snapshot was written. */
  savedAt: number;
}

/**
 * Narrows an unknown value to a known step.
 *
 * @param value - Candidate step name.
 * @returns True when `value` is one of `ONBOARDING_STEPS`.
 */
export function isOnboardingStep(value: unknown): value is OnboardingStep {
  return typeof value === "string"
    && (ONBOARDING_STEPS as readonly string[]).includes(value);
}

/**
 * Narrows an unknown value to a known platform.
 *
 * @param value - Candidate platform name.
 * @returns True when `value` is one of `ONBOARDING_PLATFORMS`.
 */
export function isOnboardingPlatform(value: unknown): value is OnboardingPlatform {
  return typeof value === "string"
    && (ONBOARDING_PLATFORMS as readonly string[]).includes(value);
}

/**
 * Validates and normalises a parsed snapshot.
 *
 * Exported for tests and reused by `loadProgress`. Unknown platforms are
 * dropped rather than rejecting the whole snapshot, so adding or removing a
 * platform never strands a user mid-flow. An unknown step, by contrast,
 * invalidates the snapshot: there is nowhere safe to resume to.
 *
 * @param raw - Value parsed from storage, of unknown shape.
 * @returns A usable snapshot, or null if it is unusable or expired.
 */
export function normalizeProgress(raw: unknown): OnboardingProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;

  if (!isOnboardingStep(value.step)) return null;

  const savedAt = typeof value.savedAt === "number" ? value.savedAt : 0;
  if (!savedAt || Date.now() - savedAt > TTL_MS) return null;

  const platforms = Array.isArray(value.platforms)
    ? value.platforms.filter(isOnboardingPlatform)
    : [];

  // A resumed platform step is only reachable if that platform is still
  // selected; otherwise the step list would not contain it and the flow
  // would render nothing.
  if (isOnboardingPlatform(value.step) && !platforms.includes(value.step)) {
    return null;
  }

  return {
    step: value.step,
    platforms,
    school: typeof value.school === "string" ? value.school : "",
    referral: typeof value.referral === "string" ? value.referral : "",
    savedAt,
  };
}

/**
 * Reads the saved position, if there is a usable one.
 *
 * @returns The snapshot to resume from, or null when nothing is stored, the
 *          entry is corrupt or expired, or storage is unavailable.
 */
export function loadProgress(): OnboardingProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeProgress(JSON.parse(raw));
  } catch {
    // Corrupt JSON, disabled storage, or a private window. Start fresh.
    return null;
  }
}

/**
 * Writes the current position.
 *
 * Silently does nothing on failure: losing the ability to resume is a far
 * smaller problem than breaking the flow the user is standing in.
 *
 * @param progress - Position to save, minus the timestamp, which is stamped here.
 */
export function saveProgress(progress: Omit<OnboardingProgress, "savedAt">): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...progress, savedAt: Date.now() }),
    );
  } catch {
    /* Storage full or unavailable; resuming is best-effort. */
  }
}

/**
 * Discards the saved position.
 *
 * Called once onboarding is finished or deliberately skipped, so a later visit
 * does not resume a flow the user has already left behind.
 */
export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Nothing to do; a stale entry expires on its own via TTL_MS. */
  }
}
