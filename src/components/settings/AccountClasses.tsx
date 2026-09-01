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
 * Editing expands in place rather than opening a modal, so the account you are
 * editing stays on screen next to its siblings.
 */

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { CourseSelectionProvider } from "@/lib/course-selection";
import { COURSE_SELECTION, type SelectableCourse } from "@/lib/course-selection";

/**
 * Shared pill styling for a class name.
 *
 * Exported so the "add another account" control can be built from the same
 * shape: the two sit in the same block, and a pill beside a bare text button
 * read as two unrelated kinds of thing.
 */
export const CLASS_PILL =
  "inline-flex items-center max-w-[240px] truncate px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground";

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${meta.coursesEndpoint}?account_id=${encodeURIComponent(accountId)}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to load classes");
      setAvailable((body.courses ?? []) as SelectableCourse[]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load classes");
      setEditing(false);
    } finally {
      setLoading(false);
    }
  }, [meta.coursesEndpoint, accountId, showToast]);

  /** Opens the picker, fetching the course list the first time only. */
  function startEditing() {
    setEditing(true);
    if (available === null) load();
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

  /** Persists the draft, keeping the picker open only if the save fails. */
  async function commit() {
    if (!available) return;
    setSaving(true);
    try {
      await onSave(available.filter((c) => draft.has(String(c.id))));
      setEditing(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save classes");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="pl-2 pr-2 pb-2 -mt-0.5">
        {/* Count and action on one line, the names beneath it. The names were
            chips above their own "Edit classes" link, which gave every account
            three stacked rows. */}
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] text-subtle-foreground">
            {selected.length > 0
              ? `${selected.length} ${selected.length === 1 ? "class" : "classes"}`
              : "No classes selected"}
          </span>
          <button
            onClick={startEditing}
            className="text-[11px] font-medium text-[#0e89d6] hover:underline cursor-pointer"
          >
            {selected.length > 0 ? "Edit" : "Choose"}
          </button>
        </div>
        {selected.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {selected.map((course) => (
              <span key={String(course.id)} className={CLASS_PILL}>
                {course.name}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pl-2 pr-2 pb-2 -mt-0.5">
      {loading ? (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground py-2">
          <Loader2 size={12} className="animate-spin" />
          Loading classes...
        </p>
      ) : (
        <>
          <div className="max-h-52 overflow-y-auto rounded-lg border border-border divide-y divide-border mb-2">
            {(available ?? []).map((course) => (
              <label
                key={String(course.id)}
                className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={draft.has(String(course.id))}
                  onChange={() => toggle(String(course.id))}
                  className="w-3.5 h-3.5 rounded accent-foreground shrink-0"
                />
                <span className="text-[11px] text-foreground truncate">{course.name}</span>
              </label>
            ))}
            {(available ?? []).length === 0 && (
              <p className="px-2.5 py-3 text-[11px] text-muted-foreground text-center">
                {meta.emptyLabel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={commit}
              disabled={saving}
              className="text-[11px] font-semibold text-[#0e89d6] hover:underline cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : "Done"}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
