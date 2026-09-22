/**
 * Reconciles tasks whose external_id changed key.
 *
 * Canvas iCal override events used to be keyed on the override id and are
 * now keyed on the assignment id (audit M6). Without this step the first
 * sync after that change treated the assignment-keyed row as the live task
 * (resurrecting a hidden, incomplete one) and stranded the override-keyed
 * row the user had actually completed, so finished quizzes came back as
 * overdue. Here the legacy row is either renamed to the new key, or, when a
 * row with the new key already exists, its completion and manual edits are
 * carried over and the legacy row is hidden.
 *
 * @module legacy-key-merge
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedAssignment } from "@/lib/canvas-client";
import { logger } from "@/lib/logger";

/** Columns needed to decide what to carry over. */
interface KeyedRow {
  id: string;
  external_id: string;
  is_completed: boolean;
  completed_at: string | null;
  color: string | null;
  dismissed_at: string | null;
  dismissed_by_user: boolean | null;
  due_date_manually_edited_at: string | null;
  due_time_manually_edited_at: string | null;
}

/** Outcome counts, for logging and tests. */
export interface LegacyMergeResult {
  renamed: number;
  merged: number;
  /** Ids of legacy rows hidden after a merge, for calendar cleanup. */
  hiddenTaskIds: string[];
  errors: string[];
}

/** Largest .in() filter sent in one request. */
const CHUNK = 200;

/**
 * Fetches task rows for a set of external ids, chunked.
 *
 * @returns The rows, or null when any chunk failed (logged).
 */
async function loadRows(
  supabase: SupabaseClient,
  userId: string,
  source: string,
  externalIds: string[],
): Promise<KeyedRow[] | null> {
  const rows: KeyedRow[] = [];
  for (let i = 0; i < externalIds.length; i += CHUNK) {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, external_id, is_completed, completed_at, color, dismissed_at, dismissed_by_user, due_date_manually_edited_at, due_time_manually_edited_at")
      .eq("user_id", userId)
      .eq("source", source)
      .in("external_id", externalIds.slice(i, i + CHUNK));
    if (error) {
      logger.error("legacy-key-merge: failed to read keyed rows", {
        userId, source, cause: error.message,
        impact: "legacy-keyed tasks left as they are this run",
      });
      return null;
    }
    rows.push(...((data ?? []) as KeyedRow[]));
  }
  return rows;
}

/**
 * Renames or merges every legacy-keyed task before the regular upsert runs.
 *
 * @param supabase - Client scoped to the user (or admin)
 * @param userId - Owner of the tasks
 * @param source - Task source, e.g. "canvas"
 * @param assignments - This run's assignments; only those carrying
 *   `legacy_external_id` are considered
 * @returns Counts of renamed and merged rows plus any errors. Never throws.
 */
export async function mergeLegacyKeyedTasks(
  supabase: SupabaseClient,
  userId: string,
  source: string,
  assignments: NormalizedAssignment[],
): Promise<LegacyMergeResult> {
  const result: LegacyMergeResult = { renamed: 0, merged: 0, hiddenTaskIds: [], errors: [] };
  const pairs = assignments.filter(
    (a): a is NormalizedAssignment & { legacy_external_id: string } =>
      !!a.legacy_external_id && a.legacy_external_id !== a.external_id,
  );
  if (pairs.length === 0) return result;

  const legacyRows = await loadRows(supabase, userId, source, pairs.map((p) => p.legacy_external_id));
  if (!legacyRows || legacyRows.length === 0) return result;
  const legacyByKey = new Map(legacyRows.map((r) => [r.external_id, r]));

  const newRows = await loadRows(supabase, userId, source, pairs.map((p) => p.external_id));
  if (!newRows) return result;
  const newByKey = new Map(newRows.map((r) => [r.external_id, r]));

  for (const pair of pairs) {
    const legacy = legacyByKey.get(pair.legacy_external_id);
    if (!legacy) continue;
    const current = newByKey.get(pair.external_id);

    if (!current) {
      // Nothing under the new key yet: keep the row and just re-key it.
      const { error } = await supabase
        .from("tasks")
        .update({ external_id: pair.external_id })
        .eq("id", legacy.id);
      if (error) {
        result.errors.push(`rename ${legacy.external_id}: ${error.message}`);
        logger.error("legacy-key-merge: rename failed", {
          userId, source, taskId: legacy.id, cause: error.message,
          impact: "task will be recreated under the new key and lose its state",
        });
      } else {
        result.renamed++;
      }
      continue;
    }

    // Both exist: the user's state lives on the legacy row. Carry it over,
    // then hide the legacy row so only one task shows.
    const carry: Record<string, unknown> = {};
    if (legacy.is_completed && !current.is_completed) {
      carry.is_completed = true;
      carry.completed_at = legacy.completed_at ?? new Date().toISOString();
    }
    if (legacy.dismissed_by_user && !current.dismissed_by_user) {
      carry.dismissed_at = legacy.dismissed_at ?? new Date().toISOString();
      carry.dismissed_by_user = true;
    }
    if (legacy.due_date_manually_edited_at && !current.due_date_manually_edited_at) {
      carry.due_date_manually_edited_at = legacy.due_date_manually_edited_at;
    }
    if (legacy.due_time_manually_edited_at && !current.due_time_manually_edited_at) {
      carry.due_time_manually_edited_at = legacy.due_time_manually_edited_at;
    }
    if (legacy.color && legacy.color !== current.color) carry.color = legacy.color;

    if (Object.keys(carry).length > 0) {
      const { error } = await supabase.from("tasks").update(carry).eq("id", current.id);
      if (error) {
        result.errors.push(`merge ${pair.external_id}: ${error.message}`);
        logger.error("legacy-key-merge: carry-over failed", {
          userId, source, taskId: current.id, cause: error.message,
          impact: "completion or edits from the legacy row not applied",
        });
        continue; // keep the legacy row visible rather than lose the state
      }
    }

    const { error: hideError } = await supabase
      .from("tasks")
      .update({ dismissed_at: new Date().toISOString(), dismissed_by_user: false })
      .eq("id", legacy.id);
    if (hideError) {
      result.errors.push(`hide ${legacy.external_id}: ${hideError.message}`);
      logger.error("legacy-key-merge: hiding the legacy row failed", {
        userId, source, taskId: legacy.id, cause: hideError.message,
        impact: "task shows twice until the next sync",
      });
      continue;
    }
    result.merged++;
    result.hiddenTaskIds.push(legacy.id);
  }

  if (result.renamed || result.merged || result.errors.length) {
    logger.info("legacy-key-merge: reconciled re-keyed tasks", {
      userId, source, renamed: result.renamed, merged: result.merged, errorCount: result.errors.length,
    });
  }
  return result;
}
