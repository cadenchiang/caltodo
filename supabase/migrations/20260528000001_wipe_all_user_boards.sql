-- One-shot: wipe every user's saved board layout EXCEPT the template owner's.
-- After this runs, every user falls back to the template owner's layout via the
-- BOARD_TEMPLATE_USER_ID fallback in /api/board-layout, so everyone effectively
-- sees the same board as the template owner.
--
-- This permanently deletes any personal customizations users had made. Re-running
-- is safe but will wipe any new customizations made between runs.
--
-- The UUID matches the BOARD_TEMPLATE_USER_ID default in
-- src/app/api/board-layout/route.ts. Override via the env var in production if a
-- different account owns the template (the migration value would also need to be
-- updated in that case).
DELETE FROM board_layouts
WHERE user_id <> 'f6fe5372-9a08-489d-bb0a-d29c4512c04f';
