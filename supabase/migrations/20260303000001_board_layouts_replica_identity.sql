-- Enable REPLICA IDENTITY FULL on board_layouts so Supabase Realtime
-- includes the full row (with user_id) in WAL events.  Required for
-- RLS-filtered postgres_changes subscriptions on UPDATE.
-- Non-destructive online DDL — no table lock or data rewrite.

ALTER TABLE board_layouts REPLICA IDENTITY FULL;
