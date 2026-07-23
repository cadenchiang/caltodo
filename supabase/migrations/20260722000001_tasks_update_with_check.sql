-- Security fix: the tasks UPDATE policy had a USING clause but no WITH CHECK,
-- so the old row (owned by the caller) passed the check while the NEW row was
-- written unconditionally. A client could therefore UPDATE its own task and set
-- user_id to another user's id, transferring/injecting the row into that user's
-- account (exploitable via the raw .update(body) on /api/mobile/tasks).
--
-- Recreate the policy with a WITH CHECK so the post-update row must also belong
-- to the caller. Non-destructive: same USING semantics, adds the missing guard.
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
