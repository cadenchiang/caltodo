-- Per-user API keys for the MCP endpoint (/api/mcp), so any user can connect
-- their own Poke integration instead of the endpoint being wired to a single
-- account through environment variables.
--
-- Only the SHA-256 hash of a key is stored. The plaintext is shown once at
-- creation and is unrecoverable afterwards, so a database leak does not hand
-- an attacker working keys. key_prefix keeps the first few characters so the
-- UI can identify a key in a list without storing the secret.

CREATE TABLE public.mcp_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Hex SHA-256 of the plaintext key. Unique so the auth lookup is a single
  -- indexed read and two users can never share a key.
  key_hash TEXT NOT NULL UNIQUE,
  -- Display-only fragment, e.g. "sk-caltodo-a1b2c3d4".
  key_prefix TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Poke',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Stamped by the MCP endpoint so users can tell whether their integration
  -- has ever actually connected.
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_mcp_api_keys_user_id ON public.mcp_api_keys(user_id);

ALTER TABLE public.mcp_api_keys ENABLE ROW LEVEL SECURITY;

-- Users manage only their own keys. The MCP endpoint itself authenticates with
-- the service role (no session exists on those requests), which bypasses RLS.
CREATE POLICY "Users can view own MCP keys"
  ON public.mcp_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own MCP keys"
  ON public.mcp_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own MCP keys"
  ON public.mcp_api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- No UPDATE policy: nothing on a key is user-editable. Revoking means deleting.
