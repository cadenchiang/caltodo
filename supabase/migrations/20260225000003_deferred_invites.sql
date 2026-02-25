-- Allow deferred invites where the invitee is not yet on caltodo.
-- invitee_id becomes nullable; NULL means the invite is deferred.

ALTER TABLE public.task_shares ALTER COLUMN invitee_id DROP NOT NULL;

-- Drop the unique constraint on (source_task_id, invitee_id) since invitee_id can be NULL
-- and re-create a partial unique index that works for both cases
ALTER TABLE public.task_shares DROP CONSTRAINT IF EXISTS unique_share;

-- For non-deferred invites: unique on (source_task_id, invitee_id)
CREATE UNIQUE INDEX idx_unique_share_with_invitee
  ON public.task_shares (source_task_id, invitee_id)
  WHERE invitee_id IS NOT NULL;

-- For deferred invites: unique on (source_task_id, invitee_email) when no invitee_id
CREATE UNIQUE INDEX idx_unique_share_deferred
  ON public.task_shares (source_task_id, invitee_email)
  WHERE invitee_id IS NULL;

-- Index for processing deferred shares on signup (lookup by email + NULL invitee)
CREATE INDEX idx_task_shares_deferred
  ON public.task_shares (invitee_email, status) WHERE invitee_id IS NULL;

-- Update the no_self_invite constraint to handle NULL invitee_id
-- (NULL invitee_id always passes the check since inviter_id != NULL is true)
ALTER TABLE public.task_shares DROP CONSTRAINT IF EXISTS no_self_invite;
ALTER TABLE public.task_shares
  ADD CONSTRAINT no_self_invite CHECK (invitee_id IS NULL OR inviter_id != invitee_id);
