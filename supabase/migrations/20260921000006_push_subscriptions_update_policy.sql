-- L2 (2026-09-21 audit): push_subscriptions had SELECT/INSERT/DELETE policies
-- but no UPDATE policy, so the re-subscribe upsert in push/subscribe
-- (onConflict: "endpoint") failed under RLS the moment a browser re-registered
-- an endpoint it already had. Scoped to the owning user on both the existing
-- row and the new row, so a user cannot move a subscription onto another
-- user's id.

drop policy if exists "Users update own push subscriptions" on public.push_subscriptions;

create policy "Users update own push subscriptions"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
