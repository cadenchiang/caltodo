"use client";

/**
 * Modal showing available widget types to add to the dashboard.
 * Displays a grid of widget cards with live mini previews (the actual
 * widget components scaled down). Click to add, or drag to place.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param onAdd - Callback when a widget type is selected (receives WidgetType)
 * @param onDragStart - Callback when a widget card drag begins (for drag-to-place)
 */

import React from "react";
import {
  X, CheckSquare, Clock, ImageIcon, GraduationCap,
  Calendar, FileText, CloudSun, MessagesSquare, Timer, Hourglass,
  Link, Flame, Quote, BarChart3, Grid3X3, Smile, Music,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WIDGET_REGISTRY, type WidgetType } from "@/lib/widget-types";
import { RenderWidget } from "@/components/home/WidgetContainer";

/** Maps widget type to its lucide-react icon for the gallery card label. */
const WIDGET_ICONS: Record<string, LucideIcon> = {
  clock: Clock, "tasks-today": CheckSquare, "class-progress": GraduationCap,
  "google-calendar": Calendar, image: ImageIcon,
  notes: FileText, weather: CloudSun, "cal-chat": MessagesSquare, pomodoro: Timer,
  countdown: Hourglass, "quick-links": Link, "habit-tracker": Flame,
  quote: Quote, stats: BarChart3, "weekly-heatmap": Grid3X3, sticker: Smile, spotify: Music,
};

/**
 * Renders the real widget component scaled down to fit the gallery thumbnail.
 * The widget is rendered at full size (320×240) inside a clipped container,
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
 * Minimal error boundary — catches render errors from widgets that depend
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
  if (!open) return null;

  const widgetTypes = Object.values(WIDGET_REGISTRY);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-announce-backdrop-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[640px] mx-4 animate-announce-card-in overflow-hidden flex flex-col bg-popover rounded-[12px] border border-foreground/[0.09] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_3px_6px_rgba(0,0,0,0.06),0_9px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_3px_6px_rgba(0,0,0,0.2),0_9px_24px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.09]">
          <h2 className="text-[15px] font-semibold text-foreground">
            Widget Library
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-foreground/[0.05] transition-colors duration-150"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Widget grid — --preview-scale computed from thumbnail width / 320 */}
        <div className="px-6 py-5 grid grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
          {widgetTypes.map((config) => (
            <div
              key={config.type}
              role="button"
              tabIndex={0}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", config.type);
                setTimeout(() => onDragStart?.(config.type), 0);
              }}
              onClick={() => {
                onAdd(config.type);
                onClose();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { onAdd(config.type); onClose(); }
              }}
              className="widget-gallery-card flex flex-col text-left overflow-hidden rounded-lg border border-foreground/[0.09] bg-card cursor-grab active:cursor-grabbing"
            >
              {/* Preview thumbnail — scale = container width / 320 ≈ 0.55 */}
              <div
                className="aspect-[4/3] overflow-hidden bg-foreground/[0.02] rounded-t-lg"
                style={{ "--preview-scale": 0.55 } as React.CSSProperties}
              >
                <LivePreview type={config.type} />
              </div>

              {/* Label + description */}
              <div className="px-3.5 pt-2.5 pb-3">
                <span className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                  {(() => { const Icon = WIDGET_ICONS[config.type]; return Icon ? <Icon size={13} className="text-muted-foreground shrink-0" /> : null; })()}
                  {config.label}
                </span>
                <span className="text-[11.5px] leading-snug mt-0.5 text-muted-foreground block">
                  {config.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
