-- Add Google account profile fields for display in settings UI
ALTER TABLE integration_credentials
  ADD COLUMN IF NOT EXISTS google_email TEXT,
  ADD COLUMN IF NOT EXISTS google_photo_url TEXT;
