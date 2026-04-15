-- Web Push subscription storage for PWA notifications.
-- One row per (user, browser/device); UNIQUE on endpoint prevents duplicates
-- when the same browser re-subscribes.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx
  ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- User-defined notification rules.
-- kind = 'before_deadline' uses minutes_before (e.g. 60, 1440)
-- kind = 'daily_digest'    uses time_of_day ('HH:MM') in the user's TZ
CREATE TABLE IF NOT EXISTS public.notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('before_deadline', 'daily_digest')),
  minutes_before INTEGER,
  time_of_day TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (kind = 'before_deadline' AND minutes_before IS NOT NULL AND minutes_before > 0)
    OR
    (kind = 'daily_digest' AND time_of_day ~ '^[0-2][0-9]:[0-5][0-9]$')
  )
);

CREATE INDEX IF NOT EXISTS notification_rules_user_idx
  ON public.notification_rules (user_id) WHERE enabled = true;

ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notification rules"
  ON public.notification_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notification rules"
  ON public.notification_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notification rules"
  ON public.notification_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notification rules"
  ON public.notification_rules FOR DELETE USING (auth.uid() = user_id);

-- Dedup ledger: one row per dispatched notification.
-- bucket disambiguates digests by date (YYYY-MM-DD) and per-task reminders
-- can leave bucket = '' so the (rule_id, task_id, bucket) UNIQUE prevents
-- repeat sends within the rule's lifetime.
CREATE TABLE IF NOT EXISTS public.notification_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.notification_rules(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL DEFAULT '',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rule_id, task_id, bucket)
);

CREATE INDEX IF NOT EXISTS notification_dispatches_user_idx
  ON public.notification_dispatches (user_id, sent_at DESC);

ALTER TABLE public.notification_dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notification dispatches"
  ON public.notification_dispatches FOR SELECT USING (auth.uid() = user_id);
