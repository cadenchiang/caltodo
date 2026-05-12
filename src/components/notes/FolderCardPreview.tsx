"use client";

import { useState } from "react";
import { Folder } from "lucide-react";
import type { FolderAppearance } from "./FolderAppearanceModal";

/** Default light warm gray for folder headers. */
const DEFAULT_COLOR = "#d6d3d1";

interface Props {
  label: string;
  appearance: FolderAppearance;
  noteCount: number;
  highlighted?: boolean;
  selected?: boolean;
  /** When true, the user has customized this folder's appearance at least once. */
  hasCustomAppearance?: boolean;
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
  hasCustomAppearance = false,
}: Props) {
  const isDefault = !hasCustomAppearance;
  const [imgError, setImgError] = useState(false);

  function getHeaderStyle(): React.CSSProperties {
    if (appearance.type === "gradient") {
      return { background: appearance.value };
    }
    if (appearance.type === "image" && !imgError) {
      return {
        backgroundImage: `url(${appearance.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    if (appearance.type === "image" && imgError) {
      return { backgroundColor: DEFAULT_COLOR };
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
          <Folder size={28} fill="currentColor" className="text-white/30 drop-shadow-sm" />
        )}
        {appearance.type === "image" && !imgError && (
          <>
            <img
              src={appearance.value}
              alt=""
              className="hidden"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/10" />
          </>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-3">
        <span className="text-sm font-semibold text-foreground truncate block" title={label}>
          {label || "Untitled"}
        </span>
        <p className="text-xs text-muted-foreground mt-1">
          {noteCount} {noteCount === 1 ? "note" : "notes"}
        </p>
      </div>
    </div>
  );
}
