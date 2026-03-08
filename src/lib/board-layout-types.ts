/**
 * Shared types and constants for the board layout persistence system.
 * Used by board-layout-cache, board-layout-sync, and useWidgetLayout.
 *
 * @module board-layout-types
 */

import type { ResponsiveLayouts } from "react-grid-layout";
import type { WidgetInstance } from "@/lib/widget-types";

/** localStorage key for persisted widget layout. */
export const STORAGE_KEY = "home_widget_layout";

/** Schema version for cache invalidation. Bump to reset all users to new defaults. */
export const SCHEMA_VERSION = 10;

/** Old lg column count (v2) used before migration to v3. */
export const OLD_LG_COLS = 6;

/** New lg column count (v3) after grid expansion. */
export const NEW_LG_COLS = 8;

/** Default banner height in pixels. */
export const DEFAULT_COVER_HEIGHT = 220;

/** Default vertical image position (percentage, 0=top, 100=bottom). */
export const DEFAULT_COVER_POSITION_Y = 50;

/**
 * Persisted layout data shape stored in localStorage and synced to server.
 *
 * @property version - Schema version for migration detection
 * @property widgets - Array of widget instances on the board
 * @property layouts - Responsive grid layouts keyed by breakpoint
 * @property boardTitle - User-facing board title (max 50 chars)
 * @property boardDescription - Board description text (max 200 chars)
 * @property coverImageUrl - Public URL or preset key for the cover image
 * @property boardEmoji - Emoji or "lucide:icon-name" for the board icon
 * @property iconSize - Icon size value ("sm" | "md" | "lg" | "xl")
 * @property titleFontFamily - CSS font-family for the board title
 * @property titleTextColor - CSS color for the board title
 * @property titleFontSize - Title size ("sm" | "md" | "lg")
 * @property coverHeight - Banner height in pixels (80-350)
 * @property coverPositionY - Vertical image position percentage (0-100)
 * @property dividerColor - CSS color for the board divider line
 * @property dividerThickness - Pixel thickness of the board divider (1-6)
 * @property savedImages - User's saved image URLs for image widgets
 * @property updatedAt - Epoch ms timestamp for comparing freshness
 */
export interface PersistedLayout {
  version: number;
  widgets: WidgetInstance[];
  layouts: ResponsiveLayouts<string>;
  boardTitle: string;
  boardDescription: string;
  coverImageUrl: string;
  boardEmoji: string;
  iconSize: string;
  titleFontFamily: string;
  titleTextColor: string;
  titleFontSize: string;
  coverHeight: number;
  coverPositionY: number;
  dividerColor?: string;
  dividerThickness?: number;
  savedImages?: string[];
  updatedAt: number;
}
