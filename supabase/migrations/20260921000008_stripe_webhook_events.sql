-- Records every Stripe webhook event id the handler has accepted, so a
-- redelivered event (Stripe retries on any non-2xx, and can also deliver
-- twice) cannot be applied twice. Audit M17.
--
-- Written only by the webhook route with the service-role key. RLS is on
-- with no policies, so no end-user role can read or write it.

create table public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;

-- Lets a cleanup of old rows run without a full scan.
create index stripe_webhook_events_received_at_idx
  on public.stripe_webhook_events(received_at);

comment on table public.stripe_webhook_events is
  'Idempotency log for /api/stripe/webhook: one row per processed Stripe event id. Rows older than 30 days can be deleted.';
