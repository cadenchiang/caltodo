"use client";

/**
 * Widget card shell that wraps individual widget components.
 * - Edit mode: jiggle, click opens settings (drag does NOT)
 * - View mode: clean card, click navigates to relevant page
 *
 * @param widget - The widget instance to render
 * @param editMode - Whether the dashboard is in edit mode
 * @param onRemove - Callback to remove this widget
 * @param onSettings - Callback to open settings for this widget (receives id + bounding rect)
 * @param onUpdateConfig - Callback to update widget config (for inline controls)
 * @param isSelected - Whether this widget is currently selected for editing
 */

import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { WidgetInstance } from "@/lib/widget-types";
import ClockWidget from "@/components/home/widgets/ClockWidget";
import TasksTodayWidget from "@/components/home/widgets/TasksTodayWidget";
import GoogleCalendarWidget from "@/components/home/widgets/GoogleCalendarWidget";
import ImageWidget from "@/components/home/widgets/ImageWidget";
import ClassProgressWidget from "@/components/home/widgets/ClassProgressWidget";
import NotesWidget from "@/components/home/widgets/NotesWidget";
import WeatherWidget from "@/components/home/widgets/WeatherWidget";
import CalChatWidget from "@/components/home/widgets/CalChatWidget";
import PomodoroWidget from "@/components/home/widgets/PomodoroWidget";
import CountdownWidget from "@/components/home/widgets/CountdownWidget";
import QuickLinksWidget from "@/components/home/widgets/QuickLinksWidget";
import HabitTrackerWidget from "@/components/home/widgets/HabitTrackerWidget";
import QuoteWidget from "@/components/home/widgets/QuoteWidget";
import StatsWidget from "@/components/home/widgets/StatsWidget";
import WeeklyHeatmapWidget from "@/components/home/widgets/WeeklyHeatmapWidget";
import StickerWidget from "@/components/home/widgets/StickerWidget";
import SpotifyWidget from "@/components/home/widgets/SpotifyWidget";
import MiniCalendarWidget from "@/components/home/widgets/MiniCalendarWidget";
import DailyRemindersWidget from "@/components/home/widgets/DailyRemindersWidget";

/** Drag threshold in pixels — mouse must stay within this to count as a click. */
const DRAG_THRESHOLD = 5;

interface WidgetContainerProps {
  widget: WidgetInstance;
  editMode: boolean;
  onRemove: (id: string) => void;
  onSettings: (id: string, rect: DOMRect) => void;
  onUpdateConfig?: (id: string, config: Record<string, string>) => void;
  isSelected?: boolean;
}

/** Navigation targets for widget click-through in view mode.
 * Note: "tasks-today" intentionally excluded — it has its own
 * built-in TaskPreviewPopover for inline task viewing. */
const CLICK_TARGETS: Partial<Record<string, string>> = {
  "cal-chat": "/app/discussions",
};

/** Maps widget type to its React component. Exported for gallery previews. */
export function RenderWidget({
  widget,
  editMode,
  onUpdateConfig,
  onOpenSettings,
}: {
  widget: WidgetInstance;
  editMode: boolean;
  onUpdateConfig?: (config: Record<string, string>) => void;
  onOpenSettings?: () => void;
}) {
  switch (widget.type) {
    case "clock":
      return <ClockWidget config={widget.config} />;
    case "tasks-today":
      return <TasksTodayWidget config={widget.config} />;
    case "class-progress":
      return <ClassProgressWidget config={widget.config} />;
    case "google-calendar":
      return <GoogleCalendarWidget config={widget.config} editMode={editMode} onUpdateConfig={onUpdateConfig} />;
    case "image":
      return <ImageWidget config={widget.config} widgetId={widget.id} onUpdateConfig={editMode ? onUpdateConfig : undefined} onOpenSettings={onOpenSettings} />;
    case "notes":
      return <NotesWidget config={widget.config} onUpdateConfig={onUpdateConfig} />;
    case "weather":
      return <WeatherWidget config={widget.config} editMode={editMode} />;
    case "cal-chat":
      return <CalChatWidget config={widget.config} />;
    case "pomodoro":
      return <PomodoroWidget config={widget.config} onUpdateConfig={onUpdateConfig} editMode={editMode} />;
    case "countdown":
      return <CountdownWidget config={widget.config} />;
    case "quick-links":
      return <QuickLinksWidget config={widget.config} onUpdateConfig={onUpdateConfig} />;
    case "habit-tracker":
      return <HabitTrackerWidget config={widget.config} onUpdateConfig={onUpdateConfig} />;
    case "quote":
      return <QuoteWidget config={widget.config} />;
    case "stats":
      return <StatsWidget config={widget.config} />;
    case "weekly-heatmap":
      return <WeeklyHeatmapWidget config={widget.config} />;
    case "sticker":
      return <StickerWidget config={widget.config} onUpdateConfig={onUpdateConfig} />;
    case "spotify":
      return <SpotifyWidget config={widget.config} onUpdateConfig={editMode ? onUpdateConfig : undefined} />;
    case "mini-calendar":
      return <MiniCalendarWidget config={widget.config} />;
    case "daily-reminders":
      return <DailyRemindersWidget config={widget.config} onUpdateConfig={onUpdateConfig} />;
    default:
      return null;
  }
}

export default function WidgetContainer({
  widget,
  editMode,
  onRemove,
  onSettings,
  onUpdateConfig,
  isSelected,
}: WidgetContainerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const clickTarget = CLICK_TARGETS[widget.type];
  const isClickable = !editMode && !!clickTarget;

  // Track mouse position to distinguish click from drag
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  /** Records mouse position on press. */
  function handleMouseDown(e: React.MouseEvent) {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  }

  /**
   * Handles mouse-up on the widget card.
   * Only fires action if mouse stayed within DRAG_THRESHOLD (i.e. a genuine click).
   */
  function handleMouseUp(e: React.MouseEvent) {
    if (!mouseDownPos.current) return;

    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);
    mouseDownPos.current = null;

    // If mouse moved too far, treat it as a drag — don't open settings
    if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) return;

    const target = e.target as HTMLElement;
    // Never navigate/open settings when clicking interactive children
    if (target.closest("button, a, input, select, textarea, .no-drag")) return;

    if (editMode) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        onSettings(widget.id, rect);
      }
      return;
    }

    if (isClickable && clickTarget) {
      router.push(clickTarget);
    }
  }

  // Read style config
  const bgColor = widget.config.bgColor || undefined;
  const textColor = widget.config.textColor || undefined;
  const fontFamily = widget.config.fontFamily || undefined;
  const accentColor = widget.config.accentColor || undefined;
  const fontWeight = widget.config.textBold === "true" ? "700" : undefined;
  const fontStyle = widget.config.textItalic === "true" ? ("italic" as const) : undefined;

  // Determine CSS class: selected stops jiggle + shows blue ring, else jiggle in edit mode
  const editClass = isSelected
    ? "widget-selected cursor-pointer"
    : editMode
      ? "widget-jiggle cursor-pointer"
      : "";

  return (
    <div
      ref={containerRef}
      data-widget-id={widget.id}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`h-full w-full ${widget.config.widgetBorder === "false" ? "rounded-none bg-transparent" : "rounded-md bg-transparent border border-foreground/[0.09]"} overflow-hidden ${editClass} ${isClickable ? "cursor-pointer" : ""} ${textColor ? "widget-custom-text" : ""}`}
      style={{
        backgroundColor: bgColor,
        ...(textColor ? { "--widget-text-color": textColor } as React.CSSProperties : {}),
        ...(accentColor ? { "--widget-accent-color": accentColor } as React.CSSProperties : {}),
        fontFamily,
        fontWeight,
        fontStyle,
      }}
    >
      {/* Widget content — disable interactions in edit mode (except image/spotify widgets which need inline interactions) */}
      <div className={`h-full w-full overflow-hidden ${editMode && widget.type !== "image" && widget.type !== "spotify" ? "pointer-events-none" : ""}`}>
        <RenderWidget
          widget={widget}
          editMode={editMode}
          onUpdateConfig={
            onUpdateConfig ? (cfg) => onUpdateConfig(widget.id, cfg) : undefined
          }
          onOpenSettings={() => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) onSettings(widget.id, rect);
          }}
        />
      </div>
    </div>
  );
}
