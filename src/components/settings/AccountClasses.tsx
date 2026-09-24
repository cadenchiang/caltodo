"use client";

/**
 * One account's classes, inside its integration's dropdown.
 *
 * Class selection used to live on a separate Classes tab that showed every
 * platform's classes in one flat list, so a student with two Canvas schools
 * could see which classes were syncing but not which school each came from.
 * The list is per account here because that is the only place the answer
 * exists: the course endpoints are scoped by `account_id`.
 *
 * Editing opens the shared course-select modal rather than expanding in place.
 * The inline editor put a scrolling checkbox list inside a card that was
 * already inside a dropdown, so the list it offered was a few rows tall and
 * every tick moved the accounts under it.
 *
 * Only Done saves. Cancel, Escape, the backdrop and the close button restore
 * the previous selection, and Done stays disabled while nothing has changed.
 */

import { useCallback, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import CourseSelectModal from "@/components/ui/CourseSelectModal";
import type { CourseSelectionProvider } from "@/lib/course-selection";
import { COURSE_SELECTION, type SelectableCourse } from "@/lib/course-selection";
import { seedSelection } from "@/lib/course-selection-diff";

/**
 * Whether two id sets differ.
 *
 * @param a - One selection
 * @param b - The other
 * @returns True when either set holds an id the other lacks
 */
export function selectionsDiffer(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return true;
  for (const id of a) if (!b.has(id)) return true;
  return false;
}

/**
 * Shape of a pill in this card, without any colour.
 *
 * Exported so the account label and the "add another account" control can be
 * built from the same shape without inheriting the class pill's muted
 * colours: two utilities setting the same property leave the winner to CSS
 * source order, not to the order they are written in.
 */
export const PILL_SHAPE =
  "inline-flex items-center max-w-[240px] truncate px-2.5 py-1 rounded-full text-2xs font-medium";

/** Shared pill styling for a class name. */
export const CLASS_PILL = `${PILL_SHAPE} bg-muted text-muted-foreground`;

interface AccountClassesProps {
  provider: CourseSelectionProvider;
  /** Which account to list, or "primary" for the flat credential columns. */
  accountId: string;
  /** Class names currently selected for this account. */
  selected: SelectableCourse[];
  /** Persists a new selection for this account. */
  onSave: (courses: SelectableCourse[]) => Promise<void>;
}

/**
 * Renders this account's selected classes, and its picker when expanded.
 *
 * @param provider - Which provider's courses to fetch.
 * @param accountId - Account whose courses these are.
 * @param selected - Currently selected courses.
 * @param onSave - Persists a change.
 * @returns The class list with an inline editor.
 */
export default function AccountClasses({
  provider,
  accountId,
  selected,
  onSave,
}: AccountClassesProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState<SelectableCourse[] | null>(null);
  const [draft, setDraft] = useState<Set<string>>(() => new Set(selected.map((c) => String(c.id))));
  /** The draft as it was when the picker opened, so Cancel can restore it. */
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);

  const meta = COURSE_SELECTION[provider];

  // Re-seed the draft when the stored selection changes, including after a
  // save, so reopening the editor never shows a stale set of ticks. Adjusted
  // during render rather than in an effect: it is a function of the props, so
  // an effect would paint one frame with the old ticks first.
  const selectedKey = selected.map((c) => String(c.id)).sort().join("\u0000");
  const [lastKey, setLastKey] = useState(selectedKey);
  if (selectedKey !== lastKey) {
    setLastKey(selectedKey);
    setDraft(new Set(selected.map((c) => String(c.id))));
  }

  /**
   * Fetches this account's course list.
   *
   * @returns The courses, or null when the request failed (already toasted).
   */
  const load = useCallback(async (): Promise<SelectableCourse[] | null> => {
    setLoading(true);
    try {
      const res = await fetch(`${meta.coursesEndpoint}?account_id=${encodeURIComponent(accountId)}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to load classes");
      const courses = (body.courses ?? []) as SelectableCourse[];
      setAvailable(courses);
      return courses;
    } catch (err) {
      console.error("AccountClasses: course list failed to load", {
        provider,
        accountId,
        error: err instanceof Error ? err.message : String(err),
        impact: "the picker did not open",
      });
      showToast(err instanceof Error ? err.message : "Failed to load classes", { variant: "error" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [meta.coursesEndpoint, accountId, provider, showToast]);

  /**
   * Opens the picker, fetching the course list the first time only.
   *
   * The modal opens only once there is a list to put in it: opening first
   * would show its empty state ("No active courses found") while the request
   * was still in flight, which reads as an answer rather than as loading.
   */
  async function startEditing() {
    const courses = available ?? (await load());
    if (courses === null) return;
    // The provider knows why its list is empty ("a course appears once it has
    // an assignment"), and the modal's generic empty state does not, so an
    // empty list is answered here rather than by opening onto nothing.
    if (courses.length === 0) {
      showToast(meta.emptyLabel);
      return;
    }
    // Re-seed against the list actually being shown. The draft above is keyed
    // on stored ids, which an account connected by calendar feed does not
    // share with its course endpoint, so the picker opened with every class
    // unticked and closing it saved that emptiness back.
    const seeded = seedSelection(courses, selected);
    setDraft(seeded);
    setOpened(seeded);
    setEditing(true);
  }

  /** Adds or removes one course from the draft. */
  function toggle(id: string) {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Closes the picker and restores the selection it opened with. */
  function cancel() {
    setEditing(false);
    setDraft(opened);
  }

  /**
   * Closes the picker and persists the draft. Only Done reaches here.
   *
   * A failed save drops the draft back to the stored selection, because that
   * is what the pills below still show.
   */
  async function commit() {
    setEditing(false);
    if (!available) return;
    setSaving(true);
    try {
      await onSave(available.filter((c) => draft.has(String(c.id))));
    } catch (err) {
      setDraft(new Set(selected.map((c) => String(c.id))));
      console.error("AccountClasses: save failed", {
        provider,
        accountId,
        error: err instanceof Error ? err.message : String(err),
        impact: "the stored selection is unchanged",
      });
      showToast(err instanceof Error ? err.message : "Failed to save classes", { variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  /** Ticks every available course. */
  function selectAll() {
    setDraft(new Set((available ?? []).map((c) => String(c.id))));
  }

  /** Clears the draft. */
  function deselectAll() {
    setDraft(new Set());
  }

  return (
    <div>
      {/* A labelled row with its action on the right, then the values
          beneath it. Left-aligning the label, the count and the action in
          one line gave the block no column edge to read down. */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-2xs font-semibold text-foreground">
          Classes{selected.length > 0 ? ` · ${selected.length}` : ""}
        </p>
        <button
          type="button"
          onClick={startEditing}
          disabled={loading || saving}
          className="text-2xs font-medium text-blue-500 hover:underline cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-default"
        >
          {loading ? "Loading..." : saving ? "Saving..." : selected.length > 0 ? "Edit" : "Choose"}
        </button>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {selected.map((course) => (
            <span key={String(course.id)} className={CLASS_PILL}>
              {course.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-2xs text-muted-foreground">No classes selected</p>
      )}

      {editing && available && (
        <CourseSelectModal
          open
          onClose={cancel}
          onDone={commit}
          doneDisabled={!selectionsDiffer(draft, opened)}
          title="Select classes"
          courses={available.map((c) => ({ id: String(c.id), name: c.name }))}
          selectedIds={draft}
          onToggle={toggle}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
        />
      )}
    </div>
  );
}
