-- One-shot: clear the template owner's saved board so they start from a
-- blank canvas. Their next edits become the default layout served to
-- every new account (via the BOARD_TEMPLATE_USER_ID fallback in
-- /api/board-layout). Safe to re-run — no-op if the row is already gone.
--
-- The UUID matches the BOARD_TEMPLATE_USER_ID default in
-- src/app/api/board-layout/route.ts. Override via the env var in
-- production if a different account owns the template.
DELETE FROM board_layouts
WHERE user_id = 'f6fe5372-9a08-489d-bb0a-d29c4512c04f';
