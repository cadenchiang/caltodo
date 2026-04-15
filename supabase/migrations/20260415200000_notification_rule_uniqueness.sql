-- Prevent duplicate notification rules for the same user+preset.
-- Protects against an initial-load race in the client where rules are
-- POSTed before the existing list hydrates.

-- First, dedupe any existing duplicates (from the race we're fixing).
-- Keep the oldest row (lowest created_at) per (user, kind, value) group.
DELETE FROM public.notification_rules a
USING public.notification_rules b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.kind = b.kind
  AND COALESCE(a.minutes_before, -1) = COALESCE(b.minutes_before, -1)
  AND COALESCE(a.time_of_day, '') = COALESCE(b.time_of_day, '');

-- Then add the uniqueness guarantee.
CREATE UNIQUE INDEX IF NOT EXISTS notification_rules_user_preset_uniq
  ON public.notification_rules (
    user_id,
    kind,
    COALESCE(minutes_before, -1),
    COALESCE(time_of_day, '')
  );
