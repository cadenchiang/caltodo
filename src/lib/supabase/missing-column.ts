/**
 * Detection for "column does not exist" errors from PostgREST/Postgres.
 *
 * Code and schema deploy independently: a build referencing a freshly added
 * column can reach production minutes before its migration is applied. Any
 * select naming such a column fails wholesale, so callers that read
 * recently-migrated columns should retry without them rather than surface the
 * failure. See the two-tier select in the credentials route and in the sync
 * engine for the pattern this supports.
 */

/** Postgres error code for an undefined column. */
const UNDEFINED_COLUMN = "42703";

/**
 * Reports whether an error is Postgres complaining about an unknown column.
 *
 * Checks the SQLSTATE code first and falls back to the message, because
 * PostgREST does not always propagate the code.
 *
 * @param error - Error object from a Supabase query, or null.
 * @returns True when the query named a column the database does not have.
 */
export function isMissingColumnError(
  error: { code?: string; message?: string } | null | undefined
): boolean {
  if (!error) return false;
  if (error.code === UNDEFINED_COLUMN) return true;
  return /does not exist|could not find/i.test(error.message ?? "");
}
