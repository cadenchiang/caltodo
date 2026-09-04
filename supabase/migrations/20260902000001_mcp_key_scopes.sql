-- Per-key access level for MCP API keys, plus the UPDATE policy the rename
-- path has always needed.
--
-- Scope
-- -----
-- Every key could call all twelve MCP tools, including the nine that write
-- (create/update/delete task, sync, create/update/delete event, set colour).
-- A key pasted into a tool that only ever needs to read the week's deadlines
-- could still delete them. 'read' limits a key to the three list tools;
-- 'full' is the previous behaviour.
--
-- DEFAULT 'full' so every key already issued keeps working exactly as it did.
-- The CHECK constraint is the backstop for the application-level enforcement
-- in lib/mcp/scopes.ts: an unrecognised value can never reach the table.

ALTER TABLE public.mcp_api_keys
  ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'full';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mcp_api_keys_scope_check'
  ) THEN
    ALTER TABLE public.mcp_api_keys
      ADD CONSTRAINT mcp_api_keys_scope_check CHECK (scope IN ('full', 'read'));
  END IF;
END $$;

-- Rename
-- ------
-- The original migration said "No UPDATE policy: nothing on a key is
-- user-editable", but renameApiKey (lib/mcp/api-keys.ts) issues an UPDATE
-- through the caller's session, where RLS applies. With no UPDATE policy that
-- statement matched zero rows and the route reported "That API key does not
-- exist" for a key the user was looking at. Renaming is the one edit the UI
-- offers, so it gets a policy.
--
-- WITH CHECK repeats the USING clause so a row can never be updated out of the
-- caller's ownership.
DROP POLICY IF EXISTS "Users can update own MCP keys" ON public.mcp_api_keys;
CREATE POLICY "Users can update own MCP keys"
  ON public.mcp_api_keys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
