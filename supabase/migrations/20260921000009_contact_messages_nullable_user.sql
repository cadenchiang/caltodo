-- Lets logged-out visitors use the contact form. Audit L1.
--
-- /api/contact inserts user_id NULL for anonymous submissions (via the
-- service role, since they have no session), but the column was NOT NULL,
-- so every logged-out submission failed with a 500. Anonymous rows keep
-- the email the visitor typed, which the route already requires.

alter table public.contact_messages
  alter column user_id drop not null;

-- The insert policy is unchanged: an end-user role can still only insert
-- a row carrying its own uid, so anonymous rows can only come from the
-- server route.
