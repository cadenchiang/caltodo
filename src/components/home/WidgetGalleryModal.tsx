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
  Calendar, FileText, CloudSun, MessagesSquare, Timer, Hourglass,
  Link, Flame, Quote, BarChart3, Grid3X3, Smile, Music, Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  WIDGET_REGISTRY,
  type WidgetType,
  type WidgetCategory,
  type WidgetTypeConfig,
} from "@/lib/widget-types";
import { RenderWidget } from "@/components/home/WidgetContainer";

/** Maps widget type to its lucide-react icon for the gallery card label. */
const WIDGET_ICONS: Record<string, LucideIcon> = {
  clock: Clock, "tasks-today": CheckSquare, "class-progress": GraduationCap,
  "google-calendar": Calendar, image: ImageIcon,
  notes: FileText, weather: CloudSun, "cal-chat": MessagesSquare, pomodoro: Timer,
  countdown: Hourglass, "quick-links": Link, "habit-tracker": Flame,
  quote: Quote, stats: BarChart3, "weekly-heatmap": Grid3X3, sticker: Smile, spotify: Music,
};

/** Category filter options for the gallery tabs. */
const CATEGORY_TABS: { key: "all" | WidgetCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "popular", label: "Popular" },
  { key: "productivity", label: "Productivity" },
  { key: "info", label: "Info" },
  { key: "media", label: "Media" },
  { key: "social", label: "Social" },
];

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
 * Single widget card in the gallery grid. Shows live preview, icon, label, and description.
 * Supports click to add and drag to place.
 *
 * @param config - Widget type configuration
 * @param onAdd - Called when clicked
 * @param onDragStart - Called when drag begins
 */
function WidgetCard({
  config,
  onAdd,
  onDragStart,
}: {
  config: WidgetTypeConfig;
  onAdd: () => void;
  onDragStart: () => void;
}) {
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
      className="widget-gallery-card flex flex-col text-left overflow-hidden rounded-lg border border-foreground/[0.09] bg-card cursor-grab active:cursor-grabbing"
    >
      <div
        className="aspect-[4/3] overflow-hidden bg-foreground/[0.02] rounded-t-lg"
        style={{ "--preview-scale": 0.55 } as React.CSSProperties}
      >
        <LivePreview type={config.type} />
      </div>
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
  const [activeCategory, setActiveCategory] = useState<"all" | WidgetCategory>("all");

  /** Groups widgets by category, ordered: Popular first, then rest alphabetically. */
  const groupedWidgets = useMemo(() => {
    const all = Object.values(WIDGET_REGISTRY);
    const query = search.toLowerCase().trim();

    const filtered = all.filter((w) => {
      if (w.hidden) return false;
      const matchesCategory = activeCategory === "all" || w.category === activeCategory;
      const matchesSearch =
        !query ||
        w.label.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    // Group by category
    const groups = new Map<string, WidgetTypeConfig[]>();
    for (const w of filtered) {
      const cat = w.category;
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(w);
    }

    // Sort widgets within each group alphabetically
    for (const [, widgets] of groups) {
      widgets.sort((a, b) => a.label.localeCompare(b.label));
    }

    // Order groups: Popular first, then alphabetical by category label
    const categoryOrder = CATEGORY_TABS.filter((t) => t.key !== "all").map((t) => t.key);
    const ordered: { label: string; widgets: WidgetTypeConfig[] }[] = [];
    for (const key of categoryOrder) {
      const widgets = groups.get(key);
      if (widgets && widgets.length > 0) {
        const tab = CATEGORY_TABS.find((t) => t.key === key);
        ordered.push({ label: tab?.label || key, widgets });
      }
    }

    return ordered;
  }, [search, activeCategory]);

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
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-foreground/[0.05] transition-colors duration-150"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search widgets..."
              className="w-full h-9 pl-9 pr-3 text-[13px] rounded-lg border border-foreground/[0.09] bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-6 pt-3 pb-1 flex gap-1.5 flex-wrap">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-colors duration-150 ${
                activeCategory === tab.key
                  ? "bg-foreground text-background"
                  : "bg-foreground/[0.06] text-muted-foreground hover:bg-foreground/[0.1]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Widget grid grouped by category */}
        <div className="px-6 py-4 max-h-[75vh] overflow-y-auto space-y-6">
          {groupedWidgets.length === 0 && (
            <p className="text-center text-[13px] text-muted-foreground py-8">
              No widgets match your search.
            </p>
          )}
          {groupedWidgets.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-medium text-foreground mb-3">
                {group.label}
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {group.widgets.map((config) => (
                  <WidgetCard
                    key={config.type}
                    config={config}
                    onAdd={() => { onAdd(config.type); onClose(); }}
                    onDragStart={() => onDragStart?.(config.type)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
