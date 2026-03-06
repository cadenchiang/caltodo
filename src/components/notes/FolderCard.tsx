"use client";

import { useRef } from "react";
import FolderCardPreview from "./FolderCardPreview";
import type { FolderAppearance } from "./FolderAppearanceModal";
import type { FolderEntry } from "./NotesFolderGrid";

interface Props {
  folder: FolderEntry;
  appearance: FolderAppearance;
  noteCount: number;
  isGeneral: boolean;
  highlighted?: boolean;
  selected?: boolean;
  displayLabel?: string;
  onSelect: (folderId: string, shiftKey: boolean) => void;
  onOpen: (folder: FolderEntry) => void;
}

/**
 * A single folder card in the notes grid.
 * Single click toggles selection; double click opens the folder.
 * Delegates rendering to FolderCardPreview for consistent look.
 *
 * @param folder - The folder entry data
 * @param appearance - Header appearance (color, gradient, or image)
 * @param noteCount - Number of notes in this folder
 * @param isGeneral - Whether this is the "General" (non-course) folder
 * @param highlighted - Whether this card is currently being edited (lifted above spotlight)
 * @param selected - Whether this card is currently selected via marquee or click
 * @param displayLabel - Optional override label (e.g. live rename value)
 * @param onSelect - Toggle selection for this folder
 * @param onOpen - Open the folder to view notes
 */
export default function FolderCard({
  folder,
  appearance,
  noteCount,
  isGeneral,
  highlighted = false,
  selected = false,
  displayLabel,
  onSelect,
  onOpen,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const label = displayLabel ?? folder.label;

  return (
    <div
      ref={containerRef}
      data-folder-id={folder.id}
      className={`group relative ${highlighted ? "z-[41]" : ""}`}
    >
      <button
        onClick={(e) => onSelect(folder.id, e.shiftKey)}
        onDoubleClick={() => onOpen(folder)}
        className="w-full text-left"
      >
        <FolderCardPreview
          label={label}
          appearance={appearance}
          noteCount={noteCount}
          highlighted={highlighted}
          selected={selected}
        />
      </button>
    </div>
  );
}
