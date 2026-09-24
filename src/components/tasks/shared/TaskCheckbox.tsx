/**
 * Unified task completion checkbox used across TaskItem, TaskCard,
 * TaskDetailPanel, and TaskPreviewPopover.
 *
 * Three sizes:
 * - "xs" (12px): used in compact list rows
 * - "sm" (14px): used in board cards
 * - "lg" (20px): used in detail panel and popover previews
 *
 * Every size shows a ghost checkmark on hover, so an empty box reads as
 * something to click rather than decoration. The hit area is 44px at every
 * size (an ::after pseudo-element) while the visual box keeps its size.
 */

interface TaskCheckboxProps {
  /** Task dot color (hex string). */
  color: string;
  /** Whether the task is currently completed. */
  isCompleted: boolean;
  /** Toggle completion callback. */
  onToggle: () => void;
  /** Checkbox size variant. Defaults to "sm". */
  size?: "xs" | "sm" | "lg";
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
  const isXs = size === "xs";
  const sizeClass = isLg ? "w-5 h-5" : isXs ? "w-3.5 h-3.5" : "w-4 h-4";
  // The painted box stays small; an invisible pseudo-element grows the hit
  // area to 44px (WCAG 2.5.8) without moving the neighbours.
  const hitArea = isLg ? "after:-inset-3" : isXs ? "after:-inset-[15px]" : "after:-inset-3.5";
  // Thinner borders for smaller sizes.
  const borderWidth = isLg ? "1.25px" : "1px";
  const svgWidth = isLg ? 10 : isXs ? 7 : 8;
  const svgHeight = isLg ? 8 : isXs ? 5 : 6;
  const strokeWidth = isLg ? 2 : isXs ? 1.4 : 1.5;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className={`group/check relative flex-shrink-0 ${sizeClass} rounded-[4px] flex items-center justify-center transition-all cursor-pointer after:absolute after:content-[''] ${hitArea} ${
        isLg ? "mt-1" : ""
      }`}
      style={{
        backgroundColor: isCompleted ? (color || "var(--subtle-foreground)") : "transparent",
        border: isCompleted ? "none" : `${borderWidth} solid ${color || "var(--subtle-foreground)"}`,
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
      ) : (
        // Ghost checkmark: faint when the surrounding row is hovered, full
        // strength on the box itself. The large size used to opt out of this,
        // so the detail panel's box gave no sign it could be clicked.
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox="0 0 10 8"
          fill="none"
          className="opacity-0 group-hover:opacity-70 group-hover/check:opacity-100 transition-opacity"
        >
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke={color || "var(--subtle-foreground)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
