/**
 * Notes style registry.
 * Defines available notes background style IDs, labels, and descriptions
 * used by the NotesStylePicker and NotesWidget.
 */

/** Union of all supported notes style identifiers. */
export type NotesStyleId = "blank" | "lined" | "grid";

/** Metadata entry for a single notes style. */
export interface NotesStyleMeta {
  id: NotesStyleId;
  label: string;
  description: string;
}

/** All available notes style options. */
export const NOTES_STYLES: NotesStyleMeta[] = [
  { id: "blank", label: "Blank", description: "Plain background" },
  { id: "lined", label: "Lined", description: "Horizontal ruled lines" },
  { id: "grid", label: "Grid", description: "Graph paper grid" },
];

/** Default notes style for new or migrated widgets. */
export const DEFAULT_NOTES_STYLE: NotesStyleId = "blank";
