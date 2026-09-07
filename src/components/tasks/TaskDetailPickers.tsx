"use client";

/**
 * The class and tag rows of the task detail panel.
 *
 * Both are the same shape: an icon, a value that opens a searchable list, and
 * a list that stages its picks until Save. They live here rather than in the
 * panel so the panel stays about the layout of a task and these stay about
 * choosing from a set the user also maintains - creating, colouring, and
 * retiring entries.
 */

import { useMemo, useSyncExternalStore } from "react";
import { BookOpen, Tag, X } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import {
  getHiddenSourceBadges,
  getServerHiddenSourceBadges,
  hideSourceBadge,
  subscribeHiddenSourceBadges,
  visibleSourceBadges,
} from "@/lib/hidden-source-badges";
import { labelColor, courseColor } from "@/lib/label-colors";
import type { Task, TaskUpdate } from "@/lib/types";
import InlinePicker from "./inline/InlinePicker";
import OptionList from "./inline/OptionList";

/** Icon size for a row, matching ROW_ICON_SIZE in TaskDetailPanel. */
const ROW_ICON_SIZE = 16;

/** The value column beside a row icon, matching the panel's own. */
const ROW_VALUE_COLUMN = "min-w-0 flex-1 text-sm";

interface PillChipProps {
  /** Text shown in the pill. */
  label: string;
  /** Tailwind classes for a badge that carries its own palette. */
  className?: string;
  /** Hex colour for a pill tinted from a single value, as tags are. */
  color?: string;
  /** Takes the pill off the row. */
  onRemove: () => void;
  /** Tooltip for the remove control, which differs per pill kind. */
  removeHint: string;
}

/**
 * One pill in the tag row, with a remove control revealed on hover.
 *
 * @param label - Pill text
 * @param className - Classes for a badge with its own palette
 * @param color - Hex colour for a tinted pill
 * @param onRemove - Takes the pill off the row
 * @param removeHint - Tooltip for the remove control
 * @remarks The remove click is stopped before it reaches the row, which would
 *          otherwise open the picker underneath - removing a pill and opening
 *          a dropdown on the same click is not what either gesture meant. One
 *          click, not two: this only takes a pill off a row, and both kinds
 *          are put back from the same row it came from.
 */
function PillChip({ label, className, color, onRemove, removeHint }: PillChipProps) {
  return (
    <span
      className={`group/pill inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 text-xs font-medium rounded-full max-w-[200px] ${className ?? ""}`}
      style={
        color
          ? { color, backgroundColor: "color-mix(in srgb, currentColor 16%, transparent)" }
          : undefined
      }
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title={removeHint}
        aria-label={removeHint}
        className="shrink-0 rounded-full p-0.5 opacity-0 group-hover/pill:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 hover:bg-black/10 dark:hover:bg-white/20 transition-opacity"
      >
        <X size={10} strokeWidth={3} />
      </button>
    </span>
  );
}

interface TaskDetailPickersProps {
  /** The task being edited. */
  task: Task;
  /** The task's tags, already defaulted to an empty array. */
  tags: string[];
  /** Source and status badges shown before the tags, e.g. "bCourses". */
  sourceBadges: { label: string; className: string }[];
  /** Applies one field change to the task. */
  save: (updates: TaskUpdate) => void;
}

/** The icon column shared by both rows, so their labels line up. */
function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 w-5 h-5 flex items-center justify-center text-secondary-foreground">
      {children}
    </div>
  );
}

/**
 * Renders the class row and the tag row.
 *
 * @param task - The task being edited
 * @param tags - The task's tags
 * @param sourceBadges - Badges shown before the tags
 * @param save - Applies a field change
 * @remarks Deleting a class or tag is not a change to this task: it strips
 *          the value from every task carrying it, so it goes straight to the
 *          context rather than through `save`. Assignments are kept either
 *          way - a class is a label on coursework, and deleting the label is
 *          not a request to delete the work.
 */
export default function TaskDetailPickers({
  task,
  tags,
  sourceBadges,
  save,
}: TaskDetailPickersProps) {
  const { availableCourses, availableTags, courseColors, deleteTag, deleteCourse } =
    useTaskContext();

  // The dismissed set lives on the device, not in React, so it is read as an
  // external store: that is what keeps the server's empty set and the first
  // client render in agreement, and what re-renders every open panel when a
  // badge is dismissed in one of them.
  const hiddenBadges = useSyncExternalStore(
    subscribeHiddenSourceBadges,
    getHiddenSourceBadges,
    getServerHiddenSourceBadges,
  );

  const badges = useMemo(
    () => visibleSourceBadges(sourceBadges, hiddenBadges),
    [sourceBadges, hiddenBadges],
  );

  const hasPills = badges.length > 0 || tags.length > 0;

  /**
   * Dismisses a source badge on every task.
   *
   * @param label - Badge label as displayed, e.g. "bCourses"
   * @remarks The badge says where the assignment came from, so nothing about
   *          the task changes; only whether the pill is drawn. Stored per
   *          device, like the other display preferences.
   */
  function handleDismissBadge(label: string) {
    hideSourceBadge(label);
    console.info("TaskDetailPickers: dismissed source badge", { label });
  }

  /**
   * Takes one tag off this task, leaving every other task alone.
   *
   * @param tag - Tag to remove, as displayed
   * @remarks This is the narrow removal, and the one a pill's own control
   *          should do. Retiring a tag everywhere is the dropdown's delete.
   */
  function handleRemoveTag(tag: string) {
    save({ tags: tags.filter((t) => t.toLowerCase() !== tag.toLowerCase()) });
  }

  /**
   * Retires a tag from every assignment that carries it.
   *
   * @param tag - Tag to delete, as displayed
   * @remarks Tags are derived from tasks, so there is no tag row to delete on
   *          its own; the only way to retire one is to strip it everywhere.
   *          The confirming click is handled by the option list.
   */
  async function handleDeleteTag(tag: string) {
    const count = await deleteTag(tag);
    console.info("TaskDetailPickers: deleted tag", { tag, taskCount: count });
  }

  /**
   * Clears a class from every assignment that carries it.
   *
   * @param name - Class name to delete, as stored
   * @remarks A class from a synced platform comes back on the next sync,
   *          because the source still reports it.
   */
  async function handleDeleteCourse(name: string) {
    const count = await deleteCourse(name);
    console.info("TaskDetailPickers: deleted class", { class: name, taskCount: count });
  }

  return (
    <>
      {/* Class */}
      <div className="flex items-start gap-4 py-2 min-w-0">
        <RowIcon><BookOpen size={ROW_ICON_SIZE} /></RowIcon>
        <div className={ROW_VALUE_COLUMN}>
          <InlinePicker
            label="Change class"
            render={(close) => (
              <OptionList
                options={availableCourses}
                selected={task.course_name ? [task.course_name] : []}
                onCommit={(values) => save({ course_name: values[0] ?? null })}
                allowCreate
                onDelete={handleDeleteCourse}
                deleteHint="Remove this class from every assignment"
                colorFor={(name) => courseColor(name, courseColors)}
                clearLabel="None"
                placeholder="Search or add class..."
                emptyLabel="No classes yet. Type to create one."
                onDone={close}
              />
            )}
          >
            <span className={`text-sm ${task.course_name ? "text-foreground" : "text-muted-foreground/70"}`}>
              {task.course_name || "Add a class"}
            </span>
          </InlinePicker>
        </div>
      </div>

      {/* Tags — the pills sit flush on the content column, so the first
          pill's left edge lines up with the text of every other row. */}
      <div className="flex items-start gap-4 py-2 min-w-0">
        <RowIcon><Tag size={ROW_ICON_SIZE} /></RowIcon>
        <div className={ROW_VALUE_COLUMN}>
          <InlinePicker
            label="Change tags"
            render={(close) => (
              <OptionList
                options={availableTags}
                selected={tags}
                onCommit={(values) => save({ tags: values })}
                allowCreate
                onDelete={handleDeleteTag}
                deleteHint="Remove this tag from every assignment"
                colorFor={labelColor}
                placeholder="Search or add tag..."
                emptyLabel="No tags yet. Type to create one."
                multi
                onDone={close}
              />
            )}
          >
            {hasPills ? (
              <span className="flex flex-wrap gap-1.5 min-w-0">
                {badges.map((b) => (
                  <PillChip
                    key={b.label}
                    label={b.label}
                    className={b.className}
                    onRemove={() => handleDismissBadge(b.label)}
                    removeHint={`Hide the ${b.label} badge`}
                  />
                ))}
                {tags.map((tag) => (
                  // Tinted from the tag's own colour rather than a flat
                  // neutral, so a row of tags is scannable. The background is
                  // mixed from `currentColor` so it tracks the text in both
                  // themes instead of needing a second stored value.
                  <PillChip
                    key={tag}
                    label={tag}
                    color={labelColor(tag)}
                    onRemove={() => handleRemoveTag(tag)}
                    removeHint={`Remove ${tag} from this assignment`}
                  />
                ))}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground/70">Add tags</span>
            )}
          </InlinePicker>
        </div>
      </div>
    </>
  );
}
