"use client";

import { useState, useMemo } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import CourseSelectModal from "@/components/ui/CourseSelectModal";
import ClassChangeConfirmDialog from "@/components/settings/ClassChangeConfirmDialog";
import type { IntegrationCredentials, CredentialsSavePayload } from "@/lib/types";

/** localStorage key for cached total course counts per platform. */
const TOTALS_KEY = "caltodo_course_totals";

interface CourseTotals {
  canvas: number;
  gradescope: number;
  pensieve: number;
}

/** Snapshot of class changes computed when the user closes the course modal. */
interface PendingChanges {
  newCanvasCourses: Array<{ id: number; name: string }>;
  newGsCourses: Array<{ id: string; name: string }>;
  newPensieveCourses: Array<{ id: string; name: string }>;
  addedCanvasCourses: Array<{ id: number; name: string }>;
  addedGsCourses: Array<{ id: string; name: string }>;
  addedPensieveCourses: Array<{ id: string; name: string }>;
  addedNames: string[];
  removedNames: string[];
  removedTaskCount: number;
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
 * Unified "Classes" section showing all selected courses from
 * bCourses, Gradescope, and Pensieve as colored chips. Edit opens a
 * full-screen CourseSelectModal with grouped sections. Changes require
 * confirmation before saving — added classes trigger a sync, removed
 * classes delete tasks.
 *
 * @param credentials - Current integration credentials
 * @param onUpdate - Callback with updated credentials after save
 */
export default function ClassesSection({ credentials, onUpdate }: ClassesSectionProps) {
  const { showToast } = useToast();
  const { tasks, fetchTasks, dismissTasksByCourseNames, undismissTasksByCourseNames } = useTaskContext();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges | null>(null);

  // Unified courses for the modal (prefixed IDs)
  const [canvasCourses, setCanvasCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [gseCourses, setGseCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [pensieveCourses, setPensieveCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const canvasSelected = credentials.selected_canvas_courses ?? [];
  const gsSelected = credentials.selected_gradescope_courses ?? [];
  const pensieveSelected = credentials.selected_pensieve_courses ?? [];

  /** Unique course names from syllabus-imported tasks, sorted alphabetically. */
  const syllabusCourses = useMemo(() => {
    const names = new Set<string>();
    for (const t of tasks) {
      if (t.source === "syllabus" && t.course_name) {
        names.add(t.course_name);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const hasSyllabus = syllabusCourses.length > 0;
  const totalSelected = canvasSelected.length + gsSelected.length + pensieveSelected.length + syllabusCourses.length;

  const hasCanvas = !!credentials.canvas_token;
  const hasGradescope = !!credentials.gradescope_email;
  const hasPensieve = !!credentials.pensieve_calendar_url;
  const platformCount = (hasCanvas ? 1 : 0) + (hasGradescope ? 1 : 0) + (hasPensieve ? 1 : 0) + (hasSyllabus ? 1 : 0);
  const cachedTotals = getCachedTotals();

  if (!hasCanvas && !hasGradescope && !hasPensieve && !hasSyllabus && totalSelected === 0) {
    return null;
  }

  /**
   * Fetches course lists from Canvas, Gradescope, and Pensieve APIs in parallel.
   * Prefixes IDs with canvas-/gs-/pensieve- to avoid collisions in the unified modal.
   * Pre-selects previously selected courses.
   */
  async function handleEdit() {
    setLoading(true);
    try {
      const promises: Promise<void>[] = [];
      let fetchedCanvas: Array<{ id: string; name: string }> = [];
      let fetchedGs: Array<{ id: string; name: string }> = [];
      let fetchedPensieve: Array<{ id: string; name: string }> = [];

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
              fetchedCanvas = data.courses.map((c: { id: number; name: string }) => ({
                id: `canvas-${c.id}`,
                name: c.name,
              }));
            })
        );
      }

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
              fetchedGs = data.courses.map((c: { id: string; name: string }) => ({
                id: `gs-${c.id}`,
                name: c.name,
              }));
            })
        );
      }

      if (hasPensieve) {
        promises.push(
          fetch("/api/pensieve/courses")
            .then(async (res) => {
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to load Pensive courses");
              }
              return res.json();
            })
            .then((data) => {
              fetchedPensieve = data.courses.map((c: { id: string; name: string }) => ({
                id: `pensieve-${c.id}`,
                name: c.name,
              }));
            })
        );
      }

      await Promise.all(promises);
      setCanvasCourses(fetchedCanvas);
      setGseCourses(fetchedGs);
      setPensieveCourses(fetchedPensieve);
      setCachedTotals({
        canvas: fetchedCanvas.length,
        gradescope: fetchedGs.length,
        pensieve: fetchedPensieve.length,
      });

      // Build syllabus courses for the modal (read-only, always selected)
      const syllabusList = syllabusCourses.map((name) => ({
        id: `syllabus-${name}`,
        name,
      }));

      const prevSelected = new Set<string>();
      canvasSelected.forEach((c) => prevSelected.add(`canvas-${c.id}`));
      gsSelected.forEach((c) => prevSelected.add(`gs-${c.id}`));
      pensieveSelected.forEach((c) => prevSelected.add(`pensieve-${c.id}`));
      // Syllabus courses are always selected (managed via Syllabus settings, not here)
      syllabusList.forEach((c) => prevSelected.add(c.id));
      if (prevSelected.size === syllabusList.length && prevSelected.size > 0) {
        // Only syllabus courses exist — auto-select all fetched courses too
        fetchedCanvas.forEach((c) => prevSelected.add(c.id));
        fetchedGs.forEach((c) => prevSelected.add(c.id));
        fetchedPensieve.forEach((c) => prevSelected.add(c.id));
      } else if (prevSelected.size === syllabusList.length) {
        // No previous selections at all — auto-select everything
        fetchedCanvas.forEach((c) => prevSelected.add(c.id));
        fetchedGs.forEach((c) => prevSelected.add(c.id));
        fetchedPensieve.forEach((c) => prevSelected.add(c.id));
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
   * Called when the course modal closes. Computes the diff between old
   * and new selections. If nothing changed, closes silently. Otherwise
   * shows a confirmation dialog before saving.
   */
  function handleModalDone() {
    const newCanvasCourses = canvasCourses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({ id: parseInt(c.id.replace("canvas-", ""), 10), name: c.name }));
    const newGsCourses = gseCourses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({ id: c.id.replace("gs-", ""), name: c.name }));
    const newPensieveCourses = pensieveCourses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({ id: c.id.replace("pensieve-", ""), name: c.name }));

    const oldCanvasIds = new Set(canvasSelected.map((c) => c.id));
    const oldGsIds = new Set(gsSelected.map((c) => c.id));
    const oldPensieveIds = new Set(pensieveSelected.map((c) => c.id));
    const addedCanvasCourses = newCanvasCourses.filter((c) => !oldCanvasIds.has(c.id));
    const addedGsCourses = newGsCourses.filter((c) => !oldGsIds.has(c.id));
    const addedPensieveCourses = newPensieveCourses.filter((c) => !oldPensieveIds.has(c.id));

    const newCanvasIds = new Set(newCanvasCourses.map((c) => c.id));
    const newGsIds = new Set(newGsCourses.map((c) => c.id));
    const newPensieveIds = new Set(newPensieveCourses.map((c) => c.id));

    // Include syllabus courses that were deselected
    const removedSyllabusNames = syllabusCourses.filter(
      (name) => !selectedIds.has(`syllabus-${name}`)
    );

    const removedNames = [
      ...canvasSelected.filter((c) => !newCanvasIds.has(c.id)).map((c) => c.name),
      ...gsSelected.filter((c) => !newGsIds.has(c.id)).map((c) => c.name),
      ...pensieveSelected.filter((c) => !newPensieveIds.has(c.id)).map((c) => c.name),
      ...removedSyllabusNames,
    ];

    const removedTaskCount = tasks.filter(
      (t) => t.course_name && removedNames.includes(t.course_name)
    ).length;

    const addedNames = [
      ...addedCanvasCourses,
      ...addedGsCourses,
      ...addedPensieveCourses,
    ].map((c) => c.name);

    setShowModal(false);

    if (addedNames.length === 0 && removedNames.length === 0) return;

    setPendingChanges({
      newCanvasCourses, newGsCourses, newPensieveCourses,
      addedCanvasCourses, addedGsCourses, addedPensieveCourses,
      addedNames, removedNames, removedTaskCount,
    });
  }

  /**
   * Executes the confirmed class changes: saves credentials, deletes
   * tasks for removed courses, syncs assignments for added courses,
   * and shows a result toast with counts and inbox navigation.
   */
  async function handleConfirmedSave() {
    if (!pendingChanges) return;
    setConfirming(true);

    const {
      newCanvasCourses, newGsCourses, newPensieveCourses,
      addedCanvasCourses, addedGsCourses, addedPensieveCourses,
      removedNames,
    } = pendingChanges;
    const hasAdded = addedCanvasCourses.length + addedGsCourses.length + addedPensieveCourses.length > 0;
    const hasRemoved = removedNames.length > 0;

    try {
      // 1. Save updated course selections
      const payload: CredentialsSavePayload = {
        selected_canvas_courses: newCanvasCourses,
        selected_gradescope_courses: newGsCourses,
        selected_pensieve_courses: newPensieveCourses,
      };
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

      // 2. Hide tasks for removed courses (soft-dismiss, not delete)
      let hiddenCount = 0;
      if (hasRemoved) {
        hiddenCount = await dismissTasksByCourseNames(removedNames);
      }

      // 3. Restore previously hidden tasks for re-added courses
      const reAddedNames = pendingChanges.addedNames;
      let restoredCount = 0;
      if (reAddedNames.length > 0) {
        restoredCount = await undismissTasksByCourseNames(reAddedNames);
      }

      // 4. Sync assignments for added courses
      let syncedCount = 0;
      if (hasAdded) {
        const syncRes = await fetch("/api/assignments/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            canvas_courses: addedCanvasCourses.length > 0 ? addedCanvasCourses : undefined,
            gradescope_courses: addedGsCourses.length > 0 ? addedGsCourses : undefined,
          }),
        });
        if (syncRes.ok) {
          const syncResult = await syncRes.json();
          syncedCount = (syncResult.canvas?.synced ?? 0)
            + (syncResult.gradescope?.synced ?? 0)
            + (syncResult.pensieve?.synced ?? 0);
        }
        await fetchTasks();
      }

      // 5. Build result toast
      const parts: string[] = [];
      if (syncedCount > 0) {
        const addedStr = pendingChanges.addedNames.join(", ");
        parts.push(`Synced ${syncedCount} ${syncedCount === 1 ? "task" : "tasks"} from ${addedStr}`);
      } else if (restoredCount > 0) {
        parts.push(`Restored ${restoredCount} ${restoredCount === 1 ? "task" : "tasks"} from ${reAddedNames.join(", ")}`);
      } else if (hasAdded) {
        parts.push(`No new tasks from ${pendingChanges.addedNames.join(", ")}`);
      }
      if (hiddenCount > 0) {
        parts.push(`Hidden ${hiddenCount} ${hiddenCount === 1 ? "task" : "tasks"} from ${removedNames.join(", ")}`);
      } else if (hasRemoved) {
        parts.push(`Hidden ${removedNames.join(", ")}`);
      }

      showToast(parts.join(". ") + ".", {
        duration: 8_000,
        action: {
          label: "Inbox",
          onClick: () => { window.location.href = "/app/inbox"; },
        },
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update classes");
    } finally {
      setConfirming(false);
      setPendingChanges(null);
    }
  }

  // Build summary text
  const totalAvailable = cachedTotals
    ? cachedTotals.canvas + cachedTotals.gradescope + cachedTotals.pensieve
    : null;
  const summaryCount = totalAvailable ? `${totalSelected}/${totalAvailable}` : `${totalSelected}`;
  const platformText = platformCount > 1
    ? `from ${platformCount} platforms`
    : platformCount === 1 ? "from 1 platform" : "";

  const syllabusModalCourses = syllabusCourses.map((name) => ({ id: `syllabus-${name}`, name }));
  const groups = [
    ...(canvasCourses.length > 0 ? [{ label: "bCourses", courses: canvasCourses, color: "#3b82f6" }] : []),
    ...(gseCourses.length > 0 ? [{ label: "Gradescope", courses: gseCourses, color: "#14b8a6" }] : []),
    ...(pensieveCourses.length > 0 ? [{ label: "Pensive", courses: pensieveCourses, color: "#8B5CF6" }] : []),
    ...(syllabusModalCourses.length > 0 ? [{ label: "Syllabus", courses: syllabusModalCourses, color: "#7c3aed" }] : []),
  ];
  const allModalCourses = [...canvasCourses, ...gseCourses, ...pensieveCourses, ...syllabusModalCourses];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-subtle-foreground">
          {summaryCount} class{totalSelected !== 1 ? "es" : ""} selected{platformText ? ` ${platformText}` : ""}
        </p>
        <button
          onClick={handleEdit}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
          {loading ? "Loading..." : "Edit"}
        </button>
      </div>

      {totalSelected > 0 ? (
        <div className="flex flex-col gap-2">
          {canvasSelected.map((c) => (
            <span
              key={`canvas-${c.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200"
            >
              {c.name}
            </span>
          ))}
          {gsSelected.map((c) => (
            <span
              key={`gs-${c.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-200"
            >
              {c.name}
            </span>
          ))}
          {pensieveSelected.map((c) => (
            <span
              key={`pensieve-${c.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200"
            >
              {c.name}
            </span>
          ))}
          {syllabusCourses.map((name) => (
            <span
              key={`syllabus-${name}`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200"
            >
              {name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No classes selected. Tap Edit to choose courses.
        </p>
      )}

      <CourseSelectModal
        open={showModal}
        onClose={handleModalDone}
        title="Select Classes"
        courses={allModalCourses}
        groups={groups.length > 0 ? groups : undefined}
        selectedIds={selectedIds}
        onToggle={handleToggle}
        onSelectAll={() => setSelectedIds(new Set(allModalCourses.map((c) => c.id)))}
        onDeselectAll={() => setSelectedIds(new Set())}
      />

      {pendingChanges && (
        <ClassChangeConfirmDialog
          addedNames={pendingChanges.addedNames}
          removedNames={pendingChanges.removedNames}
          removedTaskCount={pendingChanges.removedTaskCount}
          loading={confirming}
          onConfirm={handleConfirmedSave}
          onCancel={() => setPendingChanges(null)}
        />
      )}
    </div>
  );
}
