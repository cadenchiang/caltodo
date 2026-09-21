-- Two privilege holes found in the 2026-09-21 audit.
--
-- 1. user_entitlement was created as a plain view, which Postgres runs with
--    the view OWNER's privileges (postgres, which bypasses RLS). The grant
--    below it assumed "RLS on subscriptions still gates" the rows; it did
--    not. Verified live: the anon key alone read all 793 rows (user ids,
--    plans, founder flags, Stripe customer and subscription ids). The app
--    reads the view only through the service-role client
--    (src/lib/entitlements.ts), which bypasses RLS regardless, so making the
--    view run as the caller changes nothing for the app and closes the leak
--    for everyone else.
alter view public.user_entitlement set (security_invoker = true);
revoke all on public.user_entitlement from public, anon;
grant select on public.user_entitlement to authenticated, service_role;

-- 2. increment_syllabus_upload_count is SECURITY DEFINER, takes an arbitrary
--    user id, and inherited Supabase's default EXECUTE grant to anon and
--    authenticated, so any caller could insert or bump the
--    integration_credentials row of any user. Its only caller is the
--    service-role client in /api/syllabus/extract.
revoke all on function public.increment_syllabus_upload_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_syllabus_upload_count(uuid) to service_role;
