-- Add status column to task_shares for pending/accepted/declined invite flow.
-- Existing shares default to 'accepted' (they already have task copies).
-- New shares will be inserted with status='pending'.

ALTER TABLE public.task_shares
  ADD COLUMN status TEXT NOT NULL DEFAULT 'accepted';

-- Partial index for fast lookup of pending invites by invitee
CREATE INDEX idx_task_shares_pending
  ON public.task_shares (invitee_id, status) WHERE status = 'pending';

-- Let invitees update their own pending shares (accept/decline)
CREATE POLICY "Invitee can update received share status"
  ON public.task_shares FOR UPDATE
  USING (invitee_id = auth.uid())
  WITH CHECK (invitee_id = auth.uid());
