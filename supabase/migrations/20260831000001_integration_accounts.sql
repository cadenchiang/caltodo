-- Generalized per-provider integration accounts.
--
-- integration_credentials holds one row per user with flat, single-value
-- columns per provider (canvas_ical_url, brightspace_calendar_url, ...), so a
-- user can only ever have one of each. Canvas alone escaped that through the
-- additional_canvas_accounts jsonb array, which is why "Add another school"
-- exists for Canvas and nothing else.
--
-- This table is the general form of that idea: one row per connected account,
-- so every provider supports multiple accounts through a single code path.
--
-- SAFETY: this migration is purely additive. It creates one new table and
-- backfills it. It does not alter, drop, or write to integration_credentials,
-- which remains the authoritative source until a later migration cuts over.
-- Nothing reads this table yet. Reverting is DROP TABLE.
--
-- SECRETS: no tokens or passwords are copied here. Gradescope passwords and
-- Google tokens stay encrypted in their existing columns, and Canvas tokens
-- stay where they are. Only non-secret connection metadata is duplicated, so
-- this table does not widen the blast radius of a leak.

CREATE TABLE public.integration_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Constrained rather than free text so a typo cannot silently create a
  -- provider the sync engine will never look at.
  provider TEXT NOT NULL CHECK (provider IN (
    'canvas', 'gradescope', 'pensieve', 'brightspace', 'blackboard', 'classroom'
  )),
  -- User-facing name, e.g. "Berkeley" or "SJSU". Empty for the primary account
  -- of a provider, where the provider name alone is unambiguous.
  label TEXT NOT NULL DEFAULT '',
  -- Non-secret connection metadata: feed URLs, base URLs, account emails.
  -- Never tokens or passwords.
  connection JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Courses chosen for sync. NULL = sync all, [] = sync none, matching the
  -- existing selected_*_courses semantics.
  selected_courses JSONB,
  -- True when this account's last sync failed authentication.
  auth_failed BOOLEAN NOT NULL DEFAULT false,
  -- The account migrated from the flat integration_credentials columns, as
  -- opposed to one added later. Exactly one per (user_id, provider).
  is_primary BOOLEAN NOT NULL DEFAULT false,
  -- For rows backfilled from additional_canvas_accounts, the id that array
  -- entry carried. Lets the backfill run more than once without duplicating.
  legacy_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_integration_accounts_user_id
  ON public.integration_accounts(user_id);
CREATE INDEX idx_integration_accounts_user_provider
  ON public.integration_accounts(user_id, provider);

-- At most one primary account per provider per user.
CREATE UNIQUE INDEX idx_integration_accounts_one_primary
  ON public.integration_accounts(user_id, provider)
  WHERE is_primary;

-- Makes the additional-account backfill idempotent.
CREATE UNIQUE INDEX idx_integration_accounts_legacy
  ON public.integration_accounts(user_id, provider, legacy_id)
  WHERE legacy_id IS NOT NULL;

ALTER TABLE public.integration_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integration accounts"
  ON public.integration_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own integration accounts"
  ON public.integration_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integration accounts"
  ON public.integration_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integration accounts"
  ON public.integration_accounts FOR DELETE
  USING (auth.uid() = user_id);
