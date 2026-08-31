-- Backfills integration_accounts from the existing flat columns.
--
-- SAFETY: read-only against integration_credentials. Every statement is an
-- INSERT into integration_accounts guarded by ON CONFLICT DO NOTHING, so the
-- migration is idempotent and can be re-run. Nothing reads integration_accounts
-- yet, so a wrong row here cannot affect a user's sync. Reverting is
-- DELETE FROM integration_accounts, or DROP TABLE from the previous migration.
--
-- SECRETS: connection payloads carry URLs and account emails only. Canvas
-- tokens, Gradescope passwords, and Google tokens are deliberately not copied.

-- Canvas: the primary account, present when either an API base URL or an iCal
-- feed was configured. canvas_auth_failed covers the token path and
-- canvas_ical_failed the feed path; either one means this account is broken.
INSERT INTO public.integration_accounts
  (user_id, provider, label, connection, selected_courses, auth_failed, is_primary)
SELECT
  user_id,
  'canvas',
  '',
  jsonb_strip_nulls(jsonb_build_object(
    'base_url', NULLIF(canvas_base_url, ''),
    'ical_url', canvas_ical_url
  )),
  selected_canvas_courses,
  COALESCE(canvas_auth_failed, false) OR COALESCE(canvas_ical_failed, false),
  true
FROM public.integration_credentials
WHERE COALESCE(NULLIF(canvas_base_url, ''), canvas_ical_url) IS NOT NULL
ON CONFLICT DO NOTHING;

-- Gradescope: identified by the stored account email. The password stays
-- encrypted in gradescope_password_encrypted and is not copied.
INSERT INTO public.integration_accounts
  (user_id, provider, label, connection, selected_courses, auth_failed, is_primary)
SELECT
  user_id,
  'gradescope',
  '',
  jsonb_build_object('email', gradescope_email),
  selected_gradescope_courses,
  COALESCE(gradescope_auth_failed, false),
  true
FROM public.integration_credentials
WHERE gradescope_email IS NOT NULL
ON CONFLICT DO NOTHING;

-- Pensieve: an iCal feed URL.
INSERT INTO public.integration_accounts
  (user_id, provider, label, connection, selected_courses, auth_failed, is_primary)
SELECT
  user_id,
  'pensieve',
  '',
  jsonb_build_object('calendar_url', pensieve_calendar_url),
  selected_pensieve_courses,
  COALESCE(pensieve_auth_failed, false),
  true
FROM public.integration_credentials
WHERE pensieve_calendar_url IS NOT NULL
ON CONFLICT DO NOTHING;

-- Brightspace: an iCal feed URL. No per-provider course selection exists.
INSERT INTO public.integration_accounts
  (user_id, provider, label, connection, auth_failed, is_primary)
SELECT
  user_id,
  'brightspace',
  '',
  jsonb_build_object('calendar_url', brightspace_calendar_url),
  COALESCE(brightspace_auth_failed, false),
  true
FROM public.integration_credentials
WHERE brightspace_calendar_url IS NOT NULL
ON CONFLICT DO NOTHING;

-- Google Classroom: OAuth-backed, so there is no URL to carry. The row records
-- that the provider is connected; the tokens stay in their encrypted columns.
INSERT INTO public.integration_accounts
  (user_id, provider, label, connection, selected_courses, auth_failed, is_primary)
SELECT
  user_id,
  'classroom',
  '',
  '{}'::jsonb,
  selected_classroom_courses,
  COALESCE(classroom_auth_failed, false),
  true
FROM public.integration_credentials
WHERE COALESCE(classroom_enabled, false)
ON CONFLICT DO NOTHING;

-- Additional Canvas schools, previously the only multi-account support in the
-- product. legacy_id carries each array entry's id so re-running this migration
-- cannot duplicate them. Tokens in the array are not copied.
INSERT INTO public.integration_accounts
  (user_id, provider, label, connection, selected_courses, auth_failed, is_primary, legacy_id)
SELECT
  c.user_id,
  'canvas',
  COALESCE(a.value ->> 'label', ''),
  jsonb_strip_nulls(jsonb_build_object(
    'base_url', NULLIF(a.value ->> 'base_url', ''),
    'ical_url', a.value ->> 'ical_url'
  )),
  CASE
    WHEN jsonb_typeof(a.value -> 'selected_courses') = 'array'
      THEN a.value -> 'selected_courses'
    ELSE NULL
  END,
  COALESCE((a.value ->> 'auth_failed')::boolean, false),
  false,
  a.value ->> 'id'
FROM public.integration_credentials c
CROSS JOIN LATERAL jsonb_array_elements(c.additional_canvas_accounts) AS a(value)
WHERE jsonb_typeof(c.additional_canvas_accounts) = 'array'
  AND a.value ->> 'id' IS NOT NULL
ON CONFLICT DO NOTHING;
