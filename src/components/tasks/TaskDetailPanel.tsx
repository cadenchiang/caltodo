"use client";

import { getRepeatLabel } from "@/lib/repeat";
import { getThemeColor } from "@/lib/constants";
import { getSourceBadges, getDetailDateInfo } from "@/lib/task-utils";
import { parseLinks, looksLikeDocument } from "@/lib/link-text";
import { useTheme } from "@/contexts/ThemeContext";
import { useTaskContext } from "@/contexts/TaskContext";
import type { Task, TaskUpdate } from "@/lib/types";
import TaskCheckbox from "./shared/TaskCheckbox";
import TaskDuplicatesBanner from "./TaskDuplicatesBanner";
import TaskDetailEmpty from "./TaskDetailEmpty";
import DeleteTaskButton from "./inline/DeleteTaskButton";
import DatePicker from "./DatePicker";
import InlineTextEdit from "./inline/InlineTextEdit";
import InlinePicker from "./inline/InlinePicker";
import OptionList from "./inline/OptionList";
import { TaskDateTimeLabel, TaskRepeatLabel } from "./shared/TaskDetailRows";
import { ExternalLink, BookOpen, Tag, AlignLeft, CalendarDays, FileText } from "lucide-react";

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

/** Icon column shared by every row, so labels line up down the panel. */
function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 w-5 flex items-center justify-center mt-1.5 text-secondary-foreground">
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
  const { availableCourses, availableTags } = useTaskContext();

  if (!task) return <TaskDetailEmpty />;

  const dotColor = getThemeColor(task.color, colorTheme);
  const dueInfo = getDetailDateInfo(task.due_date, task.due_time, !!task.is_completed);
  const repeatLabel = task.repeat_interval && task.repeat_unit
    ? getRepeatLabel(task.repeat_interval, task.repeat_unit)
    : null;
  const sourceBadges = getSourceBadges(task);
  const tags = task.tags ?? [];

  /** Applies one field change to the task. */
  function save(updates: TaskUpdate) {
    if (task) onSave(task.id, updates);
  }

  /** Adds or removes a tag, preserving the order of the rest. */
  function toggleTag(tag: string) {
    const has = tags.some((t) => t.toLowerCase() === tag.toLowerCase());
    save({ tags: has ? tags.filter((t) => t.toLowerCase() !== tag.toLowerCase()) : [...tags, tag] });
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
              <DatePicker
                value={task.due_date}
                timeValue={task.due_time}
                onChange={(due_date) => { save({ due_date }); if (due_date) close(); }}
                onTimeChange={(due_time) => save({ due_time })}
                repeatInterval={task.repeat_interval}
                repeatUnit={task.repeat_unit}
                onRepeatChange={(repeat_interval, repeat_unit) =>
                  save({ repeat_interval, repeat_unit })
                }
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
        {task.source_url && (
          <div className="flex items-center gap-4 py-2 min-w-0">
            <RowIcon><ExternalLink size={20} /></RowIcon>
            <a
              href={task.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline truncate transition-colors"
            >
              Open assignment
            </a>
          </div>
        )}

        {/* Class */}
        <div className="flex items-start gap-4 py-1 min-w-0">
          <RowIcon><BookOpen size={20} /></RowIcon>
          <div className="min-w-0 flex-1">
            <InlinePicker
              label="Change class"
              render={(close) => (
                <OptionList
                  options={availableCourses}
                  selected={task.course_name ? [task.course_name] : []}
                  onToggle={(course_name) => save({ course_name })}
                  onCreate={(course_name) => save({ course_name })}
                  onClear={() => save({ course_name: null })}
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

        {/* Tags */}
        <div className="flex items-start gap-4 py-1 min-w-0">
          <RowIcon><Tag size={20} /></RowIcon>
          <div className="min-w-0 flex-1">
            <InlinePicker
              label="Change tags"
              render={(close) => (
                <OptionList
                  options={availableTags}
                  selected={tags}
                  onToggle={toggleTag}
                  onCreate={toggleTag}
                  placeholder="Search or add tag..."
                  emptyLabel="No tags yet. Type to create one."
                  multi
                  onDone={close}
                />
              )}
            >
              {sourceBadges.length > 0 || tags.length > 0 ? (
                <span className="flex flex-wrap gap-1.5 min-w-0">
                  {sourceBadges.map((b) => (
                    <span key={b.label} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${b.className}`}>
                      {b.label}
                    </span>
                  ))}
                  {tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 text-xs rounded-full bg-accent text-foreground max-w-[200px] truncate">
                      {tag}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground/70">Add tags</span>
              )}
            </InlinePicker>
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start gap-4 py-1 min-w-0">
          <RowIcon><AlignLeft size={20} /></RowIcon>
          <div className="min-w-0 flex-1">
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
