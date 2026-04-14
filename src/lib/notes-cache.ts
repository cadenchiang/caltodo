/**
 * localStorage cache for the Notes page — enables stale-while-revalidate
 * rendering so repeat visits paint instantly while fresh data loads in
 * the background. Mirrors the pattern in TaskContext.tsx.
 */
import type { Note } from "@/lib/types";

const CACHE_VERSION = 1;
const NOTES_KEY_PREFIX = "caltodo_notes_cache_v1:";
const FOLDERS_KEY = "caltodo_notes_folders_cache_v1";

interface CachedEnvelope<T> {
  version: number;
  data: T;
}

interface CachedFolders {
  courses: unknown[];
  noteCounts: Record<string, number>;
  recentNotes: Note[];
}

/**
 * Reads cached notes for a given courseId scope. Returns null if the
 * cache is missing, malformed, or from an older schema version.
 *
 * @param courseId - Same scope key passed to useNotes ("general" | UUID | "id1,id2" | null)
 */
export function getCachedNotes(courseId: string | null): Note[] | null {
  if (typeof window === "undefined" || courseId === null) return null;
  try {
    const raw = localStorage.getItem(NOTES_KEY_PREFIX + courseId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEnvelope<Note[]>;
    if (parsed.version !== CACHE_VERSION) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Writes notes to the cache for a given courseId scope. Silently no-ops
 * on SSR or localStorage quota errors.
 */
export function setCachedNotes(courseId: string | null, notes: Note[]): void {
  if (typeof window === "undefined" || courseId === null) return;
  try {
    const envelope: CachedEnvelope<Note[]> = { version: CACHE_VERSION, data: notes };
    localStorage.setItem(NOTES_KEY_PREFIX + courseId, JSON.stringify(envelope));
  } catch {
    // Quota exceeded or storage unavailable — non-fatal
  }
}

/**
 * Reads the cached folder-grid bundle (courses, note counts, recent notes).
 * Returns null on first visit or when stale.
 */
export function getCachedFolders(): CachedFolders | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEnvelope<CachedFolders>;
    if (parsed.version !== CACHE_VERSION) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Writes the folder-grid bundle to localStorage after a fresh server render.
 */
export function setCachedFolders(data: CachedFolders): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: CachedEnvelope<CachedFolders> = { version: CACHE_VERSION, data };
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(envelope));
  } catch {
    // Non-fatal
  }
}
