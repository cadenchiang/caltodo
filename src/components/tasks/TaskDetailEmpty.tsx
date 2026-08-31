"use client";

/**
 * Placeholder shown in the detail panel when no task is selected.
 * Split out of TaskDetailPanel to keep that file focused on the editor.
 */

import { useTheme } from "@/contexts/ThemeContext";

/**
 * Renders the illustration and prompt for the unselected state.
 *
 * @returns The empty panel, themed for the active colour theme
 */
export default function TaskDetailEmpty() {
  const { colorTheme } = useTheme();

  return (
    <div className="flex-1 h-full border-l border-border flex flex-col items-center justify-center p-5 pb-24 gap-3">
      {colorTheme === "miffy" ? (
        <img
          src="/miffy/miffy-snoopy.png"
          alt=""
          className="w-32 h-auto opacity-60 select-none pointer-events-none"
          draggable={false}
        />
      ) : (
        <img
          src="/empty-task-illustration.png"
          alt=""
          className="w-72 h-auto select-none pointer-events-none dark:invert dark:opacity-80"
          draggable={false}
        />
      )}
      <p className="text-sm text-muted-foreground">Select a task to view details</p>
    </div>
  );
}
