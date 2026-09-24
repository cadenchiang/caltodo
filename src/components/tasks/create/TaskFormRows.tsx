"use client";

import type { RefObject } from "react";
import { AlignLeft, BookOpen, CalendarDays, ChevronDown, Clock, Repeat, Tag, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { getRepeatLabel } from "@/lib/repeat";
import { formatTime12h } from "@/lib/task-utils";
import { getThemeColor, getTaskColorName } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import Badge from "@/components/ui/Badge";
import { providerLabel } from "@/lib/copy";
import type { TaskFormState } from "./useTaskForm";

/** Which picker is open, if any. */
export type PickerKey = "color" | "course" | "date" | "time" | "repeat" | "tags" | null;

/** Row recipe: icon, value, hover tint. */
const ROW = "w-full flex items-center gap-4 px-4 py-4 min-h-11 rounded-xl text-left transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer";

export interface TaskFormRowsProps {
  form: TaskFormState;
  set: <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => void;
  /** Platform the task came from (edit mode), for the read-only badge. */
  source?: string | null;
  /** Toggles a picker. */
  onToggle: (picker: PickerKey) => void;
  /** Which picker is open. */
  openPicker: PickerKey;
  refs: {
    title: RefObject<HTMLInputElement | null>;
    color: RefObject<HTMLButtonElement | null>;
    course: RefObject<HTMLButtonElement | null>;
    date: RefObject<HTMLButtonElement | null>;
    time: RefObject<HTMLButtonElement | null>;
    repeat: RefObject<HTMLButtonElement | null>;
    tags: RefObject<HTMLButtonElement | null>;
  };
}

/**
 * The task editor's fields: colour dot and title, then class, date and time,
 * repeat, tags and description. Every row is a labelled button that opens
 * its picker; the pickers themselves live in TaskFormPickers.
 */
export default function TaskFormRows({ form, set, source, onToggle, openPicker, refs }: TaskFormRowsProps) {
  const { colorTheme } = useTheme();
  const displayColor = getThemeColor(form.color, colorTheme);

  /** Removes a tag chip. */
  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag));
  }

  return (
    <>
      <div className="px-6 pb-4 flex items-center gap-4">
        <button
          ref={refs.color}
          type="button"
          onClick={() => onToggle("color")}
          className="w-5 h-5 rounded-full shrink-0 cursor-pointer hover:scale-110 transition-all border border-hairline after:absolute after:content-[''] after:-inset-3 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: displayColor }}
          aria-label={`Color: ${getTaskColorName(form.color)}. Change color`}
          aria-haspopup="dialog"
          aria-expanded={openPicker === "color"}
        />
        <label htmlFor="task-form-title" className="sr-only">Task title</label>
        <input
          id="task-form-title"
          ref={refs.title}
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Add title"
          className="w-full text-xl text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors duration-200 pr-8"
          maxLength={200}
        />
      </div>

      <div className="px-2">
        <button ref={refs.course} type="button" onClick={() => onToggle("course")} aria-haspopup="dialog" aria-expanded={openPicker === "course"} className={ROW}>
          <BookOpen size={20} className="shrink-0 text-foreground" aria-hidden="true" />
          <span className={`text-sm leading-snug flex-1 min-w-0 truncate ${form.courseName ? "text-foreground" : "text-muted-foreground"}`}>
            {form.courseName || "Set class"}
          </span>
          <ChevronDown size={14} className="shrink-0 text-foreground" aria-hidden="true" />
        </button>

        <div className="flex items-center">
          <button ref={refs.date} type="button" onClick={() => onToggle("date")} aria-haspopup="dialog" aria-expanded={openPicker === "date"} className={`${ROW} w-auto`}>
            <CalendarDays size={20} className="shrink-0 text-foreground" aria-hidden="true" />
            <span className={`text-sm leading-snug ${form.dueDate ? "text-foreground" : "text-muted-foreground"}`}>
              {form.dueDate ? format(new Date(form.dueDate + "T00:00:00"), "EEEE, MMMM d") : "Set date"}
            </span>
          </button>
          <button ref={refs.time} type="button" onClick={() => onToggle("time")} aria-haspopup="dialog" aria-expanded={openPicker === "time"} className={`${ROW} w-auto gap-2`}>
            <Clock size={16} className="shrink-0 text-foreground" aria-hidden="true" />
            <span className={`text-sm leading-snug ${form.dueTime ? "text-foreground" : "text-muted-foreground"}`}>
              {form.dueTime ? formatTime12h(form.dueTime) : "Time"}
            </span>
          </button>
        </div>

        <button ref={refs.repeat} type="button" onClick={() => onToggle("repeat")} aria-haspopup="dialog" aria-expanded={openPicker === "repeat"} className={ROW}>
          <Repeat size={20} className="shrink-0 text-foreground" aria-hidden="true" />
          <span className="text-sm leading-snug text-muted-foreground flex-1 min-w-0 truncate">
            {form.repeatInterval && form.repeatUnit ? getRepeatLabel(form.repeatInterval, form.repeatUnit) : "Does not repeat"}
          </span>
          <ChevronDown size={14} className="shrink-0 text-foreground" aria-hidden="true" />
        </button>

        <button ref={refs.tags} type="button" onClick={() => onToggle("tags")} aria-haspopup="dialog" aria-expanded={openPicker === "tags"} className={`${ROW} items-start`}>
          <Tag size={20} className="shrink-0 mt-0.5 text-foreground" aria-hidden="true" />
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {source && <Badge variant="info">{providerLabel(source)}</Badge>}
            {form.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-600/40 dark:text-blue-400 max-w-[240px]">
                <span className="truncate">{tag}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); removeTag(tag); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); removeTag(tag); } }}
                  className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors cursor-pointer"
                  aria-label={`Remove ${tag}`}
                >
                  <X size={10} />
                </span>
              </span>
            ))}
            {form.tags.length === 0 && !source && <span className="text-sm text-muted-foreground">Add tags</span>}
            {form.tags.length > 0 && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Plus size={12} aria-hidden="true" />
                <span className="text-xs">Tag</span>
              </span>
            )}
          </div>
        </button>

        <div className="flex items-start gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-muted">
          <AlignLeft size={20} className="shrink-0 mt-0.5 text-foreground" aria-hidden="true" />
          <label htmlFor="task-form-description" className="sr-only">Description</label>
          <textarea
            id="task-form-description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Add description"
            rows={5}
            className="flex-1 min-h-[7rem] text-sm text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none resize-y leading-relaxed"
            maxLength={2000}
          />
        </div>
      </div>
    </>
  );
}
