/**
 * Reads and writes the user's chosen colours for tags, classes and badges.
 *
 * Backed by the `label_colors` table: one row per (user, kind, name), name
 * lowercased. This module is the only place that knows the table's shape;
 * the context above it deals in a Map and the UI deals in a function.
 *
 * @module label-colors-store
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** Which list a coloured name belongs to. */
export type LabelKind = "tag" | "class" | "source";

/** Every kind the table accepts, for validation before a write. */
export const LABEL_KINDS: readonly LabelKind[] = ["tag", "class", "source"];

/** Hex colour the table will accept. */
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Builds the key a colour is stored under in the Map.
 *
 * @param kind - Which list the name belongs to
 * @param name - The label as displayed; case and surrounding space ignored
 * @returns `kind:lowercased-name`
 */
export function labelKey(kind: LabelKind, name: string): string {
  return `${kind}:${name.trim().toLowerCase()}`;
}

/**
 * Loads every stored colour for a user.
 *
 * @param supabase - Client scoped to the user's session
 * @param userId - Whose colours to load
 * @returns Map from {@link labelKey} to hex colour; empty on failure
 * @remarks A failed read degrades to derived colours rather than throwing:
 *          the pickers must still open when this table is unreachable.
 */
export async function fetchLabelColors(
  supabase: SupabaseClient,
  userId: string,
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("label_colors")
    .select("kind, name, color")
    .eq("user_id", userId);

  if (error) {
    console.error("label-colors-store: fetch failed", {
      userId,
      cause: error.message,
      impact: "derived colours shown until the next load",
    });
    return new Map();
  }

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(labelKey(row.kind as LabelKind, row.name), row.color);
  }
  return map;
}

/**
 * Stores a colour, replacing any previous one for the same label.
 *
 * @param supabase - Client scoped to the user's session
 * @param userId - Whose colour to store
 * @param kind - Which list the name belongs to
 * @param name - The label as displayed
 * @param color - Six-digit hex, e.g. "#0e89d6"
 * @returns True on success
 * @remarks Rejects a bad colour before the write rather than letting the
 *          table's CHECK do it, so the caller gets one clear failure and no
 *          round trip.
 */
export async function upsertLabelColor(
  supabase: SupabaseClient,
  userId: string,
  kind: LabelKind,
  name: string,
  color: string,
): Promise<boolean> {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed || !HEX_COLOR.test(color) || !LABEL_KINDS.includes(kind)) {
    console.error("label-colors-store: refused invalid write", { kind, nameLength: trimmed.length, color });
    return false;
  }

  const { error } = await supabase
    .from("label_colors")
    .upsert(
      { user_id: userId, kind, name: trimmed, color, updated_at: new Date().toISOString() },
      { onConflict: "user_id,kind,name" },
    );

  if (error) {
    console.error("label-colors-store: upsert failed", {
      userId,
      kind,
      cause: error.message,
      impact: "colour not saved; UI reverts to the previous one",
    });
    return false;
  }
  console.info("label-colors-store: colour saved", { kind, name: trimmed, color });
  return true;
}

/**
 * Removes a stored colour, so the label falls back to its derived one.
 *
 * @param supabase - Client scoped to the user's session
 * @param userId - Whose colour to remove
 * @param kind - Which list the name belongs to
 * @param name - The label as displayed
 * @returns True on success, including when nothing was stored
 */
export async function deleteLabelColor(
  supabase: SupabaseClient,
  userId: string,
  kind: LabelKind,
  name: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("label_colors")
    .delete()
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("name", name.trim().toLowerCase());

  if (error) {
    console.error("label-colors-store: delete failed", { userId, kind, cause: error.message });
    return false;
  }
  return true;
}
