"use client";

import { useState, useRef } from "react";
import { Check, Info, Pencil, Plus } from "lucide-react";
import type { ExtractedAssignment } from "@/app/api/syllabus/extract/route";
import DatePicker from "@/components/tasks/DatePicker";
import Popover from "@/components/ui/Popover";
import ColorPickerPopover from "@/components/ui/ColorPickerPopover";
import { TASK_COLORS } from "@/lib/constants";

/** Assignment with user selection state for the preview list. */
export type SelectableAssignment = ExtractedAssignment & { selected: boolean };

interface SyllabusPreviewProps {
  file: File;
  fileDataUrl: string | null;
  courseName: string | null;
  assignments: SelectableAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<SelectableAssignment[]>>;
  importing: boolean;
  error: string | null;
  onBack: () => void;
  onImport: (color: string) => void;
}

/**
 * Returns due date info matching TaskItem pattern: label, time, and color class.
 * Uses "Today", "Tomorrow", or "MMM DD" format with color coding.
 *
 * @param dateStr - YYYY-MM-DD date string or null
 * @param timeStr - HH:MM time string or null
 * @returns Object with dateLabel, timeLabel, className — or null if no date
 */
function getDueBadge(dateStr: string | null, timeStr: string | null | undefined): {
  dateLabel: string; timeLabel: string | null; className: string;
} | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);

  let dateLabel: string;
  let className: string;
  if (diffDays < 0) {
    dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    className = "text-red-400";
  } else if (diffDays === 0) {
    dateLabel = "Today";
    className = "text-blue-400";
  } else if (diffDays === 1) {
    dateLabel = "Tomorrow";
    className = "text-blue-400";
  } else if (diffDays <= 7) {
    dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    className = "text-blue-400";
  } else {
    dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    className = "text-subtle-foreground";
  }

  let timeLabel: string | null = null;
  if (timeStr) {
    const [h, mi] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    timeLabel = `${h % 12 || 12}:${String(mi).padStart(2, "0")} ${ampm}`;
  }

  return { dateLabel, timeLabel, className };
}

/**
 * Formats a YYYY-MM-DD date string to short readable format (e.g. "Jan 23").
 *
 * @param dateStr - ISO date string or null
 * @returns Formatted string or "Set date"
 */
function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "Set date";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * Formats HH:MM 24h time to 12h format (e.g. "5:00 PM").
 *
 * @param time - Time string in HH:MM format or null
 * @returns Formatted 12h time string or null
 */
function formatTime(time: string | null | undefined): string | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ------------------------------------------------------------------ */
/*  Per-card sub-component — owns its own refs and date picker state  */
/* ------------------------------------------------------------------ */

interface CardProps {
  assignment: SelectableAssignment;
  index: number;
  isEditing: boolean;
  taskColor: string;
  onUpdate: (i: number, patch: Partial<SelectableAssignment>) => void;
  onEditStart: (i: number) => void;
  onEditEnd: () => void;
}

/**
 * Single assignment card matching TaskItem single-row layout.
 * Each card owns its own dateButtonRef and showDatePicker state
 * to avoid shared-ref bugs when switching editing index.
 *
 * @param assignment - The assignment data
 * @param index - Index in the assignments array
 * @param isEditing - Whether this card is in edit mode
 * @param taskColor - Current task color for accents
 * @param onUpdate - Update a field on this assignment
 * @param onEditStart - Enter edit mode for this card
 * @param onEditEnd - Exit edit mode
 */
function SyllabusAssignmentCard({
  assignment: a,
  index: i,
  isEditing,
  taskColor,
  onUpdate,
  onEditStart,
  onEditEnd,
}: CardProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  const handleDone = () => {
    setShowDatePicker(false);
    onEditEnd();
  };

  const badge = getDueBadge(a.due_date, a.due_time);

  return (
    <div
      className={`group flex items-center gap-2 h-10 px-3 rounded-xl transition-all ${
        a.selected
          ? "bg-card hover:bg-muted/40"
          : "bg-muted/20 opacity-50 hover:opacity-70"
      }`}
    >
      {/* Selection checkbox */}
      <button
        onClick={() => onUpdate(i, { selected: !a.selected })}
        className={`w-[16px] h-[16px] rounded flex items-center justify-center shrink-0 transition-all cursor-pointer border-2 ${
          a.selected
            ? "border-purple-500 bg-purple-500"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        }`}
      >
        {a.selected && <Check size={10} className="text-white" strokeWidth={3} />}
      </button>

      {/* Title — text or inline input */}
      {isEditing ? (
        <input
          type="text"
          value={a.title}
          onChange={(e) => onUpdate(i, { title: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") handleDone(); }}
          className="flex-1 min-w-0 text-sm font-medium text-foreground bg-transparent outline-none border-b border-purple-500/50 focus:border-purple-500 transition-colors placeholder:text-muted-foreground"
          placeholder="Assignment title"
          autoFocus
        />
      ) : (
        <p className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">{a.title}</p>
      )}

      {/* Points badge */}
      {a.points_possible !== null && (
        <span className="text-[11px] text-muted-foreground shrink-0">
          {a.points_possible} pts
        </span>
      )}

      {/* Due badge / date pill */}
      {isEditing ? (
        <div className="relative shrink-0">
          <button
            ref={dateButtonRef}
            type="button"
            onClick={() => setShowDatePicker((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted transition-colors cursor-pointer"
            style={{ color: taskColor }}
          >
            <span>{formatDateShort(a.due_date)}</span>
            {a.due_time && (
              <>
                <span className="opacity-40">·</span>
                <span>{formatTime(a.due_time)}</span>
              </>
            )}
          </button>
          <Popover
            open={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            triggerRef={dateButtonRef}
            className="absolute left-0 top-full mt-1 z-50"
          >
            <DatePicker
              value={a.due_date}
              timeValue={a.due_time}
              onChange={(d) => onUpdate(i, { due_date: d })}
              onTimeChange={(t) => onUpdate(i, { due_time: t })}
            />
          </Popover>
        </div>
      ) : badge ? (
        <span className={`text-[11px] shrink-0 font-normal ${badge.className}`}>
          {badge.timeLabel && (
            <span className="text-muted-foreground opacity-60">{badge.timeLabel} </span>
          )}
          {badge.dateLabel}
        </span>
      ) : (
        <span className="text-[11px] shrink-0 italic text-muted-foreground/50">No date</span>
      )}

      {/* Edit / Done button */}
      {isEditing ? (
        <button
          onClick={handleDone}
          className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors cursor-pointer shrink-0"
        >
          Done
        </button>
      ) : (
        <button
          onClick={() => onEditStart(i)}
          className="p-1 rounded-lg text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-foreground hover:bg-muted transition-all cursor-pointer shrink-0"
          aria-label="Edit assignment"
        >
          <Pencil size={13} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main preview component                                            */
/* ------------------------------------------------------------------ */

/**
 * Side-by-side syllabus preview with polished assignment list.
 * Left pane: PDF/image viewer. Right pane: scrollable assignment cards.
 * Each card is a sub-component with its own state to avoid shared-ref bugs.
 *
 * @param file - Uploaded file for preview
 * @param fileDataUrl - Data URL for rendering
 * @param courseName - Extracted course name
 * @param assignments - Editable assignment list
 * @param setAssignments - State setter
 * @param importing - Loading state for import button
 * @param error - Error message
 * @param onBack - Navigate back to upload
 * @param onImport - Trigger import of selected assignments with chosen color
 */
export default function SyllabusPreview({
  file,
  fileDataUrl,
  courseName,
  assignments,
  setAssignments,
  importing,
  error,
  onBack,
  onImport,
}: SyllabusPreviewProps) {
  const selectedCount = assignments.filter((a) => a.selected).length;
  const allSelected = assignments.length > 0 && selectedCount === assignments.length;
  const missingDates = assignments.some((a) => !a.due_date);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [taskColor, setTaskColor] = useState("#8B5CF6");

  /** Updates a single assignment field by index. */
  function updateAt(i: number, patch: Partial<SelectableAssignment>) {
    setAssignments((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 shrink-0 w-full">
        {courseName && (
          <span className="text-sm font-semibold text-foreground">{courseName}</span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <ColorPickerPopover
            label=""
            value={taskColor}
            onChange={setTaskColor}
            layout="compact"
          />
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
          <button
            onClick={() => onImport(taskColor)}
            disabled={importing || selectedCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold disabled:opacity-50 cursor-pointer transition-opacity"
          >
            {importing ? (
              "Importing..."
            ) : (
              <>
                <Plus size={14} strokeWidth={2.5} />
                Import {selectedCount}/{assignments.length}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Missing dates hint */}
      {missingDates && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-3 py-2 mb-3 shrink-0 w-full">
          <Info size={14} className="shrink-0" />
          Some assignments are missing dates. You can set them below before importing.
        </div>
      )}

      {/* Main content: side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-5 flex-1 min-h-0 w-full">
        {/* Left: document preview */}
        <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
          {file.type === "application/pdf" ? (
            <iframe
              src={`${fileDataUrl ?? ""}#navpanes=0&scrollbar=1`}
              className="w-full h-full"
              title="Syllabus preview"
            />
          ) : (
            <img
              src={fileDataUrl ?? ""}
              alt="Syllabus"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Right: assignment list */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          {/* Select/deselect toggle */}
          <div className="flex items-center justify-end mb-2 shrink-0">
            <button
              onClick={() =>
                setAssignments((prev) =>
                  prev.map((a) => ({ ...a, selected: !allSelected }))
                )
              }
              className="text-xs font-medium text-blue-500 hover:text-blue-600 cursor-pointer"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Scrollable card list */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {assignments.map((a, i) => (
              <SyllabusAssignmentCard
                key={`${a.title}-${i}`}
                assignment={a}
                index={i}
                isEditing={editingIndex === i}
                taskColor={taskColor}
                onUpdate={updateAt}
                onEditStart={(idx) => setEditingIndex(idx)}
                onEditEnd={() => setEditingIndex(null)}
              />
            ))}

            {assignments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No assignments found in this document.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
