/**
 * Daily reminders widget — checkbox list that persists items
 * but resets check state at the start of each new day.
 * Uses localStorage for persistence, keyed by widget config.
 *
 * @param config - Widget config with stored reminders JSON
 * @param onUpdateConfig - Callback to persist config changes
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";

interface DailyRemindersWidgetProps {
  config?: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

interface ReminderItem {
  id: string;
  text: string;
}

interface CheckState {
  date: string;
  checked: Record<string, boolean>;
}

/**
 * Returns today's date as YYYY-MM-DD string.
 *
 * @returns Date string for today
 */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Generates a short unique ID for a reminder item.
 *
 * @returns Unique string ID
 */
function genId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export default function DailyRemindersWidget({
  config,
  onUpdateConfig,
}: DailyRemindersWidgetProps) {
  // Parse stored reminders from config
  const [items, setItems] = useState<ReminderItem[]>(() => {
    try {
      return config?.reminders ? JSON.parse(config.reminders) : [];
    } catch {
      return [];
    }
  });

  // Check state resets daily
  const [checkState, setCheckState] = useState<CheckState>(() => {
    try {
      const stored = config?.checkState ? JSON.parse(config.checkState) : null;
      if (stored && stored.date === todayKey()) return stored;
      return { date: todayKey(), checked: {} };
    } catch {
      return { date: todayKey(), checked: {} };
    }
  });

  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when adding mode activates
  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  // Reset checks at midnight
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const ms = midnight.getTime() - now.getTime();
    const timer = setTimeout(() => {
      setCheckState({ date: todayKey(), checked: {} });
    }, ms);
    return () => clearTimeout(timer);
  }, [checkState.date]);

  /**
   * Persists items and check state to widget config.
   *
   * @param newItems - Updated reminder items
   * @param newCheckState - Updated check state
   */
  function persist(newItems: ReminderItem[], newCheckState: CheckState) {
    onUpdateConfig?.({
      ...config,
      reminders: JSON.stringify(newItems),
      checkState: JSON.stringify(newCheckState),
    });
  }

  /**
   * Toggles the checked state of a reminder item.
   *
   * @param id - The reminder item ID to toggle
   */
  function toggleCheck(id: string) {
    const next: CheckState = {
      ...checkState,
      checked: {
        ...checkState.checked,
        [id]: !checkState.checked[id],
      },
    };
    setCheckState(next);
    persist(items, next);
  }

  /**
   * Adds a new reminder item to the list.
   */
  function addItem() {
    const text = newText.trim();
    if (!text) return;
    const item: ReminderItem = { id: genId(), text };
    const next = [...items, item];
    setItems(next);
    setNewText("");
    setAdding(false);
    persist(next, checkState);
  }

  /**
   * Removes a reminder item from the list.
   *
   * @param id - The reminder item ID to remove
   */
  function removeItem(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    const nextCheck = { ...checkState };
    delete nextCheck.checked[id];
    setCheckState(nextCheck);
    persist(next, nextCheck);
  }

  return (
    <div className="h-full w-full flex flex-col p-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">– reminders</span>
        <button
          onClick={() => setAdding(true)}
          className="w-5 h-5 rounded-full flex items-center justify-center text-foreground hover:text-foreground transition-colors"
          title="Add reminder"
        >
          <Plus size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* Reminder list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {items.map((item) => {
          const checked = !!checkState.checked[item.id];
          return (
            <label
              key={item.id}
              className="flex items-center gap-2 group cursor-pointer py-0.5"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCheck(item.id)}
                className="w-3.5 h-3.5 rounded border-border accent-foreground shrink-0"
              />
              <span
                className={`text-xs flex-1 leading-tight transition-all ${
                  checked
                    ? "line-through text-foreground/50"
                    : "text-foreground"
                }`}
              >
                {item.text}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeItem(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-foreground hover:text-foreground transition-opacity shrink-0"
              >
                <X size={10} />
              </button>
            </label>
          );
        })}

        {/* Inline add input */}
        {adding && (
          <div className="flex items-center gap-2 py-0.5">
            <div className="w-3.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewText("");
                }
              }}
              onBlur={() => {
                if (newText.trim()) addItem();
                else {
                  setAdding(false);
                  setNewText("");
                }
              }}
              placeholder="New reminder..."
              className="text-xs bg-transparent border-none outline-none text-foreground placeholder:text-foreground/50 flex-1"
            />
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && !adding && (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-foreground/50">
              Click + to add reminders
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
