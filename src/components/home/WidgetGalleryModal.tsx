"use client";

/**
 * Modal showing available widget types to add to the dashboard.
 * Displays a grid of widget type cards, each showing icon, label, and description.
 * Click a card to add that widget type to the dashboard.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param onAdd - Callback when a widget type is selected (receives WidgetType)
 */

import {
  X,
  CheckSquare,
  Clock,
  MessageSquare,
  Calendar,
  ImageIcon,
  GraduationCap,
  FileText,
  CloudSun,
  MessagesSquare,
} from "lucide-react";
import { WIDGET_REGISTRY, type WidgetType } from "@/lib/widget-types";

/** Maps iconName from registry to actual Lucide components. */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  CheckSquare,
  Clock,
  MessageSquare,
  Calendar,
  ImageIcon,
  GraduationCap,
  FileText,
  CloudSun,
  MessagesSquare,
};

interface WidgetGalleryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType) => void;
}

export default function WidgetGalleryModal({
  open,
  onClose,
  onAdd,
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

      {/* Card */}
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 animate-announce-card-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Add Widget
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Widget grid */}
        <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {widgetTypes.map((config) => {
            const Icon = ICON_MAP[config.iconName] || CheckSquare;
            return (
              <button
                key={config.type}
                onClick={() => {
                  onAdd(config.type);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-center group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Icon size={20} className="text-blue-500" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {config.label}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {config.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
