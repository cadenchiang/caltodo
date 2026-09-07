"use client";

import { getRepeatLabel } from "@/lib/repeat";
import { getThemeColor } from "@/lib/constants";
import { getSourceBadges, getDetailDateInfo } from "@/lib/task-utils";
import { parseLinks, looksLikeDocument } from "@/lib/link-text";
import { summariseTaskEdit } from "@/lib/task-edit-summary";
import { useUndo } from "@/contexts/UndoContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, TaskUpdate } from "@/lib/types";
import TaskCheckbox from "./shared/TaskCheckbox";
import TaskDuplicatesBanner from "./TaskDuplicatesBanner";
import TaskDetailEmpty from "./TaskDetailEmpty";
import DeleteTaskButton from "./inline/DeleteTaskButton";
import ConfirmedDatePicker from "./ConfirmedDatePicker";
import TaskDetailPickers from "./TaskDetailPickers";
import InlineTextEdit from "./inline/InlineTextEdit";
import TaskLinkField from "./TaskLinkField";
import InlinePicker from "./inline/InlinePicker";
import { TaskDateTimeLabel, TaskRepeatLabel } from "./shared/TaskDetailRows";
import { ExternalLink, AlignLeft, CalendarDays, FileText } from "lucide-react";

interface TaskDetailPanelProps {
  /** The selected task, or null for empty state. */
  task: Task | null;
  /** Close/deselect callback. */
  onClose: () => void;
  /** Save changes callback with task ID and field updates. */
  onSave: (id: string, updates: TaskUpdate) => void;
  /** Optional delete callback with task ID. */
  onDelete?: (id: string) => void;
}

/**
 * Icon column shared by every row, so labels line up down the panel.
 *
 * The box is `w-5 h-5`: 20px tall to match the line box of the `text-sm` text
 * beside it (so the icon centres on the first line rather than hanging below
 * it), and 20px wide to sit under the title checkbox, which is the same size.
 *
 * The icon inside it is ROW_ICON_SIZE, not the box size. A 20px icon fills the
 * box edge to edge and carries around 15px of ink, against text whose capital
 * letters are only ~10px tall - half again the height of what it labels, which
 * reads as a heavy icon sitting low rather than a peer of the text, even though
 * the two are centred on each other to within a fifth of a pixel.
 */
/**
 * Icon size for a detail row, chosen to match the text rather than the box.
 *
 * At 16px a lucide glyph draws about 10px of ink, which is the cap height of
 * the 14px (`text-sm`) label beside it, so icon and text read as the same
 * size. The 20px box around it is unchanged, so the column still lines up.
 */
const ROW_ICON_SIZE = 16;

/**
 * The value column beside a row icon.
 *
 * `text-sm` here is not decoration - the values already set their own size.
 * It sets the column's *strut*, the invisible box every line is at least as
 * tall as, which otherwise inherits the panel's 16px font and its 24px line
 * box. A value rendered as an inline span (the class name, the "Add tags"
 * placeholder) sits on that taller strut's baseline, which is ~3px lower than
 * the baseline of its own 20px line box, so the text hung below the icon
 * labelling it while the icon column itself was perfectly placed. Matching the
 * strut to the 14px text puts the two back on the same centre line.
 */
const ROW_VALUE_COLUMN = "min-w-0 flex-1 text-sm";

function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 w-5 h-5 flex items-center justify-center text-secondary-foreground">
      {children}
    </div>
  );
}

/**
 * Right-side task detail panel. Every field edits in place: hovering tints
 * the field, clicking turns it into an editor or opens its picker. There is
 * no edit button and no modal — the panel is the editor.
 *
 * @param task - The task being viewed, or null for empty state
 * @param onClose - Callback to deselect the task
 * @param onSave - Callback with the task ID and updated fields
 * @param onDelete - Optional callback to delete the task
 */
export default function TaskDetailPanel({ task, onClose, onSave, onDelete }: TaskDetailPanelProps) {
  const { colorTheme } = useTheme();
  const { pushUndo } = useUndo();

  if (!task) return <TaskDetailEmpty />;

  const dotColor = getThemeColor(task.color, colorTheme);
  const dueInfo = getDetailDateInfo(task.due_date, task.due_time, !!task.is_completed);
  const repeatLabel = task.repeat_interval && task.repeat_unit
    ? getRepeatLabel(task.repeat_interval, task.repeat_unit)
    : null;
  const sourceBadges = getSourceBadges(task);
  const tags = task.tags ?? [];
  // Only a task the user wrote themselves. A synced one has its link rewritten
  // by every sync, so an edit here would not survive the next run.
  const isLinkEditable = !task.source;

  /**
   * Applies one field change to the task, and records how to take it back.
   *
   * @param updates - The fields to write
   * @remarks An update that writes the same values back is dropped: it would
   *          announce an edit that did not happen and push an undo that does
   *          nothing. The snapshot for the revert is taken from the task as
   *          it is now, before the write, so the undo restores exactly what
   *          was on screen a moment ago.
   */
  function save(updates: TaskUpdate) {
    if (!task) return;
    const summary = summariseTaskEdit(task, updates);
    if (!summary) return;

    const id = task.id;
    onSave(id, updates);
    pushUndo({
      label: summary.label,
      undo: () => onSave(id, summary.revert),
    });
  }

  /**
   * Saves the task's link.
   *
   * @param url - A normalised http(s) URL, or null to clear the link
   * @remarks The value is already vetted by TaskLinkField; this only routes it
   *          through `save` so the edit is announced and undoable like the
   *          rest.
   */
  function saveLink(url: string | null) {
    save({ source_url: url });
  }

  return (
    <div className="flex-1 h-full border-l border-border flex flex-col min-w-0">
      {/* Header — delete only. Editing happens in the fields themselves, so
          there is no pencil to reach for. */}
      <div className="shrink-0 flex items-center justify-end pl-3 pr-3 md:pr-6 pt-4 md:pt-5 pb-2">
        {onDelete && (
          // Keyed by task so the armed state cannot survive a switch.
          <DeleteTaskButton
            key={task.id}
            onConfirm={() => {
              onDelete(task.id);
              onClose();
            }}
          />
        )}
      </div>

      {/* Title block — pinned while the body scrolls. */}
      <div className="shrink-0 px-6 pt-1 pb-4 border-b border-border min-w-0">
        <div className="group flex items-start gap-4 min-w-0">
          <TaskCheckbox
            color={dotColor}
            isCompleted={task.is_completed}
            onToggle={() => save({ is_completed: !task.is_completed })}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <InlineTextEdit
              value={task.title}
              onCommit={(title) => { if (title) save({ title }); }}
              placeholder="Untitled"
              label="Task title"
              singleLine
              textClassName="text-xl font-semibold text-foreground leading-snug"
            />
          </div>
        </div>

        {/* Due date — opens the full picker, which also carries time and repeat. */}
        <div className="pl-9 mt-1.5">
          <InlinePicker
            label="Change due date"
            render={(close) => (
              <ConfirmedDatePicker
                value={task.due_date}
                timeValue={task.due_time}
                repeatInterval={task.repeat_interval}
                repeatUnit={task.repeat_unit}
                onCommit={(d) =>
                  save({
                    due_date: d.date,
                    due_time: d.time,
                    repeat_interval: d.repeatInterval,
                    repeat_unit: d.repeatUnit,
                  })
                }
                onDone={close}
              />
            )}
          >
            {dueInfo ? (
              <TaskDateTimeLabel
                dateLabel={dueInfo.dateLabel}
                exactDate={dueInfo.exactDate}
                timeLabel={dueInfo.timeLabel}
                urgencyClassName={dueInfo.className}
                bare
              />
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground/70">
                <CalendarDays size={13} />
                Add a due date
              </span>
            )}
          </InlinePicker>
        </div>

        <TaskRepeatLabel repeatLabel={repeatLabel} />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto px-6 pt-3 pb-6 min-w-0">
        {/* Link — the synced link on an assignment that came from a platform,
            and an editable one on a task the user wrote themselves. The row is
            hidden on a synced task with no link rather than offering an edit
            the next sync would overwrite: sync rewrites source_url on every
            run, so a link typed here would silently vanish. */}
        {isLinkEditable ? (
          <div className="flex items-start gap-4 py-2 min-w-0">
            <RowIcon><ExternalLink size={ROW_ICON_SIZE} /></RowIcon>
            <div className={ROW_VALUE_COLUMN}>
              <TaskLinkField value={task.source_url} onCommit={saveLink} />
            </div>
          </div>
        ) : (
          task.source_url && (
            <div className="flex items-start gap-4 py-2 min-w-0">
              <RowIcon><ExternalLink size={ROW_ICON_SIZE} /></RowIcon>
              <a
                href={task.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline truncate transition-colors"
              >
                Open assignment
              </a>
            </div>
          )
        )}

        <TaskDetailPickers
          task={task}
          tags={tags}
          sourceBadges={sourceBadges}
          save={save}
        />

        {/* Description */}
        <div className="flex items-start gap-4 py-2 min-w-0">
          <RowIcon><AlignLeft size={ROW_ICON_SIZE} /></RowIcon>
          <div className={ROW_VALUE_COLUMN}>
            <InlineTextEdit
              value={task.description ?? ""}
              // Stored as an empty string, not null: the column is non-null.
              onCommit={(description) => save({ description })}
              placeholder="Add a description"
              label="Task description"
              textClassName="text-sm text-foreground whitespace-pre-wrap"
            >
              {parseLinks(task.description ?? "").map((seg, i) =>
                seg.kind === "text" ? (
                  <span key={i}>{seg.value}</span>
                ) : (
                  <a
                    key={i}
                    href={seg.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[#0e89d6] hover:underline break-all"
                  >
                    {looksLikeDocument(seg.href, seg.label) && <FileText size={13} className="shrink-0" />}
                    {seg.label}
                  </a>
                )
              )}
            </InlineTextEdit>
          </div>
        </div>

        <TaskDuplicatesBanner task={task} />
      </div>
    </div>
  );
}
