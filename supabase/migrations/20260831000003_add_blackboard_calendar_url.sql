-- Blackboard Learn support.
--
-- Mirrors the Brightspace columns exactly: a per-user iCal feed URL plus a
-- persistent failure flag so a revoked or expired feed shows in the health
-- banner on a cold load, rather than only in the sync result that produced it.
--
-- Both columns are additive and nullable/defaulted, so this is safe to apply
-- to a live table and reversible by dropping them.
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS blackboard_calendar_url TEXT,
  ADD COLUMN IF NOT EXISTS blackboard_auth_failed BOOLEAN NOT NULL DEFAULT false;
