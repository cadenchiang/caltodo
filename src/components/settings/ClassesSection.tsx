"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, GraduationCap } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useTaskContext } from "@/contexts/TaskContext";
import CourseSelectModal from "@/components/ui/CourseSelectModal";
import ClassChangeConfirmDialog from "@/components/settings/ClassChangeConfirmDialog";
import type { IntegrationCredentials, CredentialsSavePayload } from "@/lib/types";
import { buildClassGroups } from "@/lib/class-groups";
import SelectedClassesByPlatform from "./SelectedClassesByPlatform";
import { buildClassSyncSummary } from "@/lib/class-sync-summary";

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
  const router = useRouter();
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

  const hasCanvas = !!credentials.canvas_token || !!credentials.canvas_ical_url;
  const hasCanvasToken = !!credentials.canvas_token;
  const hasCanvasIcal = !!credentials.canvas_ical_url;
  const hasGradescope = !!credentials.gradescope_email;
  const hasPensieve = !!credentials.pensieve_calendar_url;
  const cachedTotals = getCachedTotals();

  // No integrations connected and nothing selected: show an actionable empty
  // state instead of a blank section, pointing the user at Integrations to
  // connect a platform.
  if (!hasCanvas && !hasGradescope && !hasPensieve && !hasSyllabus && totalSelected === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border bg-card px-6 py-10">
        <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center mb-3">
          <GraduationCap size={20} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No classes synced</p>
        <p className="text-xs text-subtle-foreground mt-1 mb-4 max-w-xs">
          Connect bCourses, Gradescope, or Pensive to start syncing your assignments.
        </p>
        <button
          onClick={() => router.push("/app/settings?section=integrations")}
          className="px-4 py-2 rounded-xl bg-[#0e89d6] text-white text-sm font-medium hover:bg-[#3D8FE8] transition-colors active:scale-[0.98]"
        >
          Sync classes
        </button>
      </div>
    );
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

      if (hasCanvasToken) {
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
      } else if (hasCanvasIcal) {
        promises.push(
          fetch("/api/canvas/ical-preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: credentials.canvas_ical_url }),
          })
            .then(async (res) => {
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to load bCourses courses");
              }
              return res.json();
            })
            .then((data) => {
              fetchedCanvas = data.courses.map((c: { name: string }) => ({
                id: `canvas-${c.name}`,
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
      // For iCal courses (id=0), match by name; for API-token courses, match by numeric ID
      if (hasCanvasIcal) {
        canvasSelected.forEach((c) => prevSelected.add(`canvas-${c.name}`));
      } else {
        canvasSelected.forEach((c) => prevSelected.add(`canvas-${c.id}`));
      }
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

  /** Toggles a single course's selected state (prefixed ID). Syllabus courses are locked. */
  function handleToggle(id: string) {
    if (id.startsWith("syllabus-")) return;
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
      .map((c) => {
        const rawId = c.id.replace("canvas-", "");
        const numericId = parseInt(rawId, 10);
        return { id: isNaN(numericId) ? 0 : numericId, name: c.name };
      });
    const newGsCourses = gseCourses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({ id: c.id.replace("gs-", ""), name: c.name }));
    const newPensieveCourses = pensieveCourses
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({ id: c.id.replace("pensieve-", ""), name: c.name }));

    // Use name-based comparison (works for both API-token and iCal courses)
    const oldCanvasNames = new Set(canvasSelected.map((c) => c.name));
    const oldGsIds = new Set(gsSelected.map((c) => c.id));
    const oldPensieveIds = new Set(pensieveSelected.map((c) => c.id));
    const addedCanvasCourses = newCanvasCourses.filter((c) => !oldCanvasNames.has(c.name));
    const addedGsCourses = newGsCourses.filter((c) => !oldGsIds.has(c.id));
    const addedPensieveCourses = newPensieveCourses.filter((c) => !oldPensieveIds.has(c.id));

    const newCanvasNames = new Set(newCanvasCourses.map((c) => c.name));
    const newGsIds = new Set(newGsCourses.map((c) => c.id));
    const newPensieveIds = new Set(newPensieveCourses.map((c) => c.id));

    const removedNames = [
      ...canvasSelected.filter((c) => !newCanvasNames.has(c.name)).map((c) => c.name),
      ...gsSelected.filter((c) => !newGsIds.has(c.id)).map((c) => c.name),
      ...pensieveSelected.filter((c) => !newPensieveIds.has(c.id)).map((c) => c.name),
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

      // 4b. Invalidate CalChat discussion boards cache so course list updates
      try {
        sessionStorage.removeItem("discussion_boards_cache_v2");
        sessionStorage.removeItem("discussion_boards_cache_v4");
      } catch { /* non-critical */ }
      window.dispatchEvent(new CustomEvent("caltodo-courses-changed"));

      // 5. Build result toast. Course titles carry section codes and term
      // suffixes, so listing them overflowed the toast as soon as two classes
      // changed; buildClassSyncSummary collapses lists to a count.
      const summary = buildClassSyncSummary({
        syncedCount,
        addedNames: pendingChanges.addedNames,
        restoredCount,
        reAddedNames,
        hiddenCount,
        removedNames,
      });

      if (summary) {
        showToast(summary, {
          duration: 8_000,
          action: {
            label: "Inbox",
            onClick: () => { window.location.href = "/app/inbox"; },
          },
        });
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update classes");
    } finally {
      setConfirming(false);
      setPendingChanges(null);
    }
  }

  // Build summary text.
  //
  // Syllabus courses are added to both halves. They come from tasks that have
  // already been imported, so each one is simultaneously available and
  // selected; counting them in totalSelected but not here was what let the
  // summary read "4/3" once a syllabus had been uploaded.
  const totalAvailable = cachedTotals
    ? cachedTotals.canvas + cachedTotals.gradescope + cachedTotals.pensieve + syllabusCourses.length
    : null;
  // "of N" is dropped when the cached total is stale enough to sit below the
  // number actually selected, which used to render as "4/3".
  const summaryCount =
    totalAvailable && totalAvailable >= totalSelected
      ? `${totalSelected} of ${totalAvailable}`
      : `${totalSelected}`;

  // One block per platform that contributed a class, so the list says which
  // platform each class syncs from rather than encoding it in a chip colour.
  const classGroups = buildClassGroups(
    {
      canvas: canvasSelected.map((c) => c.name),
      gradescope: gsSelected.map((c) => c.name),
      pensieve: pensieveSelected.map((c) => c.name),
      syllabus: syllabusCourses,
    },
    cachedTotals
  );

  const syllabusModalCourses = syllabusCourses.map((name) => ({ id: `syllabus-${name}`, name }));
  const groups = [
    ...(canvasCourses.length > 0 ? [{ label: "bCourses", courses: canvasCourses, color: "#0e89d6" }] : []),
    ...(gseCourses.length > 0 ? [{ label: "Gradescope", courses: gseCourses, color: "#14b8a6" }] : []),
    ...(pensieveCourses.length > 0 ? [{ label: "Pensive", courses: pensieveCourses, color: "#8B5CF6" }] : []),
    ...(syllabusModalCourses.length > 0 ? [{ label: "Syllabus", courses: syllabusModalCourses, color: "#7c3aed" }] : []),
  ];
  const allModalCourses = [...canvasCourses, ...gseCourses, ...pensieveCourses, ...syllabusModalCourses];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        {/* The platform breakdown moved into the list itself, where each
            platform names itself and gives its own count, so repeating
            "from 2 platforms" here said nothing the list did not. */}
        <p className="text-xs text-subtle-foreground">
          {summaryCount} class{totalSelected !== 1 ? "es" : ""} syncing
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
        <SelectedClassesByPlatform groups={classGroups} />
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
