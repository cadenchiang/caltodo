/**
 * Unified task completion checkbox used across TaskItem, TaskCard,
 * TaskDetailPanel, and TaskPreviewPopover.
 *
 * Two sizes:
 * - "sm" (14px): used in list rows and board cards, with ghost checkmark on hover
 * - "lg" (20px): used in detail panel and popover previews
 */

interface TaskCheckboxProps {
  /** Task dot color (hex string). */
  color: string;
  /** Whether the task is currently completed. */
  isCompleted: boolean;
  /** Toggle completion callback. */
  onToggle: () => void;
  /** Checkbox size variant. Defaults to "sm". */
  size?: "sm" | "lg";
}

/**
 * Renders a colored checkbox square that toggles task completion.
 *
 * @param color - The task's color (hex)
 * @param isCompleted - Current completion state
 * @param onToggle - Called when the checkbox is clicked
 * @param size - "sm" (14px, list/card) or "lg" (20px, detail/popover)
 */
export default function TaskCheckbox({
  color,
  isCompleted,
  onToggle,
  size = "sm",
}: TaskCheckboxProps) {
  const isLg = size === "lg";
  const sizeClass = isLg ? "w-5 h-5" : "w-4 h-4";
  // Thicker borders so the squircle reads more clearly at small sizes —
  // small bumped from 1px → 1.75px, large from 1.5px → 2px.
  const borderWidth = isLg ? "2px" : "1.75px";
  const svgWidth = isLg ? 10 : 8;
  const svgHeight = isLg ? 8 : 6;
  const strokeWidth = isLg ? 2 : 1.5;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`group/check flex-shrink-0 ${sizeClass} rounded-[4px] flex items-center justify-center transition-all cursor-pointer ${
        isLg ? "mt-1" : ""
      }`}
      style={{
        backgroundColor: isCompleted ? (color || "#D1D5DB") : "transparent",
        border: isCompleted ? "none" : `${borderWidth} solid ${color || "#D1D5DB"}`,
      }}
      aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
    >
      {isCompleted ? (
        <svg width={svgWidth} height={svgHeight} viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="white"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : !isLg ? (
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox="0 0 10 8"
          fill="none"
          className="opacity-0 group-hover/check:opacity-40 transition-opacity"
        >
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke={color || "#D1D5DB"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </button>
  );
}
