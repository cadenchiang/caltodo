"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import TaskItem, { type TaskItemProps } from "../TaskItem";
import { ITEMS_PER_SECTION, LATER_DAYS } from "../task-list-helpers";
import ListSectionHeader from "./ListSectionHeader";

interface LaterSectionProps extends Pick<TaskItemProps, "onToggle" | "onSelect" | "onDelete"> {
  /** Tasks due more than LATER_DAYS out. */
  tasks: Task[];
  /** Currently selected task id. */
  selectedTaskId?: string | null;
}

/**
 * Collapsed "Later" section for tasks due more than {@link LATER_DAYS} days
 * out. The inbox used to drop these silently; now they are one click away
 * and the header carries the count.
 *
 * @param tasks - Far-out tasks (renders nothing when empty)
 */
export default function LaterSection({ tasks, selectedTaskId, onToggle, onSelect, onDelete }: LaterSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (tasks.length === 0) return null;

  const shown = showAll ? tasks : tasks.slice(0, ITEMS_PER_SECTION);

  return (
    <section className="mt-1" aria-label={`Later, due in more than ${LATER_DAYS} days`}>
      <ListSectionHeader label="Later" count={tasks.length} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      {expanded && (
        <>
          {shown.map((task) => (
            <div key={task.id} className="cv-auto-task px-4 -mx-4">
              <TaskItem
                task={task}
                isSelected={selectedTaskId === task.id}
                onToggle={onToggle}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            </div>
          ))}
          {tasks.length > ITEMS_PER_SECTION && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="px-8 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
            >
              {showAll ? "Show less" : `+${tasks.length - ITEMS_PER_SECTION} more`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
