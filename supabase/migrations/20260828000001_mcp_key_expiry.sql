-- Optional expiry for MCP API keys.
--
-- Keys were permanent once issued, so a key pasted into a tool the user later
-- stopped using stayed valid forever unless they remembered to revoke it.
-- NULL keeps the existing behaviour (never expires) so every key already in
-- the table is unaffected.

ALTER TABLE public.mcp_api_keys
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;

-- The auth lookup filters on this alongside key_hash.
CREATE INDEX IF NOT EXISTS idx_mcp_api_keys_expires_at
  ON public.mcp_api_keys(expires_at)
  WHERE expires_at IS NOT NULL;
