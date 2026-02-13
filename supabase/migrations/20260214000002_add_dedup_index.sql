-- Add unique index for deduplicating synced assignments per user+source.
-- Only applies to rows where source is not null (manual tasks are unaffected).
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_source_dedup
  ON public.tasks(user_id, source, external_id) WHERE source IS NOT NULL;
