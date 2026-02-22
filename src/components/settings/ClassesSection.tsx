"use client";

import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import CourseSelectModal from "@/components/ui/CourseSelectModal";
import type { IntegrationCredentials, CredentialsSavePayload } from "@/lib/types";

/** localStorage key for cached total course counts per platform. */
const TOTALS_KEY = "caltodo_course_totals";

interface CourseTotals {
  canvas: number;
  gradescope: number;
}

interface ClassesSectionProps {
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
}

/**
 * Reads cached course totals from localStorage.
 * @returns Stored totals or null if not found/invalid
 */
function getCachedTotals(): CourseTotals | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOTALS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CourseTotals;
  } catch {
    return null;
  }
}

/**
 * Writes course totals to localStorage.
 * @param totals - The totals to cache
 */
function setCachedTotals(totals: CourseTotals): void {
  try {
    localStorage.setItem(TOTALS_KEY, JSON.stringify(totals));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Unified "Classes" section showing all selected courses from both
 * bCourses and Gradescope as colored chips. Edit opens a full-screen
 * CourseSelectModal with grouped sections.
 *
 * Uses prefixed IDs (canvas-{id} / gs-{id}) internally to avoid
 * collisions between Canvas (number) and Gradescope (string) IDs.
 *
 * @param credentials - Current integration credentials
 * @param onUpdate - Callback with updated credentials after save
 */
export default function ClassesSection({ credentials, onUpdate }: ClassesSectionProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Unified courses for the modal (prefixed IDs)
  const [canvasCourses, setCanvasCourses] = useState<Array<{ id: string; name: string; subtitle?: string }>>([]);
  const [gseCourses, setGseCourses] = useState<Array<{ id: string; name: string; subtitle?: string }>>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const canvasSelected = credentials.selected_canvas_courses ?? [];
  const gsSelected = credentials.selected_gradescope_courses ?? [];
  const totalSelected = canvasSelected.length + gsSelected.length;

  // Count platforms with credentials
  const hasCanvas = !!credentials.canvas_token;
  const hasGradescope = !!credentials.gradescope_email;
  const platformCount = (hasCanvas ? 1 : 0) + (hasGradescope ? 1 : 0);

  // Read cached totals for summary display
  const cachedTotals = getCachedTotals();

  // Don't render if no platform has credentials or saved courses
  if (!hasCanvas && !hasGradescope && totalSelected === 0) {
    return null;
  }

  /**
   * Fetches course lists from both Canvas and Gradescope APIs in parallel.
   * Prefixes IDs with canvas-/gs- to avoid collisions in the unified modal.
   * Pre-selects previously selected courses.
   */
  async function handleEdit() {
    setLoading(true);
    try {
      const promises: Promise<void>[] = [];
      let fetchedCanvas: Array<{ id: string; name: string; subtitle?: string }> = [];
      let fetchedGs: Array<{ id: string; name: string; subtitle?: string }> = [];

      // Fetch Canvas courses if token exists
      if (hasCanvas) {
        promises.push(
          fetch("/api/canvas/courses")
            .then(async (res) => {
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to load bCourses");
              }
              return res.json();
            })
            .then((data) => {
              fetchedCanvas = data.courses.map((c: { id: number; name: string; course_code: string }) => ({
                id: `canvas-${c.id}`,
                name: c.name,
                subtitle: c.course_code,
              }));
            })
        );
      }

      // Fetch Gradescope courses if credentials exist
      if (hasGradescope) {
        promises.push(
          fetch("/api/gradescope/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          })
            .then(async (res) => {
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to load Gradescope courses");
              }
              return res.json();
            })
            .then((data) => {
              fetchedGs = data.courses.map((c: { id: string; name: string; shortName: string }) => ({
                id: `gs-${c.id}`,
                name: c.name,
                subtitle: c.shortName,
              }));
            })
        );
      }

      await Promise.all(promises);

      setCanvasCourses(fetchedCanvas);
      setGseCourses(fetchedGs);

      // Cache total counts
      setCachedTotals({
        canvas: fetchedCanvas.length,
        gradescope: fetchedGs.length,
      });

      // Pre-select previously selected courses
      const prevSelected = new Set<string>();
      canvasSelected.forEach((c) => prevSelected.add(`canvas-${c.id}`));
      gsSelected.forEach((c) => prevSelected.add(`gs-${c.id}`));

      // If no previous selections, select all
      if (prevSelected.size === 0) {
        fetchedCanvas.forEach((c) => prevSelected.add(c.id));
        fetchedGs.forEach((c) => prevSelected.add(c.id));
      }

      setSelectedIds(prevSelected);
      setShowModal(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  /** Toggles a single course's selected state (prefixed ID). */
  function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /**
   * Saves selected courses back to the API.
   * Maps prefixed IDs back to their original types (number for Canvas, string for Gradescope).
   */
  async function handleDone() {
    setSaving(true);
    const allCourses = [...canvasCourses, ...gseCourses];
    const selectedCanvasCourses = canvasCourses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({
        id: parseInt(c.id.replace("canvas-", ""), 10),
        name: c.name,
      }));
    const selectedGsCourses = gseCourses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({
        id: c.id.replace("gs-", ""),
        name: c.name,
      }));

    const payload: CredentialsSavePayload = {
      selected_canvas_courses: selectedCanvasCourses,
      selected_gradescope_courses: selectedGsCourses,
    };

    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const updated: IntegrationCredentials = await res.json();
      onUpdate(updated);
      showToast("Classes updated.");
      setShowModal(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // Build summary text
  const totalAvailable = cachedTotals
    ? cachedTotals.canvas + cachedTotals.gradescope
    : null;
  const summaryCount = totalAvailable
    ? `${totalSelected}/${totalAvailable}`
    : `${totalSelected}`;
  const platformText = platformCount > 1
    ? `from ${platformCount} platforms`
    : platformCount === 1
    ? "from 1 platform"
    : "";

  // Build groups for modal
  const groups = [
    ...(canvasCourses.length > 0
      ? [{ label: "bCourses", courses: canvasCourses, color: "#3b82f6" }]
      : []),
    ...(gseCourses.length > 0
      ? [{ label: "Gradescope", courses: gseCourses, color: "#14b8a6" }]
      : []),
  ];

  const allModalCourses = [...canvasCourses, ...gseCourses];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-subtle-foreground">
          {summaryCount} class{totalSelected !== 1 ? "es" : ""} selected{platformText ? ` ${platformText}` : ""}
        </p>
        <button
          onClick={handleEdit}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Pencil size={12} />}
          {loading ? "Loading..." : "Edit"}
        </button>
      </div>

      {/* Selected course chips */}
      {totalSelected > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {canvasSelected.map((c) => (
            <span
              key={`canvas-${c.id}`}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            >
              {c.name}
            </span>
          ))}
          {gsSelected.map((c) => (
            <span
              key={`gs-${c.id}`}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
            >
              {c.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No classes selected. Tap Edit to choose courses.
        </p>
      )}

      {/* Full-screen course selection modal with groups */}
      <CourseSelectModal
        open={showModal}
        onClose={() => {
          handleDone();
        }}
        title="Select Classes"
        courses={allModalCourses}
        groups={groups.length > 0 ? groups : undefined}
        selectedIds={selectedIds}
        onToggle={handleToggle}
        onSelectAll={() => setSelectedIds(new Set(allModalCourses.map((c) => c.id)))}
        onDeselectAll={() => setSelectedIds(new Set())}
      />
    </div>
  );
}
