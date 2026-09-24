/**
 * The shape of a chat message as clients are allowed to see it.
 *
 * author_id is deliberately absent from MESSAGE_COLUMNS: every read path
 * (API route, server page, realtime trigger) selects exactly these columns,
 * and migration 20260923000005 revokes SELECT on author_id for end users so
 * a `select *` from the browser fails rather than leaking it.
 *
 * @module chat-message-shape
 */

/** Columns a client may see. Keep in sync with the realtime trigger payload. */
export const MESSAGE_COLUMNS =
  "id, course_id, author_key, author_name, author_avatar, body, created_at, updated_at, reply_to_id, client_nonce";

/** Response header carrying the viewer's own author key for the requested room. */
export const AUTHOR_KEY_HEADER = "X-Chat-Author-Key";

/** Maximum message length, matching the database CHECK constraint. */
export const MAX_MESSAGE_LENGTH = 5000;
