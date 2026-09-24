/**
 * Guards the proof-of-primitive call sites: the four migrated modals, the
 * seven popover backgrounds, the dark-mode shadow rule, and the dead files.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("migrated modals", () => {
  it("SignOutConfirmModal is a ConfirmDialog with glossary copy", () => {
    const src = read("components/ui/SignOutConfirmModal.tsx");
    expect(src).toContain('import ConfirmDialog from "@/components/ui/ConfirmDialog";');
    expect(src).toContain("title={AUTH.signOutConfirmTitle}");
    expect(src).toContain("destructive");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("#d96b5e");
  });

  it("ContactModal uses Modal, TextArea and an inverted Button", () => {
    const src = read("components/ui/ContactModal.tsx");
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).toContain('import TextArea from "@/components/ui/TextArea";');
    expect(src).toContain('variant="inverted"');
    expect(src).toContain("initialFocusRef={textareaRef}");
    expect(src).not.toContain("createPortal");
    expect(src).not.toContain("bg-foreground text-background");
  });

  it("CanvasTokenExpiredModal uses Modal and the warning tokens", () => {
    const src = read("components/ui/CanvasTokenExpiredModal.tsx");
    expect(src).toContain("<Modal");
    expect(src).toContain("bg-warning-tint");
    expect(src).toContain("text-warning");
    expect(src).not.toContain("animate-modal-in");
    expect(src).not.toContain("z-[9999]");
  });

  it("CourseTasksModal uses Modal instead of the undefined animate-scale-in", () => {
    const src = read("components/courses/CourseTasksModal.tsx");
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).toContain('size="xl"');
    expect(src).not.toContain("animate-scale-in");
    expect(src).not.toContain("<X ");
  });

  it("TaskCreateModal is built on Modal (which owns the overlay layer)", () => {
    const src = read("components/tasks/TaskCreateModal.tsx");
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).not.toContain("createPortal");
  });
});

describe("popover backgrounds", () => {
  it.each([
    ["components/onboarding/SearchableSelect.tsx", "mt-1 w-full bg-popover border"],
    ["components/discussions/ChatInput.tsx", "z-30 bg-popover shadow-xl rounded-xl"],
    // TaskItem's menus now render through TaskContextMenu, which uses the
    // Popover primitive (POPOVER_SURFACE carries bg-popover).
    ["components/tasks/shared/TaskContextMenu.tsx", 'import Popover, { POPOVER_SURFACE } from "@/components/ui/Popover";'],
    // Board card and column menus also render through the Popover primitive.
    ["components/tasks/board/BoardTaskCard.tsx", 'import TaskContextMenu from "../shared/TaskContextMenu";'],
    ["components/tasks/board/BoardColumn.tsx", 'import ClassMenu from "../shared/ClassMenu";'],
    ["components/calendar/DayOverflowPopover.tsx", "pointer-events-auto bg-popover border border-border"],
  ])("%s paints bg-popover", (file, needle) => {
    expect(read(file)).toContain(needle);
  });
});

describe("dark-mode shadow rule", () => {
  it.each([
    ["app/app/home/HomeBoard.tsx", 2],
    ["components/ui/EditToggleButton.tsx", 1],
    ["components/home/PaletteModal.tsx", 1],
    ["components/home/WidgetEditorPanel.tsx", 1],
    ["components/home/widgets/QuoteWidget.tsx", 1],
    ["components/home/widgets/PomodoroWidget.tsx", 1],
    ["components/home/widgets/SpotifyWidget.tsx", 1],
    ["components/tasks/DatePicker.tsx", 1],
    ["components/calendar/CalendarHeader.tsx", 1],
    ["components/calendar/CalendarSettingsPopover.tsx", 2],
  ])("%s has %i dark:shadow-none", (file, count) => {
    const matches = read(file).match(/dark:shadow-none/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(count);
  });
});

describe("dead ui files", () => {
  it.each([
    "radix-popover.tsx",
    "button.tsx",
    "badge.tsx",
    "avatar.tsx",
    "shimmer-button.tsx",
    "interactive-hover-button.tsx",
    "GCalAnnouncementModal.tsx",
  ])("%s is gone", (file) => {
    // Case-insensitive file systems would match Button.tsx for button.tsx, so
    // check the directory listing rather than existsSync alone.
    const names = readdirSync(path.resolve(__dirname, "../components/ui"));
    expect(names).not.toContain(file);
  });
});
