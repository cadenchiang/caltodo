"use client";

/**
 * Modal showing available widget types to add to the dashboard.
 * Displays a grid of widget cards with live mini previews (the actual
 * widget components scaled down). Click to add, or drag to place.
 * Includes search filtering and category tabs.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param onAdd - Callback when a widget type is selected (receives WidgetType)
 * @param onDragStart - Callback when a widget card drag begins (for drag-to-place)
 */

import React, { useState, useMemo } from "react";
import {
  X, CheckSquare, Clock, ImageIcon, GraduationCap,
  Calendar, CloudSun, Timer, Grid3X3, Music, Search,
  User, Sunrise, BookOpen, ListChecks,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  WIDGET_REGISTRY,
  type WidgetType,
  type WidgetTypeConfig,
} from "@/lib/widget-types";
import { RenderWidget } from "@/components/home/WidgetContainer";

/** Maps widget type to its lucide-react icon for the gallery card label.
 *  Every visible widget must have an entry here — without an icon the
 *  row renders title-only and reads as a section header. */
const WIDGET_ICONS: Record<string, LucideIcon> = {
  profile: User,
  intro: Sunrise,
  clock: Clock,
  "tasks-today": CheckSquare,
  "class-progress": GraduationCap,
  "google-calendar": Calendar,
  image: ImageIcon,
  weather: CloudSun,
  pomodoro: Timer,
  "weekly-heatmap": Grid3X3,
  spotify: Music,
  "daily-reminders": ListChecks,
  courses: BookOpen,
};

/**
 * Renders the real widget component scaled down to fit the gallery thumbnail.
 * The widget is rendered at full size (320x240) inside a clipped container,
 * then CSS-scaled to fill the thumbnail area. pointer-events-none prevents
 * interactions. Falls back to an empty box on error.
 *
 * @param type - The widget type to preview
 */
function LivePreview({ type }: { type: WidgetType }) {
  const widget = { id: `preview-${type}`, type, config: {} };

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div
        className="absolute top-0 left-0 pointer-events-none origin-top-left"
        style={{ width: 320, height: 240, transform: "scale(var(--preview-scale))" }}
      >
        <LivePreviewErrorBoundary>
          <RenderWidget widget={widget} editMode={false} />
        </LivePreviewErrorBoundary>
      </div>
    </div>
  );
}

/**
 * Minimal error boundary -- catches render errors from widgets that depend
 * on contexts not available inside the gallery (e.g. TaskContext).
 * Renders an empty placeholder on error.
 */
class LivePreviewErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="w-full h-full" />;
    }
    return this.props.children;
  }
}

/**
 * Single widget row in the gallery list. Flat layout: black icon on
 * the left, label + description stacked beside it. No preview tile —
 * the previews were too noisy to scan. Click/drag still adds.
 *
 * @param config - Widget type configuration
 * @param onAdd - Called when clicked
 * @param onDragStart - Called when drag begins
 */
function WidgetRow({
  config,
  onAdd,
  onDragStart,
}: {
  config: WidgetTypeConfig;
  onAdd: () => void;
  onDragStart: () => void;
}) {
  const Icon = WIDGET_ICONS[config.type];
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", config.type);
        setTimeout(onDragStart, 0);
      }}
      onClick={onAdd}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onAdd();
      }}
      className="flex items-center gap-3 px-4 py-3 text-left cursor-grab active:cursor-grabbing hover:bg-foreground/[0.04] transition-colors"
    >
      {Icon && (
        <Icon size={18} className="text-foreground shrink-0" strokeWidth={2.4} />
      )}
      <div className="text-[14px] font-bold text-foreground truncate">
        {config.label}
      </div>
    </div>
  );
}

interface WidgetGalleryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType) => void;
  /** Called when the user starts dragging a widget card (for drag-to-place). */
  onDragStart?: (type: WidgetType) => void;
}

export default function WidgetGalleryModal({
  open,
  onClose,
  onAdd,
  onDragStart,
}: WidgetGalleryModalProps) {
  const [search, setSearch] = useState("");

  /** Flat alphabetical list — no category headers, no grid; one row per widget. */
  const filteredWidgets = useMemo(() => {
    const all = Object.values(WIDGET_REGISTRY);
    const query = search.toLowerCase().trim();

    return all
      .filter((w) => {
        if (w.hidden) return false;
        if (!query) return true;
        return (
          w.label.toLowerCase().includes(query) ||
          w.description.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-announce-backdrop-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[800px] mx-4 animate-announce-card-in overflow-hidden flex flex-col bg-popover rounded-[12px] border border-foreground/[0.09] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_3px_6px_rgba(0,0,0,0.06),0_9px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_3px_6px_rgba(0,0,0,0.2),0_9px_24px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.09]">
          <h2 className="text-[15px] font-semibold text-foreground">
            Widget Library
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-foreground hover:bg-foreground/[0.05] transition-colors duration-150"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search widgets..."
              className="w-full h-9 pl-9 pr-3 text-[13px] rounded-lg border border-foreground/[0.09] bg-background text-foreground placeholder:text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>
        </div>

        {/* Flat continuous list — black icons, no previews, no category tabs. */}
        <div className="px-2 py-2 max-h-[75vh] overflow-y-auto">
          {filteredWidgets.length === 0 ? (
            <p className="text-center text-[13px] text-foreground py-8">
              No widgets match your search.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-foreground/[0.06]">
              {filteredWidgets.map((config) => (
                <WidgetRow
                  key={config.type}
                  config={config}
                  onAdd={() => { onAdd(config.type); onClose(); }}
                  onDragStart={() => onDragStart?.(config.type)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
