ALTER TABLE integration_credentials
  ADD COLUMN IF NOT EXISTS email_digest_hour INTEGER NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS email_digest_address TEXT DEFAULT NULL;
