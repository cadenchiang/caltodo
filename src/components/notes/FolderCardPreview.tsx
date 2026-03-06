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
 */
export default function FolderCardPreview({
  label,
  appearance,
  noteCount,
  highlighted = false,
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
      className={`relative rounded-xl overflow-hidden border bg-popover transition-all duration-150 ${
        highlighted
          ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/20 shadow-lg dark:shadow-black/30"
          : "border-border shadow-sm dark:shadow-none"
      }`}
    >
      {/* Header — fixed height so images don't shrink the card */}
      <div
        className="h-[120px] flex items-center justify-center relative"
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
