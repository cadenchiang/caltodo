-- Replace partial unique index with a regular unique constraint.
-- PostgREST's on_conflict doesn't support partial indexes.
-- NULL values are considered distinct in PostgreSQL unique indexes,
-- so manual tasks (source=NULL) won't conflict with each other.
DROP INDEX IF EXISTS idx_tasks_source_dedup;

ALTER TABLE public.tasks
  ADD CONSTRAINT uq_tasks_source_dedup UNIQUE (user_id, source, external_id);
