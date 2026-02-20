-- Add completed_at to tasks for Wrapped analytics
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Backfill existing completed tasks using updated_at as best approximation
UPDATE public.tasks SET completed_at = updated_at WHERE is_completed = true AND completed_at IS NULL;

-- Add canvas_token_created_at for 120-day expiration tracking
ALTER TABLE public.integration_credentials ADD COLUMN IF NOT EXISTS canvas_token_created_at TIMESTAMPTZ;

-- Backfill: give existing canvas users a fresh 120-day window from now
UPDATE public.integration_credentials SET canvas_token_created_at = now() WHERE canvas_token IS NOT NULL AND canvas_token_created_at IS NULL;
