"use client";

import { StickyNote } from "lucide-react";
import type { FolderAppearance } from "./FolderAppearanceModal";

/** Default light warm gray for folder headers. */
const DEFAULT_COLOR = "#d6d3d1";

interface Props {
  label: string;
  appearance: FolderAppearance;
  noteCount: number;
  highlighted?: boolean;
  selected?: boolean;
}

/**
 * Read-only folder card preview used for live feedback during
 * rename, appearance editing, and new folder creation.
 * Shows a faded placeholder icon when using default appearance,
 * hides the icon when a custom appearance is set.
 *
 * @param label - Folder name to display
 * @param appearance - Header appearance (color, gradient, or image)
 * @param noteCount - Number of notes shown below name
 * @param highlighted - Whether to show the blue active ring
 * @param selected - Whether the card is selected via marquee or click
 */
export default function FolderCardPreview({
  label,
  appearance,
  noteCount,
  highlighted = false,
  selected = false,
}: Props) {
  const isDefault =
    appearance.type === "color" && appearance.value === DEFAULT_COLOR;

  function getHeaderStyle(): React.CSSProperties {
    if (appearance.type === "gradient") {
      return { background: appearance.value };
    }
    if (appearance.type === "image") {
      return {
        backgroundImage: `url(${appearance.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return { backgroundColor: appearance.value };
  }

  return (
    <div
      className={`relative rounded-xl bg-popover transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
        highlighted
          ? "border border-transparent outline-3 outline-blue-500/60 shadow-sm"
          : selected
            ? "border border-transparent outline-[2.5px] outline-blue-500/70 shadow-sm"
            : "border border-border shadow-sm dark:shadow-none"
      }`}
    >
      {/* Header — fixed height so images don't shrink the card */}
      <div
        className="h-[140px] flex items-center justify-center relative rounded-t-[11px] overflow-hidden"
        style={getHeaderStyle()}
      >
        {isDefault && (
          <StickyNote size={28} className="text-white/30 drop-shadow-sm" />
        )}
        {appearance.type === "image" && (
          <div className="absolute inset-0 bg-black/10" />
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-3">
        <p className="text-sm font-semibold text-foreground truncate">
          {label || "Untitled"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {noteCount} {noteCount === 1 ? "note" : "notes"}
        </p>
      </div>
    </div>
  );
}
