/**
 * Modal for choosing a board template.
 * Large modal with sidebar categories and visual board preview cards.
 * Applying a template replaces all widgets and board settings.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Close callback
 * @param onApply - Called with the chosen template
 */

"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import {
  BOARD_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type BoardTemplate,
  type TemplateCategory,
} from "@/lib/board-templates";
import { WIDGET_REGISTRY } from "@/lib/widget-types";
import { resolvePreset } from "@/lib/board-cover-presets";

interface BoardTemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (template: BoardTemplate) => void;
}

/** Grid columns for the miniature widget layout preview. */
const PREVIEW_COLS = 8;
/** Height of one grid unit in the preview (px). */
const PREVIEW_UNIT = 18;

/**
 * Renders a miniature board preview showing the cover and widget grid layout.
 *
 * @param template - The template to preview
 */
function TemplatePreview({ template }: { template: BoardTemplate }) {
  const { layout } = template;
  const lgLayout = layout.layouts.lg || [];

  // Resolve cover background
  const coverStyle = useMemo(() => {
    const url = layout.coverImageUrl;
    if (!url) return { background: "#e5e7eb" };
    if (url.startsWith("preset:")) {
      const preset = resolvePreset(url);
      if (preset.imageUrl) return { backgroundImage: `url(${preset.imageUrl})`, backgroundSize: "cover", backgroundPosition: `center ${layout.coverPositionY ?? 50}%` };
      if (preset.background) return { background: preset.background };
    }
    return { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" };
  }, [layout.coverImageUrl, layout.coverPositionY]);

  // Compute grid height from layout items
  const maxY = lgLayout.reduce((max, item) => Math.max(max, (item.y || 0) + (item.h || 1)), 0);
  const gridHeight = Math.max(maxY * PREVIEW_UNIT, PREVIEW_UNIT * 2);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border/50 bg-card">
      {/* Mini cover */}
      <div className="w-full h-12 relative" style={coverStyle}>
        {/* Emoji overlay */}
        <div className="absolute -bottom-2 left-3 text-base leading-none bg-card rounded-md px-0.5">
          {layout.boardEmoji || "\u{1F4D6}"}
        </div>
      </div>

      {/* Mini widget grid */}
      <div className="px-2 pt-4 pb-2 relative" style={{ height: `${gridHeight + 16}px` }}>
        {lgLayout.map((item) => {
          const widget = layout.widgets.find((w) => w.id === item.i);
          const reg = widget ? WIDGET_REGISTRY[widget.type as keyof typeof WIDGET_REGISTRY] : null;
          const left = ((item.x || 0) / PREVIEW_COLS) * 100;
          const width = ((item.w || 1) / PREVIEW_COLS) * 100;
          const top = (item.y || 0) * PREVIEW_UNIT;
          const height = (item.h || 1) * PREVIEW_UNIT;

          return (
            <div
              key={item.i}
              className="absolute rounded bg-muted/80 border border-border/40 flex items-center justify-center overflow-hidden"
              style={{
                left: `calc(${left}% + 8px)`,
                width: `calc(${width}% - 4px)`,
                top: `${top + 16}px`,
                height: `${height - 2}px`,
              }}
            >
              <span className="text-[7px] font-medium text-muted-foreground truncate px-1">
                {reg?.label || ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Full-screen modal for browsing and applying board templates.
 * Features sidebar category navigation and visual board previews.
 *
 * @param open - Visibility flag
 * @param onClose - Called when modal is dismissed
 * @param onApply - Called with the selected template
 */
export default function BoardTemplatesModal({ open, onClose, onApply }: BoardTemplatesModalProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return BOARD_TEMPLATES;
    return BOARD_TEMPLATES.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  if (!open) return null;

  function handleApply(template: BoardTemplate) {
    if (confirmId === template.id) {
      onApply(template);
      setConfirmId(null);
      onClose();
    } else {
      setConfirmId(template.id);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-event-modal-backdrop-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setConfirmId(null);
          onClose();
        }
      }}
    >
      <div
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-[900px] max-w-[95vw] h-[80vh] max-h-[700px] overflow-hidden flex animate-event-modal-card-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-48 shrink-0 border-r border-border bg-muted/30 p-4 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground mb-3 px-2">Templates</h2>

          <button
            onClick={() => setActiveCategory("all")}
            className={`text-left text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeCategory === "all"
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            All
          </button>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-left text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div>
              <p className="text-sm text-muted-foreground">
                Choose a template to set up your board. This replaces your current layout.
              </p>
            </div>
            <button
              onClick={() => { setConfirmId(null); onClose(); }}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors duration-150 cursor-pointer shrink-0 ml-4"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Template grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleApply(template)}
                  className={`group relative text-left rounded-xl border transition-all duration-150 cursor-pointer hover:shadow-lg overflow-hidden ${
                    confirmId === template.id
                      ? "border-blue-500 ring-2 ring-blue-500/30"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  {/* Visual board preview */}
                  <TemplatePreview template={template} />

                  {/* Info section */}
                  <div className="p-3 border-t border-border/50">
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">{template.name}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{template.description}</p>

                    {/* Widget pills */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.previewWidgets.slice(0, 4).map((wType) => {
                        const reg = WIDGET_REGISTRY[wType as keyof typeof WIDGET_REGISTRY];
                        return (
                          <span
                            key={wType}
                            className="inline-block px-1.5 py-0.5 text-[9px] font-medium rounded bg-muted text-muted-foreground"
                          >
                            {reg?.label || wType}
                          </span>
                        );
                      })}
                      {template.previewWidgets.length > 4 && (
                        <span className="inline-block px-1.5 py-0.5 text-[9px] font-medium rounded bg-muted text-muted-foreground">
                          +{template.previewWidgets.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Confirm state */}
                    {confirmId === template.id && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                        <Check size={12} />
                        Click again to confirm
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
