"use client";

/**
 * One platform's mark in the "Select Your Platforms" grid.
 *
 * Every logo gets the same tile and the same inset inside it, which is the
 * only thing that makes eight third-party marks read as one set. Rendered
 * bare, they do not: their artboards agree (each is a square whose ink
 * reaches the edges) but their ink does not. Google Calendar and Pensive are
 * solid blocks covering about three quarters of their square, Canvas is a
 * sparse ring of dots covering under a third, and D2L is a wordmark that is
 * all width and no height. At one shared width the solid ones read as large
 * and heavy and the sparse ones as small, so the row looked mis-sized even
 * though every image was the same number of pixels across.
 *
 * A tile fixes that by giving the eye a shared boundary to compare instead of
 * the ink. It also ends the odd one out: Syllabus already had a tile, because
 * a line glyph sitting bare beside full-colour brand marks looked unfinished,
 * which left it the only option in the grid framed differently from the rest.
 *
 * This is the same treatment the connected-integration cards in Settings use,
 * so a platform looks the same in the place you pick it and the place you
 * manage it.
 */

import { FileText } from "lucide-react";

/** Outer tile, identical for every platform. */
const TILE = "w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0";

/**
 * Logo box inside the tile.
 *
 * 20px in a 28px tile leaves 4px of breathing room on each side, so a
 * full-bleed app icon such as Google Calendar or Blackboard still reads as
 * its own mark rather than as a square jammed inside another square.
 */
const LOGO = "w-5 h-5 object-contain";

interface PlatformLogoProps {
  /** Platform id, used only to pick the Syllabus glyph over an image. */
  id: string;
  /** Path to the logo image, ignored for Syllabus. */
  src: string;
  /** Platform name, for the image's alt text. */
  label: string;
}

/**
 * Renders a platform's tile.
 *
 * @param id - Platform id; "syllabus" draws a glyph instead of an image.
 * @param src - Logo image path.
 * @param label - Platform name, used as alt text.
 * @returns The tile.
 * @remarks Syllabus is deliberately neutral rather than branded: it is a file
 *          the student uploaded, not a platform they have an account with, so
 *          a colour of its own would claim a vendor that does not exist.
 */
export default function PlatformLogo({ id, src, label }: PlatformLogoProps) {
  return (
    <div className={TILE}>
      {id === "syllabus" ? (
        <FileText size={15} className="text-secondary-foreground" />
      ) : (
        <img src={src} alt={label} className={LOGO} />
      )}
    </div>
  );
}
