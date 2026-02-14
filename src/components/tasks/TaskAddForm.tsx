"use client";

import { useState, useRef } from "react";
import { Plus, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import type { TaskInsert } from "@/lib/types";
import { TASK_COLORS, DEFAULT_TASK_COLOR } from "@/lib/constants";
import DatePicker from "./DatePicker";
import Popover from "@/components/ui/Popover";

interface TaskAddFormProps {
  onAdd: (task: TaskInsert) => void;
  defaultDate?: string | null;
  placeholder?: string;
}

/**
 * Inline input for adding tasks with gradient border on focus.
 * Calendar and color icons are hidden until the input is focused.
 * Type and press Enter to save.
 *
 * @param onAdd - Callback with the new task data
 * @param defaultDate - Optional default due_date for the task
 * @param placeholder - Optional placeholder text
 */
export default function TaskAddForm({ onAdd, defaultDate, placeholder }: TaskAddFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(defaultDate ?? null);
  const [color, setColor] = useState<string>(DEFAULT_TASK_COLOR);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    onAdd({
      title: trimmed,
      due_date: dueDate,
      color,
    });

    setTitle("");
    setDueDate(defaultDate ?? null);
    setColor(DEFAULT_TASK_COLOR);
    setShowDatePicker(false);
    setShowColorPicker(false);
    inputRef.current?.focus();
  }

  function handleBlur(e: React.FocusEvent) {
    // Only unfocus if the new focus target is outside the container
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setFocused(false);
      setShowDatePicker(false);
      setShowColorPicker(false);
    }
  }

  return (
    <div className="relative mx-4 mt-1 mb-3" ref={containerRef} onBlur={handleBlur}>
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-200 border ${
          focused
            ? "border-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.3)] bg-card"
            : "border-transparent bg-muted/60"
        }`}
      >
        <Plus size={16} className={`shrink-0 transition-colors ${focused ? "text-blue-400" : "text-subtle-foreground"}`} />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder ?? "Add task. Press Enter to save."}
          className="flex-1 text-sm bg-transparent text-foreground placeholder-subtle-foreground focus:outline-none"
        />

        {/* Date badge if a date is selected */}
        {dueDate && (
          <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
            {format(new Date(dueDate + "T00:00:00"), "MMM d")}
          </span>
        )}

        {/* Icons only visible when focused */}
        {focused && (
          <>
            {/* Color indicator dot */}
            <button
              ref={colorButtonRef}
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowDatePicker(false);
              }}
              className="p-1 shrink-0 rounded-lg hover:bg-accent transition-colors"
              aria-label="Pick color"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
            </button>

            {/* Calendar icon */}
            <button
              ref={dateButtonRef}
              type="button"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowColorPicker(false);
              }}
              className="p-1.5 text-subtle-foreground hover:text-blue-500 rounded-lg hover:bg-accent transition-colors shrink-0"
            >
              <CalendarDays size={16} />
            </button>
          </>
        )}
      </form>

      {/* Date picker popup */}
      <Popover
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        triggerRef={dateButtonRef}
        className="absolute right-2 top-full mt-1 z-20"
      >
        <DatePicker
          value={dueDate}
          onChange={(date) => {
            setDueDate(date);
            inputRef.current?.focus();
          }}
        />
      </Popover>

      {/* Color picker popup */}
      <Popover
        open={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        triggerRef={colorButtonRef}
        className="absolute right-12 top-full mt-1 z-20"
      >
        <div className="bg-card rounded-xl shadow-2xl border border-border p-3">
          <div className="flex gap-2">
            {TASK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setShowColorPicker(false);
                  inputRef.current?.focus();
                }}
                className={`w-6 h-6 rounded-full transition-all ${
                  color === c ? "scale-125" : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </Popover>
    </div>
  );
}
