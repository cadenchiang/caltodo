-- Add email digest preference to integration_credentials.
-- Defaults to true so existing users get the digest unless they opt out.
ALTER TABLE integration_credentials
  ADD COLUMN IF NOT EXISTS email_digest_enabled BOOLEAN NOT NULL DEFAULT true;
