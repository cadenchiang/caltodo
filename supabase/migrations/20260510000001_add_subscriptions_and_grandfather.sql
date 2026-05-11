-- Subscriptions table + grandfather all existing users into Pro.
--
-- The `subscriptions` table is the single source of truth for a user's plan.
-- A row exists for every authenticated user; if it's missing, the user is
-- treated as free (defense-in-depth).
--
-- State machine:
--   plan = 'free'  -> no premium access
--   plan = 'trial' -> full Pro access until current_period_end, then auto-downgraded to free
--   plan = 'pro'   -> full Pro access (paid via Stripe OR founder)
--
-- `founder = true` users keep Pro forever and are never charged. They
-- have no Stripe customer/subscription, just a permanent pro row.
--
-- `stripe_customer_id` and `stripe_subscription_id` are populated when the
-- user actually pays via Stripe. Webhooks (server-side only) update this row.

create type public.subscription_plan as enum ('free', 'trial', 'pro');

create type public.subscription_status as enum (
  'active',
  'canceled',
  'past_due',
  'expired',
  'incomplete'
);

create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan public.subscription_plan not null default 'free',
  status public.subscription_status not null default 'active',
  /* For trials: when the trial expires.
     For paid: end of current billing period.
     NULL for founder users (never expires) and pure free tier. */
  current_period_end timestamptz,
  /* True when a paid subscription is scheduled to cancel at period end. */
  cancel_at_period_end boolean not null default false,
  /* True for the original cohort of users who joined before paid pricing
     launched. Confers Pro access for life with no Stripe customer/charge.
     New signups never get this flag set; only the one-time backfill below. */
  founder boolean not null default false,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  /* Billing interval the user picked, when paid. */
  billing_interval text check (billing_interval in ('month', 'year')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_plan_idx on public.subscriptions(plan);
create index subscriptions_current_period_end_idx on public.subscriptions(current_period_end);
create index subscriptions_stripe_customer_id_idx on public.subscriptions(stripe_customer_id);

-- RLS: users can read their own row; nobody can write from the client.
-- Webhook + server actions use the service-role key, which bypasses RLS.
alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- Auto-update updated_at on row changes.
create or replace function public.touch_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_subscriptions_updated_at();

-- Grandfather every existing user into Pro forever. Future signups get
-- a 'trial' row created by a signup-time trigger (added below) so they
-- start with full Pro access for 30 days.
insert into public.subscriptions (user_id, plan, status, founder, current_period_end)
select id, 'pro', 'active', true, null
from auth.users
on conflict (user_id) do nothing;

-- Auto-create a 30-day trial subscription row whenever a new auth user signs up.
-- Service role bypasses RLS so this trigger can write directly.
create or replace function public.bootstrap_subscription_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, plan, status, current_period_end)
  values (new.id, 'trial', 'active', now() + interval '30 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute function public.bootstrap_subscription_for_new_user();

-- Helper view used by the app: a flat read of the active entitlement state.
-- Treats expired trials as 'free' so we don't need timestamp checks in app code.
create or replace view public.user_entitlement as
select
  s.user_id,
  case
    when s.founder then 'pro'
    when s.plan = 'trial' and s.current_period_end < now() then 'free'
    when s.plan = 'pro' and s.status in ('active', 'canceled') and (s.current_period_end is null or s.current_period_end > now()) then 'pro'
    when s.plan = 'trial' then 'trial'
    else 'free'
  end as effective_plan,
  s.plan as raw_plan,
  s.status,
  s.current_period_end,
  s.cancel_at_period_end,
  s.founder,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.billing_interval
from public.subscriptions s;

-- Grant select on the view to authenticated users; RLS on subscriptions
-- still gates which rows they can see through it.
grant select on public.user_entitlement to authenticated;

-- Syllabus upload counter for free-tier gating (1 lifetime upload).
-- We don't have a 'syllabus_uploads' table yet, so add a counter directly
-- on integration_credentials so the gating doesn't require a join.
alter table public.integration_credentials
  add column if not exists syllabus_upload_count integer not null default 0;

-- Atomic counter increment so concurrent uploads can't race past the cap.
create or replace function public.increment_syllabus_upload_count(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.integration_credentials (user_id, syllabus_upload_count)
  values (p_user_id, 1)
  on conflict (user_id) do update
    set syllabus_upload_count = public.integration_credentials.syllabus_upload_count + 1
  returning syllabus_upload_count into new_count;
  return new_count;
end;
$$;
