/**
 * Modal for choosing a board template.
 * Shows true 1:1 scaled board previews using actual widget components
 * rendered at full size then CSS-scaled down.
 * Includes a confirmation dialog before applying.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Close callback
 * @param onApply - Called with the chosen template
 */

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import {
  BOARD_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type BoardTemplate,
  type TemplateCategory,
} from "@/lib/board-templates";
import { resolvePreset } from "@/lib/board-cover-presets";
import { RenderWidget } from "./WidgetContainer";

interface BoardTemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (template: BoardTemplate) => void;
}

/** Virtual board width matching the real dashboard at lg breakpoint. */
const BOARD_W = 1200;
/** Real row height from WidgetGrid. */
const ROW_H = 120;
/** Real grid gap from WidgetGrid. */
const GRID_GAP = 10;
/** Real grid columns at lg breakpoint. */
const COLS = 8;

/**
 * Renders a 1:1 board preview by laying out the actual board at full size
 * (BOARD_W px wide) inside an overflow-hidden container, then CSS-scaling it down
 * to fit the preview card width. Widgets render real components via RenderWidget.
 *
 * @param template - The board template to preview
 */
function BoardPreview({ template }: { template: BoardTemplate }) {
  const { layout } = template;
  const lgLayout = layout.layouts.lg || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  // Compute scale factor when container width is known
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setScale(w / BOARD_W);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const coverStyle = useMemo(() => {
    const url = layout.coverImageUrl;
    if (!url) return { background: "var(--muted)" };
    if (url.startsWith("preset:")) {
      const preset = resolvePreset(url);
      if (preset.imageUrl) return {
        backgroundImage: `url(${preset.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: `center ${layout.coverPositionY ?? 50}%`,
      };
      if (preset.background) return { background: preset.background };
    }
    return { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" };
  }, [layout.coverImageUrl, layout.coverPositionY]);

  const coverH = layout.coverHeight || 200;
  const maxY = lgLayout.reduce((m, item) => Math.max(m, (item.y || 0) + (item.h || 1)), 0);
  const gridH = maxY * ROW_H + (maxY > 0 ? GRID_GAP * (maxY - 1) : 0);
  // Total height of the full-size board: cover + header area + grid + padding
  const headerH = 60;
  const totalH = coverH + headerH + gridH + 20;
  const scaledH = totalH * scale;

  return (
    <div ref={containerRef} className="w-full overflow-hidden bg-background" style={{ height: scaledH }}>
      <div
        className="pointer-events-none select-none"
        style={{
          width: BOARD_W,
          height: totalH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Cover */}
        <div className="w-full relative overflow-hidden" style={{ ...coverStyle, height: coverH }} />

        {/* Board header */}
        <div className="px-6 pt-2 pb-1">
          <div className="text-2xl leading-none mb-1">{layout.boardEmoji || "\u{1F4D6}"}</div>
          <h4 className="text-lg font-semibold text-foreground leading-tight">
            {layout.boardTitle || "My Board"}
          </h4>
          {layout.boardDescription && (
            <p className="text-sm italic text-muted-foreground mt-0.5 leading-tight">
              {layout.boardDescription}
            </p>
          )}
        </div>

        {/* Widget grid — real dimensions */}
        <div className="px-0 relative" style={{ height: gridH }}>
          {lgLayout.map((item) => {
            const widget = layout.widgets.find((w) => w.id === item.i);
            if (!widget) return null;
            const colW = (BOARD_W) / COLS;
            const left = (item.x || 0) * colW + GRID_GAP / 2;
            const width = (item.w || 1) * colW - GRID_GAP;
            const top = (item.y || 0) * (ROW_H + GRID_GAP);
            const height = (item.h || 1) * ROW_H + ((item.h || 1) - 1) * GRID_GAP;
            return (
              <div
                key={item.i}
                className="absolute rounded-2xl bg-card border border-border/60 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                style={{ left, width, top, height }}
              >
                <RenderWidget widget={widget} editMode={false} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Full-screen modal for browsing and applying board templates.
 * Sidebar category navigation, 1:1 board previews, and confirmation dialog.
 *
 * @param open - Visibility flag
 * @param onClose - Called when modal is dismissed
 * @param onApply - Called with the selected template
 */
export default function BoardTemplatesModal({ open, onClose, onApply }: BoardTemplatesModalProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");
  const [confirmTemplate, setConfirmTemplate] = useState<BoardTemplate | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return BOARD_TEMPLATES;
    return BOARD_TEMPLATES.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  if (!open) return null;

  function handleConfirm() {
    if (!confirmTemplate) return;
    onApply(confirmTemplate);
    setConfirmTemplate(null);
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-event-modal-backdrop-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) { setConfirmTemplate(null); onClose(); }
      }}
    >
      <div
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-[1100px] max-w-[95vw] h-[85vh] max-h-[800px] overflow-hidden flex animate-event-modal-card-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-44 shrink-0 border-r border-border bg-muted/20 p-4 flex flex-col gap-0.5">
          <h2 className="text-lg font-semibold text-foreground mb-4 px-2">Templates</h2>
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
          <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
            <p className="text-sm text-muted-foreground">Choose a template to set up your board.</p>
            <button
              onClick={() => { setConfirmTemplate(null); onClose(); }}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer shrink-0 ml-4"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-5">
              {filtered.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setConfirmTemplate(template)}
                  className="group text-left rounded-xl border border-border overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-xl hover:border-foreground/15 hover:-translate-y-0.5 bg-muted/30"
                >
                  <BoardPreview template={template} />
                  <div className="px-4 py-3 border-t border-border/50">
                    <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-1">
                      {template.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmTemplate && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-event-modal-backdrop-in"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmTemplate(null); }}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl max-w-sm mx-4 p-6 animate-event-modal-card-in"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Apply &ldquo;{confirmTemplate.name}&rdquo;?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              This will replace your current board layout, widgets, and cover with this template.
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmTemplate(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
