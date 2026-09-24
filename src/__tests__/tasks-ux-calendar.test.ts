/**
 * Audit section 4, calendar: month cells clipped the 4th bar and "N more";
 * mobile month was decorative dots with no tap or add; week view at 390px
 * was 51px columns; the header promised "Google Calendar synced" while
 * calendarMode was hardcoded; drops toasted before the write with a
 * duplicate undo; virtual repeats dragged to nothing; bar titles failed
 * contrast; hardcoded #0e89d6 and gray tokens.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { computeVisibleItems } from "@/components/calendar/CalendarDayCell";
import { computeOverflowPosition } from "@/components/calendar/DayOverflowPopover";
import { formatTimeCompact } from "@/components/calendar/CalendarTaskBar";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("computeVisibleItems", () => {
  it("shows everything when it fits and reserves a line for N more otherwise", () => {
    // 24px header + 4px padding; compact bars are 17px each.
    expect(computeVisibleItems(200, 24, 17, 3)).toBe(3);
    expect(computeVisibleItems(80, 24, 17, 5)).toBe(2);
    expect(computeVisibleItems(40, 24, 17, 5)).toBe(1);
    expect(computeVisibleItems(400, 24, 17, 0)).toBe(0);
  });

  it("never hides exactly one item behind a more line", () => {
    // Four items in a cell that fits three: show three plus "1 more", not
    // two plus "2 more".
    expect(computeVisibleItems(24 + 4 + 17 * 4 + 5, 24, 17, 4)).toBe(4);
    expect(computeVisibleItems(24 + 4 + 17 * 3 + 16, 24, 17, 4)).toBe(3);
  });
});

describe("computeOverflowPosition", () => {
  it("flips to the left of the cell when there is no room on the right", () => {
    const pos = computeOverflowPosition({ left: 900, right: 1000, top: 100, width: 100 }, { width: 1100, height: 800 });
    expect(pos.left).toBe(900 - 260 - 8);
  });
  it("clamps to the viewport bottom", () => {
    const pos = computeOverflowPosition({ left: 10, right: 110, top: 700, width: 100 }, { width: 1100, height: 800 });
    expect(pos.top).toBe(800 - 340 - 16);
  });
});

describe("CalendarDayCell", () => {
  const src = read("components/calendar/CalendarDayCell.tsx");
  it("derives the bar budget from the measured cell height", () => {
    expect(src).toContain("new ResizeObserver(([entry]) => setCellHeight(entry.contentRect.height))");
    expect(src).toContain("computeVisibleItems(cellHeight, headerH, itemH, totalItems)");
    expect(src).not.toContain("MAX_ITEMS_PER_CELL");
  });
  it("opens the day sheet on a phone tap and has no hardcoded blue, gray or uppercase labels", () => {
    expect(src).toContain("if (isMobile && onShowMore && cellRef.current) onShowMore(dateStr");
    expect(src).not.toContain("#0e89d6");
    expect(src).not.toContain("gray-");
    expect(src).not.toContain("uppercase");
    expect(src).toContain("aria-label={`Add task on ${format(day, \"MMMM d\")}`}");
  });
});

describe("DayOverflowPopover", () => {
  const src = read("components/calendar/DayOverflowPopover.tsx");
  it("is a dialog on useDialog, a bottom sheet with an Add button on phones", () => {
    expect(src).toContain('import { useDialog } from "@/components/ui/useDialog";');
    expect(src).toContain("MODAL_BACKDROP");
    expect(src).toContain("rounded-t-2xl");
    expect(src).toContain("Add task");
    expect(src).not.toContain("gray-");
  });
});

describe("AssignmentsWeekView", () => {
  const src = read("components/calendar/AssignmentsWeekView.tsx");
  it("renders a stacked agenda below md", () => {
    expect(src).toContain("if (isMobile) {");
    expect(src).toContain('<section key={dateStr} aria-label={format(day, "EEEE, MMMM d")}');
    expect(src).not.toContain("#0e89d6");
    expect(src).not.toContain("uppercase");
  });
});

describe("CalendarTaskBar", () => {
  const src = read("components/calendar/CalendarTaskBar.tsx");
  it("puts the title in text-foreground and only drags with a drop target", () => {
    expect(src).toContain("truncate text-foreground");
    expect(src).toContain("const canDrag = draggable && !isPending && !isVirtualRepeatInstance(task.id);");
    expect(src).toContain("draggable = false,");
    expect(formatTimeCompact("23:59")).toBe("11:59p");
    expect(formatTimeCompact("09:00")).toBe("9a");
  });
});

describe("CalendarPanel", () => {
  const src = read("components/calendar/CalendarPanel.tsx");
  it("awaits the drop, announces once through pushUndo, and reads the saved view up front", () => {
    expect(src).toContain('const written = await updateTask(taskId, { due_date: newDate }, { announce: false });');
    expect(src).toContain("pushUndo({");
    expect(src).not.toContain('showToast(`Moved');
    expect(src).toContain("useState<CalendarViewMode>(readSavedViewMode)");
    expect(src).toContain("See caltodo-ux-audit-2026-09-23.md, section 4.");
    expect(src).not.toContain("window.location.reload()");
    expect(src).toContain("onAdd={modals.handleDayClick}");
  });
});

describe("CalendarHeader", () => {
  const src = read("components/calendar/CalendarHeader.tsx");
  it("does not promise a Google Calendar event overlay and uses the primitives", () => {
    expect(src).not.toContain("Google Calendar synced");
    expect(src).not.toContain("Viewing events from Google Calendar");
    expect(src).not.toContain("Add task or event");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("#0e89d6");
    expect(src).toContain("Sync classes");
    expect(src).toContain('import Popover from "@/components/ui/Popover";');
    expect(src).toContain('aria-label="Add task"');
  });
});
