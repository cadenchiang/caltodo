-- Apply the same missing-WITH-CHECK fix from 20260722000001 (tasks) to the
-- remaining user-scoped tables. A FOR UPDATE policy with only a USING clause
-- checks the OLD row, so a user could UPDATE their own row and set user_id to
-- another user's id (the NEW row is written unconditionally).
--
-- For integration_credentials this was a real cross-user disclosure: reassign
-- your row to a victim (who has no row yet), set a known calendar_token, then
-- read the victim's tasks via GET /api/calendar/feed?token=... For board_layouts
-- it's an integrity nuisance (plant a board on a victim with no layout).
--
-- Non-destructive: identical USING semantics, adds the missing post-image guard.
-- Legit app updates never change user_id, so nothing breaks; admin-client writes
-- bypass RLS entirely and are unaffected.
DROP POLICY IF EXISTS "Users can update own credentials" ON public.integration_credentials;
CREATE POLICY "Users can update own credentials" ON public.integration_credentials
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own board layout" ON public.board_layouts;
CREATE POLICY "Users can update own board layout" ON public.board_layouts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
