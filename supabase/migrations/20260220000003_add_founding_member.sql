-- Tag the first 1,000 users as founding members (free for life).
ALTER TABLE public.integration_credentials
  ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN DEFAULT false;

-- Backfill: all existing users are founding members (we're under 1,000).
UPDATE public.integration_credentials SET is_founding_member = true WHERE is_founding_member = false;
