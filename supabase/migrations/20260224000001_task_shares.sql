-- Task sharing: allows users to invite classmates to assignments.
-- Each row represents one share (inviter → invitee) for a given task.

CREATE TABLE public.task_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  copied_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  invitee_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_share UNIQUE (source_task_id, invitee_id),
  CONSTRAINT no_self_invite CHECK (inviter_id != invitee_id)
);

-- Index for quick lookups by inviter (listing shares on a task)
CREATE INDEX idx_task_shares_source ON public.task_shares(source_task_id, inviter_id);

-- Index for quick lookups by invitee (listing received shares)
CREATE INDEX idx_task_shares_invitee ON public.task_shares(invitee_id);

-- Enable Row Level Security
ALTER TABLE public.task_shares ENABLE ROW LEVEL SECURITY;

-- Inviter can view their own shares
CREATE POLICY "Inviter can view own shares"
  ON public.task_shares
  FOR SELECT
  USING (auth.uid() = inviter_id);

-- Invitee can view shares sent to them
CREATE POLICY "Invitee can view received shares"
  ON public.task_shares
  FOR SELECT
  USING (auth.uid() = invitee_id);

-- Inviter can create shares (only for their own tasks)
CREATE POLICY "Inviter can create shares"
  ON public.task_shares
  FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

-- Inviter can delete their own shares
CREATE POLICY "Inviter can delete own shares"
  ON public.task_shares
  FOR DELETE
  USING (auth.uid() = inviter_id);
