-- Add soft-delete column to notes table
ALTER TABLE public.notes ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficiently querying deleted notes per user
CREATE INDEX idx_notes_user_deleted ON public.notes (user_id, deleted_at)
  WHERE deleted_at IS NOT NULL;
