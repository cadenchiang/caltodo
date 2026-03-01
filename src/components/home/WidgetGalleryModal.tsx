"use client";

/**
 * Modal showing available widget types to add to the dashboard.
 * Displays a grid of widget type cards with unique colors and icons per type.
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
  ImageIcon,
  GraduationCap,
  FileText,
  CloudSun,
  MessagesSquare,
} from "lucide-react";
import { WIDGET_REGISTRY, type WidgetType } from "@/lib/widget-types";

/** Google Calendar SVG icon rendered inline for brand accuracy. */
function GoogleCalendarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 3H17V1H15V3H9V1H7V3H6C4.9 3 4 3.9 4 5V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V5C20 3.9 19.1 3 18 3Z" fill="#4285F4" />
      <path d="M18 19H6V8H18V19Z" fill="white" />
      <rect x="8" y="10" width="3" height="2" rx="0.5" fill="#4285F4" />
      <rect x="8" y="14" width="3" height="2" rx="0.5" fill="#4285F4" />
      <rect x="13" y="10" width="3" height="2" rx="0.5" fill="#4285F4" />
      <rect x="13" y="14" width="3" height="2" rx="0.5" fill="#4285F4" />
    </svg>
  );
}

/** Per-widget-type icon and color config. */
const WIDGET_STYLE: Record<
  string,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    bgColor: string;
    hoverBg: string;
  }
> = {
  "tasks-today": {
    icon: CheckSquare,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    hoverBg: "group-hover:bg-emerald-500/20",
  },
  clock: {
    icon: Clock,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    hoverBg: "group-hover:bg-orange-500/20",
  },
  image: {
    icon: ImageIcon,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    hoverBg: "group-hover:bg-pink-500/20",
  },
  "class-progress": {
    icon: GraduationCap,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    hoverBg: "group-hover:bg-violet-500/20",
  },
  "recent-chat": {
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverBg: "group-hover:bg-blue-500/20",
  },
  "google-calendar": {
    icon: GoogleCalendarIcon as unknown as React.ComponentType<{ size?: number; className?: string }>,
    color: "",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    hoverBg: "group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20",
  },
  notes: {
    icon: FileText,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    hoverBg: "group-hover:bg-amber-500/20",
  },
  weather: {
    icon: CloudSun,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    hoverBg: "group-hover:bg-sky-500/20",
  },
  "cal-chat": {
    icon: MessagesSquare,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    hoverBg: "group-hover:bg-indigo-500/20",
  },
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
        className="absolute inset-0 bg-black/50 animate-announce-backdrop-in"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full max-w-md mx-4 animate-announce-card-in overflow-hidden">
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
            const style = WIDGET_STYLE[config.type] || WIDGET_STYLE["tasks-today"];
            const Icon = style.icon;
            const isGoogleCal = config.type === "google-calendar";
            return (
              <button
                key={config.type}
                onClick={() => {
                  onAdd(config.type);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-center group"
              >
                <div className={`w-10 h-10 rounded-lg ${style.bgColor} ${style.hoverBg} flex items-center justify-center transition-colors`}>
                  {isGoogleCal ? (
                    <Icon size={20} />
                  ) : (
                    <Icon size={20} className={style.color} />
                  )}
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
