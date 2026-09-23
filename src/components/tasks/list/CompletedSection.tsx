"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import type { Task } from "@/lib/types";
import IconButton from "@/components/ui/IconButton";
import Popover from "@/components/ui/Popover";
import { HIDE_OPTIONS } from "../board-storage";
import { ITEMS_PER_SECTION } from "../task-list-helpers";
import { MENU_ITEM } from "../shared/SnoozeMenu";
import TaskItem, { type TaskItemProps } from "../TaskItem";
import ListSectionHeader from "./ListSectionHeader";

/** localStorage key remembering whether the section is open. */
const COMPLETED_EXPANDED_KEY = "caltodo_completed_expanded";

interface CompletedSectionProps extends Pick<TaskItemProps, "onToggle" | "onSelect" | "onDelete"> {
  /** Completed tasks inside the auto-hide window. */
  tasks: Task[];
  /** Currently selected task id. */
  selectedTaskId?: string | null;
  /** Current auto-hide window in hours (0 = never). */
  hideHours: number;
  /** Changes the auto-hide window. */
  onHideHoursChange: (hours: number) => void;
}

/**
 * Collapsible "Completed" section with the auto-hide window menu. The
 * menu button is reachable by keyboard (revealed on focus-within) and the
 * menu itself is a Popover with a menu role.
 *
 * @param tasks - Completed tasks (renders nothing when empty)
 * @param hideHours - Auto-hide window
 * @param onHideHoursChange - Persists a new window
 */
export default function CompletedSection({
  tasks,
  selectedTaskId,
  hideHours,
  onHideHoursChange,
  onToggle,
  onSelect,
  onDelete,
}: CompletedSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(COMPLETED_EXPANDED_KEY) === "true") setExpanded(true);
    } catch { /* localStorage unavailable */ }
  }, []);

  if (tasks.length === 0) return null;

  /** Toggles the section and remembers the choice. */
  function toggle() {
    const next = !expanded;
    setExpanded(next);
    try { localStorage.setItem(COMPLETED_EXPANDED_KEY, String(next)); } catch { /* ignore */ }
  }

  const shown = showAll ? tasks : tasks.slice(0, ITEMS_PER_SECTION);

  return (
    <section className="mt-1" aria-label="Completed tasks">
      <ListSectionHeader
        label="Completed"
        count={tasks.length}
        expanded={expanded}
        onToggle={toggle}
        actions={
          <IconButton
            ref={menuBtnRef}
            size="sm"
            bleed
            aria-label="Auto-hide settings"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreVertical size={14} />
          </IconButton>
        }
      />
      <Popover
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorRef={menuBtnRef}
        triggerRef={menuBtnRef}
        placement="bottom-end"
        role="menu"
        aria-label="Auto-hide completed tasks"
        className="min-w-[180px] overflow-hidden"
      >
        <div className="px-3 py-2 border-b border-border">
          <p className="text-xs font-medium text-foreground">Auto-hide after</p>
          <p className="text-3xs text-muted-foreground">Completed tasks disappear after this time</p>
        </div>
        {HIDE_OPTIONS.map((opt) => {
          const active = hideHours === opt.hours;
          return (
            <button
              key={opt.hours}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => { onHideHoursChange(opt.hours); setMenuOpen(false); }}
              className={`${MENU_ITEM} text-xs py-1.5 ${active ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/20 font-medium" : ""}`}
            >
              {opt.label}
              {active && <span className="ml-auto">&#10003;</span>}
            </button>
          );
        })}
      </Popover>

      {expanded && (
        <>
          {shown.map((task) => (
            // px-4 -mx-4 widens the content-visibility:auto paint box into
            // the left gutter so TaskItem's -ml hover background isn't
            // clipped by `contain: paint` (net-zero on content position).
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
