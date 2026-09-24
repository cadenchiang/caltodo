"use client";

import { useEffect, useState } from "react";
import { Check, Eye, Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";
import IconButton from "@/components/ui/IconButton";
import { formatCountdown } from "../task-list-helpers";
import ListSectionHeader from "./ListSectionHeader";

interface HiddenSectionProps {
  /** Tasks hidden by an unexpired snooze. */
  tasks: Task[];
  /** Clears the snooze. */
  onUnhide: (id: string) => void;
  /** Marks the task done. */
  onToggle: (id: string) => void;
  /** Deletes the task. */
  onDelete: (id: string) => void;
}

/**
 * Collapsible "Hidden" section: each snoozed task with its countdown and
 * Unhide / Complete / Delete controls. The countdown refreshes every minute
 * while the section is open.
 *
 * @param tasks - Snoozed tasks (renders nothing when empty)
 * @param onUnhide - Clears the snooze on a task
 * @param onToggle - Completes a task
 * @param onDelete - Deletes a task
 */
export default function HiddenSection({ tasks, onUnhide, onToggle, onDelete }: HiddenSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // 60-second interval to refresh countdown timers while open.
  useEffect(() => {
    if (!expanded) return;
    setNowMs(Date.now());
    const timer = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [expanded]);

  if (tasks.length === 0) return null;

  return (
    <section className="mt-1" aria-label="Hidden tasks">
      <ListSectionHeader label="Hidden" count={tasks.length} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      {expanded &&
        tasks.map((task) => (
          <div key={task.id} className="cv-auto-task">
            <div className="group flex items-center px-4 py-2 rounded-xl focus-within:bg-foreground/[0.035] dark:focus-within:bg-foreground/[0.07]">
              <span className="text-sm text-foreground truncate flex-1 min-w-0">{task.title}</span>
              <span className="text-xs text-subtle-foreground tabular-nums mr-2 shrink-0">
                {formatCountdown(task.snoozed_until!, nowMs)}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                <IconButton size="sm" bleed aria-label={`Unhide ${task.title}`} title="Unhide" onClick={() => onUnhide(task.id)}>
                  <Eye size={14} />
                </IconButton>
                <IconButton
                  size="sm"
                  bleed
                  aria-label={`Complete ${task.title}`}
                  title="Complete"
                  className="hover:text-success"
                  onClick={() => onToggle(task.id)}
                >
                  <Check size={14} />
                </IconButton>
                <IconButton
                  size="sm"
                  bleed
                  aria-label={`Delete ${task.title}`}
                  title="Delete"
                  className="hover:text-danger"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </div>
          </div>
        ))}
    </section>
  );
}
